import { OtpCard } from '@/features/auth'

// Prevent static prerendering — OTP page relies on dynamic route state
export const dynamic = 'force-dynamic'

export default function OtpPage() {
  return <OtpCard />
}
