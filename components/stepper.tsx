'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {}

const pathValues = {
  register: 0,
  signUp: 0,
  step1: 2,
  step1b: 3,
  step2: 5,
  step3: 10,
  step4: 15,
  step4b: 20,
  step5: 25,
  step6: 50,
  step7: 75,
  step8: 100,
}

export function Stepper({ className, ...props }: StepperProps) {
  const [percent, setPercent] = React.useState(0)
  const path = usePathname()
  path?.replace(/\//g, '')
  console.log('stepper path', path)

  useEffect(() => {
    if (path) {
      setPercent(pathValues[path.replace(/\//g, '')])
    }
    console.log('stepper percent', percent)
  }, [path, percent])

  return (
    <div className="hidden w-full items-center justify-center bg-white p-0 md:block">
      <div className="mx-auto lg:w-2/3">
        <div className="relative top-[50px] left-[10%] m-auto  ml-4 w-[80%] bg-[#E8F1FB] xl:top-[50px] 2xl:left-[5%] 2xl:w-[90%]">
          <div
            className={`advanceTransition  rounded-xl border-[20px] border-b border-accent-1`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <div className="w-100 m-auto ml-8 py-2 px-8">
          <ol className="flex w-full items-center">
            <li className="after:width:110% flex w-full items-center rounded-3xl text-dark after:inline-block after:h-1 after:w-full after:border-[0px] after:content-['']">
              <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-white drop-shadow-lg dark:bg-blue-800 lg:h-[60px] lg:w-[60px] ">
                <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-accent-1 dark:bg-blue-800 lg:h-[50px] lg:w-[50px]">
                  <svg
                    x="16"
                    y="18"
                    width="16"
                    height="13"
                    viewBox="0 0 16 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5233 0L6 7.71133L2.476 4.37067L0 6.848L6 12.6667L16 2.47667L13.5233 0Z"
                      fill={percent >= 0 ? '#6BE4BC' : '#E8F1FB'}
                    />
                  </svg>
                </span>
              </span>
            </li>
            <li className="after: flex w-full items-center rounded-3xl text-dark after:inline-block after:h-1 after:w-full after:content-['']">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  percent >= 25 ? 'bg-accent-1' : 'tightWight'
                } drop-shadow-lg dark:bg-blue-800 lg:h-12 lg:w-12`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white  dark:bg-blue-800 lg:h-9 lg:w-9">
                  <svg
                    x="16"
                    y="18"
                    width="16"
                    height="13"
                    viewBox="0 0 16 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5233 0L6 7.71133L2.476 4.37067L0 6.848L6 12.6667L16 2.47667L13.5233 0Z"
                      fill={percent >= 25 ? '#6BE4BC' : '#E8F1FB'}
                    />
                  </svg>
                </span>
              </span>
            </li>
            <li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full  after:content-['']">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  percent >= 50 ? 'bg-accent-1' : 'tightWight'
                } drop-shadow-lg dark:bg-blue-800 lg:h-12 lg:w-12`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-blue-800 lg:h-9 lg:w-9">
                  <svg
                    x="16"
                    y="18"
                    width="16"
                    height="13"
                    viewBox="0 0 16 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5233 0L6 7.71133L2.476 4.37067L0 6.848L6 12.6667L16 2.47667L13.5233 0Z"
                      fill={percent >= 50 ? '#6BE4BC' : '#E8F1FB'}
                    />
                  </svg>
                </span>
              </span>
            </li>
            <li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full after:content-['']">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  percent >= 75 ? 'bg-accent-1' : 'tightWight'
                } drop-shadow-lg dark:bg-blue-800 lg:h-12 lg:w-12`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-blue-800 lg:h-9 lg:w-9">
                  <svg
                    x="16"
                    y="18"
                    width="16"
                    height="13"
                    viewBox="0 0 16 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5233 0L6 7.71133L2.476 4.37067L0 6.848L6 12.6667L16 2.47667L13.5233 0Z"
                      fill={percent >= 75 ? '#6BE4BC' : '#E8F1FB'}
                    />
                  </svg>
                </span>
              </span>
            </li>
            <li className="flex items-center">
              <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-white text-white drop-shadow-lg dark:bg-blue-800 lg:h-[60px] lg:w-[60px]">
                <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-accent-1 dark:bg-blue-800 lg:h-[50px] lg:w-[50px]">
                  {percent}%
                </span>
              </span>
            </li>
          </ol>
          <ol className="flex w-full items-center">
            <li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full  after:content-['']">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center  dark:bg-blue-800 lg:h-12 lg:w-12">
                <span className="flex shrink-0 items-center justify-center rounded-full bg-white font-bold ">
                  System Connect
                </span>
              </span>
            </li>
            <li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full  after:content-['']">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center  dark:bg-blue-800 lg:h-12 lg:w-12">
                <span className="flex shrink-0 items-center justify-center rounded-full bg-white font-bold ">
                  Data Mapping
                </span>
              </span>
            </li>
            <li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full  after:content-['']">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center  dark:bg-blue-800 lg:h-12 lg:w-12">
                <span className="flex shrink-0 items-center justify-center rounded-full bg-white font-bold ">
                  Data Review
                </span>
              </span>
            </li>
            <li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full  after:content-['']">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center  dark:bg-blue-800 lg:h-12 lg:w-12">
                <span className="flex shrink-0 items-center justify-center rounded-full bg-white font-bold ">
                  Sync First Batch
                </span>
              </span>
            </li>
            <li className="flex  items-center text-dark after:inline-block after:h-1 after:content-['']">
              <span className="flex h-10 w-10  items-center justify-center  dark:bg-blue-800 lg:h-12 lg:w-12">
                <span className="flexitems-center justify-center rounded-full bg-white font-bold ">
                  Complete
                </span>
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
