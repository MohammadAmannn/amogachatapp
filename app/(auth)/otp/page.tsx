import { Otp } from '@/features/auth/otp'

// Prevent static prerendering — OTP page relies on dynamic route state
export const dynamic = 'force-dynamic'

export default function OtpPage() {
  return <Otp />
}
