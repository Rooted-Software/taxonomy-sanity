import * as React from 'react'

import { Stepper } from '@/components/stepper'

interface WizardLayoutProps {
  children: React.ReactNode
}

export default function WizardLayout({ children }: WizardLayoutProps) {
  return (
    <div className="h-screen min-h-screen bg-dark text-white">
      <div className="flex h-screen w-screen flex-col items-center">
        <div className="mt-8 md:my-auto">{children}</div>

        <div className=" w-full">
          <Stepper />
        </div>
      </div>
    </div>
  )
}
