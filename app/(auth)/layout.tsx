import { Suspense } from 'react'
interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="min-h-screen"><Suspense fallback={null}>{children}</Suspense></div>
}
