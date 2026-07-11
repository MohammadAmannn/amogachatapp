import { promises as fs } from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { EmailTemplate } from './email-compiler'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

const TEMPLATES_FILE = path.join(process.cwd(), 'src/features/email-template/data/templates.json')

async function ensureFileExists() {
  try {
    await fs.mkdir(path.dirname(TEMPLATES_FILE), { recursive: true })
    await fs.access(TEMPLATES_FILE)
  } catch {
    await fs.writeFile(TEMPLATES_FILE, '[]', 'utf-8')
  }
}

async function readFromLocalFile(): Promise<EmailTemplate[]> {
  try {
    await ensureFileExists()
    const raw = await fs.readFile(TEMPLATES_FILE, 'utf-8')
    return JSON.parse(raw) as EmailTemplate[]
  } catch (e) {
    console.error('Failed to read email templates file:', e)
    return []
  }
}

async function writeToLocalFile(templates: EmailTemplate[]): Promise<boolean> {
  try {
    await ensureFileExists()
    await fs.writeFile(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf-8')
    return true
  } catch (e) {
    console.error('Failed to write email templates file:', e)
    return false
  }
}

export async function getTemplates(): Promise<EmailTemplate[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('updated_at', { ascending: false })
      
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          subject: d.subject,
          headerLogo: d.header_logo,
          headerText: d.header_text,
          bodyContent: d.body_content,
          buttonText: d.button_text,
          buttonUrl: d.button_url,
          footerText: d.footer_text,
          primaryColor: d.primary_color,
          bgColor: d.bg_color,
          textColor: d.text_color,
        }))
      }
      console.warn('Supabase fetch failed or error returned, falling back to local file:', error)
    } catch (e) {
      console.error('Supabase fetch exception, falling back:', e)
    }
  }
  return readFromLocalFile()
}

export async function saveTemplate(template: Omit<EmailTemplate, 'id'> & { id?: string }): Promise<EmailTemplate | null> {
  const id = template.id || crypto.randomUUID()
  const now = new Date().toISOString()
  
  const record = {
    id,
    name: template.name,
    subject: template.subject,
    header_logo: template.headerLogo || null,
    header_text: template.headerText || null,
    body_content: template.bodyContent,
    button_text: template.buttonText || null,
    button_url: template.buttonUrl || null,
    footer_text: template.footerText || null,
    primary_color: template.primaryColor || '#4f46e5',
    bg_color: template.bgColor || '#f9fafb',
    text_color: template.textColor || '#1f2937',
  }

  let savedInSupabase = false
  if (supabase) {
    try {
      const { error } = await supabase
        .from('email_templates')
        .upsert({
          ...record,
          updated_at: now
        })
      if (!error) {
        savedInSupabase = true
        console.log('Saved email template in Supabase successfully:', id)
      } else {
        console.error('Supabase save error:', error)
      }
    } catch (e) {
      console.error('Supabase save exception:', e)
    }
  }

  // Always write to local file as secondary backup / fallback
  const localTemplates = await readFromLocalFile()
  const existingIdx = localTemplates.findIndex((t) => t.id === id)
  
  const savedTemplate: EmailTemplate = {
    id,
    ...template
  }

  if (existingIdx >= 0) {
    localTemplates[existingIdx] = savedTemplate
  } else {
    localTemplates.unshift(savedTemplate)
  }
  
  await writeToLocalFile(localTemplates)
  return savedTemplate
}

export async function deleteTemplate(id: string): Promise<boolean> {
  let deletedFromSupabase = false
  if (supabase) {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id)
      if (!error) {
        deletedFromSupabase = true
        console.log('Deleted email template in Supabase:', id)
      } else {
        console.error('Supabase delete error:', error)
      }
    } catch (e) {
      console.error('Supabase delete exception:', e)
    }
  }

  const localTemplates = await readFromLocalFile()
  const filtered = localTemplates.filter((t) => t.id !== id)
  const deletedFromLocal = await writeToLocalFile(filtered)
  
  return deletedFromSupabase || deletedFromLocal
}
