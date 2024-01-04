import * as React from 'react'

import { Stepper } from '@/components/stepper'

interface WizardLayoutProps {
  children: React.ReactNode
}

export default function WizardLayout({ children }: WizardLayoutProps) {
  return (
    <div className="h-screen min-h-screen bg-dark text-white">
      <div className="flex h-screen w-screen flex-col items-center">
        <div className="h-0 w-full flex-1">{children}</div>
        <Stepper />
      </div>
    </div>
  )
}
