import { Suspense } from 'react'
import { SignUp } from '@/features/auth/sign-up'

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUp />
    </Suspense>
  )
}
