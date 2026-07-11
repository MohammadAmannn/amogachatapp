import { NotFoundError } from '@/features/errors/not-found-error'

// Force dynamic rendering to avoid prerender crash from client providers (GoogleOAuthProvider etc.)
// during static generation of /_not-found. The 404 page is always served at request time anyway.
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return <NotFoundError />
}
