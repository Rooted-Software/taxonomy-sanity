import * as React from 'react'

import { Stepper } from '@/components/stepper'

interface WizardLayoutProps {
  children: React.ReactNode
}

export default function WizardLayout({ children }: WizardLayoutProps) {
  return (
    <div className="h-screen min-h-screen bg-dark">
      <div className="flex h-full w-screen flex-col items-center">
        <div className="flex h-0 flex-1 flex-col justify-center overflow-auto text-white">
          {children}
        </div>
        <Stepper />
      </div>
    </div>
  )
}
