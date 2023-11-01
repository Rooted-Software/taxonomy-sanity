import * as React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="h-screen min-h-screen bg-dark">{children}</div>
}
