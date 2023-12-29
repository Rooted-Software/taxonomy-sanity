import * as React from 'react'

import { Stepper } from '@/components/stepper'

interface WizardLayoutProps {
  children: React.ReactNode
}

export default function WizardLayout({ children }: WizardLayoutProps) {
  return (
    <div className="h-screen min-h-screen bg-dark">
      <div className="flex h-full flex-col items-center">
        <div className="flex flex-1 flex-col text-white">
          <div className="my-auto">{children}</div>
        </div>
        <Stepper />
      </div>
    </div>
  )
}
