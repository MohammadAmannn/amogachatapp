-- Create the short_urls table
CREATE TABLE IF NOT EXISTS public.short_urls (
    id text PRIMARY KEY,
    target_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.short_urls ENABLE ROW LEVEL SECURITY;

-- Allow anonymous select access (anyone can resolve a redirect)
CREATE POLICY "Allow public read access" ON public.short_urls
    FOR SELECT USING (true);

-- Allow anonymous insert access (anyone can create a shortened link)
CREATE POLICY "Allow public insert access" ON public.short_urls
    FOR INSERT WITH CHECK (true);

-- Create clicks table for link tracking
CREATE TABLE IF NOT EXISTS public.clicks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id text NOT NULL REFERENCES public.short_urls(id) ON DELETE CASCADE,
    clicked_at timestamp with time zone DEFAULT now() NOT NULL,
    country text,
    city text,
    region text,
    device text,
    os text,
    browser text,
    referrer text,
    referrer_raw text,
    user_agent text,
    qr boolean DEFAULT false
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- Allow public select/read access to clicks
CREATE POLICY "Allow public select" ON public.clicks
    FOR SELECT USING (true);

-- Allow public insert access to clicks (required for serverless redirect logging)
CREATE POLICY "Allow public insert" ON public.clicks
    FOR INSERT WITH CHECK (true);

-- Create shares table to log when a link is shared
CREATE TABLE IF NOT EXISTS public.shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id text NOT NULL REFERENCES public.short_urls(id) ON DELETE CASCADE,
    shared_at timestamp with time zone DEFAULT now() NOT NULL,
    platform text NOT NULL, -- 'whatsapp', 'linkedin', 'twitter', 'gmail', etc.
    user_agent text
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;

-- Allow public select
CREATE POLICY "Allow public select" ON public.shares FOR SELECT USING (true);

-- Allow public insert (log shares from frontend)
CREATE POLICY "Allow public insert" ON public.shares FOR INSERT WITH CHECK (true);

-- Create profiles table linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY,
    name text,
    username text,
    avatar text,
    email text,
    company text,
    mobile text,
    status text DEFAULT 'offline',
    online boolean DEFAULT false,
    offline boolean DEFAULT true,
    last_seen timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read profiles
CREATE POLICY "Authenticated users can read profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Create a function to handle new user insertion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  old_user_id uuid;
BEGIN
  -- Search for existing profile with the same email
  SELECT id INTO old_user_id FROM public.profiles WHERE email = new.email LIMIT 1;

  IF old_user_id IS NOT NULL THEN
    -- Reconcile only if the ID has changed (new UUID assigned by auth)
    IF old_user_id <> new.id THEN
      -- A. Create a temporary profile with the new UUID to satisfy foreign key constraints during reference migration
      INSERT INTO public.profiles (id, name, email, avatar, company, mobile, status, online, offline, last_seen, updated_at)
      SELECT new.id, name, email, avatar, company, mobile, status, online, offline, last_seen, updated_at
      FROM public.profiles
      WHERE id = old_user_id;

      -- B. Update foreign key references in other tables to point to the new UUID
      
      -- Update conversation members
      UPDATE public.conversation_members SET user_id = new.id WHERE user_id = old_user_id;
      
      -- Update chat messages
      UPDATE public.chat_messages SET owner_user_id = new.id WHERE owner_user_id = old_user_id;
      UPDATE public.chat_messages SET sender_user_id = new.id WHERE sender_user_id = old_user_id;
      UPDATE public.chat_messages SET deleted_by = new.id WHERE deleted_by = old_user_id;
      UPDATE public.chat_messages SET replyto_user_id = new.id WHERE replyto_user_id = old_user_id;
      UPDATE public.chat_messages SET forwardto_user_id = new.id WHERE forwardto_user_id = old_user_id;
      
      -- Update contacts
      UPDATE public.contacts SET contact_user_id = new.id WHERE contact_user_id = old_user_id;
      UPDATE public.contacts SET owner_id = new.id WHERE owner_id = old_user_id;

      -- C. Delete the old profile record safely
      DELETE FROM public.profiles WHERE id = old_user_id;
    END IF;
  ELSE
    -- If no profile exists, create a new one normally
    INSERT INTO public.profiles (id, name, email, avatar)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email,
      new.raw_user_meta_data->>'avatar_url'
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text, -- NULL for 1-to-1 chats, group name for group chats
    is_group boolean NOT NULL DEFAULT false,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create conversation_members junction table
CREATE TABLE IF NOT EXISTS public.conversation_members (
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    unread_count integer DEFAULT 0 NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    message text NOT NULL,
    timestamp timestamp with time zone DEFAULT now() NOT NULL,
    is_read boolean DEFAULT false NOT NULL
);

-- Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_members_profile ON public.conversation_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, timestamp DESC);

-- Create a security helper function to check membership without RLS recursion
CREATE OR REPLACE FUNCTION public.is_conversation_member(convo_id uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = convo_id AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can select conversations they belong to" ON public.conversations
    FOR SELECT USING (public.is_conversation_member(id, auth.uid()));

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can manage conversations" ON public.conversations
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can see members of their conversations" ON public.conversation_members
    FOR SELECT USING (public.is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "Users can add members" ON public.conversation_members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can leave conversations" ON public.conversation_members
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Members can view conversation messages" ON public.messages
    FOR SELECT USING (public.is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "Members can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        public.is_conversation_member(conversation_id, auth.uid())
    );

-- Add to Realtime Publication
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.conversation_members;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.profiles;

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    contact_user_id uuid REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    nickname text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow users to read only their own contacts
CREATE POLICY "Users can view their own contacts" ON public.contacts
    FOR SELECT TO authenticated USING (auth.uid() = owner_id);

-- Allow users to add their own contacts
CREATE POLICY "Users can add their own contacts" ON public.contacts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

-- Allow users to update their own contacts
CREATE POLICY "Users can update their own contacts" ON public.contacts
    FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- Allow users to delete their own contacts
CREATE POLICY "Users can delete their own contacts" ON public.contacts
    FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Create chat_group table
CREATE TABLE IF NOT EXISTS public.chat_group (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    image_url text,
    users jsonb NOT NULL DEFAULT '[]'::jsonb, -- array of user names/emails/ids
    status text NOT NULL DEFAULT 'Active',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on chat_group
ALTER TABLE public.chat_group ENABLE ROW LEVEL SECURITY;

-- Allow public read access to chat_group
CREATE POLICY "Allow public read access to chat_group" ON public.chat_group
    FOR SELECT USING (true);

-- Allow public insert access to chat_group
CREATE POLICY "Allow public insert access to chat_group" ON public.chat_group
    FOR INSERT WITH CHECK (true);

-- Allow public update access to chat_group
CREATE POLICY "Allow public update access to chat_group" ON public.chat_group
    FOR UPDATE USING (true);

-- Allow public delete access to chat_group
CREATE POLICY "Allow public delete access to chat_group" ON public.chat_group
    FOR DELETE USING (true);

-- Add to Realtime Publication
alter publication supabase_realtime add table public.contacts;
alter publication supabase_realtime add table public.chat_group;

-- Create the chat-files storage bucket (if not already existing)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for public access to chat-files
CREATE POLICY "Allow public read access to chat-files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files');

CREATE POLICY "Allow public insert access to chat-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-files');

-- Drop old tables if they exist
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.conversation_members CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Create conversations table supporting group channels and messaging groups
CREATE TABLE public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL CHECK (type IN ('direct', 'group', 'channel_group', 'message_group')),
    name text, -- NULL for direct, name for group
    image text, -- avatar/image url
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create conversation_members table with unread_count
CREATE TABLE public.conversation_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    role text DEFAULT 'member' NOT NULL,
    unread_count integer DEFAULT 0 NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT unique_conversation_member UNIQUE (conversation_id, user_id)
);

-- Create chat_messages table where every row belongs to ONE user copy
CREATE TABLE public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    owner_user_id uuid REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    sender_user_id uuid REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL,
    message text,
    message_type text NOT NULL DEFAULT 'text',
    direction text NOT NULL CHECK (direction IN ('Sent', 'Received')),
    sent boolean DEFAULT false NOT NULL,
    received boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    
    -- Attachments
    file_url text,
    file_name text,
    file_size bigint,
    mime_type text,
    duration integer,
    thumbnail text,
    
    -- Actions
    thumb boolean DEFAULT false NOT NULL,
    favorite boolean DEFAULT false NOT NULL,
    flag boolean DEFAULT false NOT NULL,
    star boolean DEFAULT false NOT NULL,
    pin boolean DEFAULT false NOT NULL,
    archive boolean DEFAULT false NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    action_this boolean DEFAULT false NOT NULL,
    reply boolean DEFAULT false NOT NULL,
    forward boolean DEFAULT false NOT NULL,
    
    -- Delete info
    deleted_at timestamp with time zone,
    deleted_by uuid REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL,
    
    -- Reply Metadata
    replyemoji text,
    replyto_message_id uuid,
    replyto_user_id uuid REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL,
    parent_message_id uuid,
    
    -- Forward Metadata
    forwardemoji text,
    forwardto_message_id uuid,
    forwardto_user_id uuid REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL,
    
    -- Lineage Metadata (points to original sender's copy ID to link copies)
    sender_message_id uuid
);

-- Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON public.conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_owner_convo ON public.chat_messages(owner_user_id, conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_msg_id ON public.chat_messages(sender_message_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Conversations RLS Policies
CREATE POLICY "Allow public read access to conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to conversations" ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to conversations" ON public.conversations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to conversations" ON public.conversations FOR DELETE USING (true);

-- Conversation Members RLS Policies
CREATE POLICY "Allow public read access to conversation_members" ON public.conversation_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to conversation_members" ON public.conversation_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to conversation_members" ON public.conversation_members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to conversation_members" ON public.conversation_members FOR DELETE USING (true);

-- Chat Messages RLS Policies
CREATE POLICY "Users can view their own copies of messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can insert message copies for conversation members" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_user_id AND
        public.is_conversation_member(conversation_id, auth.uid()) AND
        public.is_conversation_member(conversation_id, owner_user_id)
    );

CREATE POLICY "Users can update their own copies of messages" ON public.chat_messages
    FOR UPDATE USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Senders can update message copies for deletion" ON public.chat_messages
    FOR UPDATE USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can delete their own copies of messages" ON public.chat_messages
    FOR DELETE USING (auth.uid() = owner_user_id);

-- Ensure Realtime is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversation_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;

-- Trigger to increment unread_count for recipients when a message copy is received
CREATE OR REPLACE FUNCTION public.increment_member_unread_count()
RETURNS trigger AS $$
BEGIN
  IF NEW.direction = 'Received' THEN
    UPDATE public.conversation_members
    SET unread_count = unread_count + 1
    WHERE conversation_id = NEW.conversation_id
    AND user_id = NEW.owner_user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_chat_message_inserted_unread
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.increment_member_unread_count();


-- Secure RPC to retrieve file metadata for document sharing.
-- Uses SECURITY DEFINER + SET search_path to bypass RLS safely.
-- Membership check is decoupled from the message query to avoid ambiguous column references.
-- All output columns are aliased with out_ prefix to avoid conflicts with RETURNS TABLE variable names.
DROP FUNCTION IF EXISTS public.get_shared_file_metadata(uuid, uuid);

CREATE OR REPLACE FUNCTION public.get_shared_file_metadata(
    p_file_id  uuid,
    p_user_id  uuid
)
RETURNS TABLE (
    out_conversation_id   uuid,
    out_file_url          text,
    out_file_name         text,
    out_file_size         bigint,
    out_mime_type         text,
    out_sender_user_id    uuid,
    out_created_at        timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_conversation_id uuid;
BEGIN
    -- Step A: Find which conversation the file belongs to (any copy, bypassing RLS)
    SELECT m.conversation_id
    INTO   v_conversation_id
    FROM   public.chat_messages m
    WHERE  (m.id = p_file_id OR m.sender_message_id = p_file_id)
    LIMIT  1;

    -- Step B: File doesn't exist at all
    IF v_conversation_id IS NULL THEN
        RETURN;
    END IF;

    -- Step C: Requesting user must be a member of that conversation
    IF NOT EXISTS (
        SELECT 1
        FROM   public.conversation_members cm
        WHERE  cm.conversation_id = v_conversation_id
          AND  cm.user_id         = p_user_id
    ) THEN
        RETURN;
    END IF;

    -- Step D: Authorized — return metadata from any copy of the message
    RETURN QUERY
    SELECT
        m.conversation_id   AS out_conversation_id,
        m.file_url          AS out_file_url,
        m.file_name         AS out_file_name,
        m.file_size         AS out_file_size,
        m.mime_type         AS out_mime_type,
        m.sender_user_id    AS out_sender_user_id,
        m.created_at        AS out_created_at
    FROM   public.chat_messages m
    WHERE  (m.id = p_file_id OR m.sender_message_id = p_file_id)
    LIMIT  1;
END;
$$;

-- Grant execute to authenticated users (RPC called with user session)
GRANT EXECUTE ON FUNCTION public.get_shared_file_metadata(uuid, uuid) TO authenticated;

