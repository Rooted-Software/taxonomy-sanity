import Link from 'next/link'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { UserVirtuousAuthForm } from '@/components/user-virtuous-auth-form'

export const metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
}

export default function RegisterPage() {
  return (
    <div className="container grid w-screen  flex-col items-center bg-dark  pt-48 lg:max-w-none lg:grid-cols-1 lg:px-0">
      <Link
        href="/login?from=/dashboard"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 text-white md:right-8 md:top-8'
        )}
      >
        Login
      </Link>
      <div className="bg-dark text-white lg:p-8">
        <div className="m-auto flex w-full flex-col justify-center space-y-6 ">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Let&apos;s get started
            </h1>
            <p className="mb-8 pb-8 text-lg text-white">
              (Don&apos;t worry, if you run into any issues, we are here to
              help.)
            </p>
            <p className="justify-left text-lg text-white">
              <span className="text-accent-1">STEP 1:</span> Log into your
              Virtuous account to begin the process.
            </p>
          </div>
          <UserVirtuousAuthForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link
              href="/terms.html"
              className="underline underline-offset-4 hover:text-brand"
              target="_blank"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-brand"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
      <div className=" absolute bottom-0 left-0 w-full items-center justify-center bg-background p-8">
        <div className="relative left-[5%] top-[72px]  m-auto ml-4 w-[90%] bg-[#E8F1FB]">
          <div className="advance-step1 w-[10%] rounded-xl border-[20px] border-b border-accent-1 "></div>
        </div>
        <div className="w-100 m-auto ml-8 p-8">
          <ol className="flex w-full items-center">
            <li className="after:width:110% flex w-full items-center rounded-3xl text-dark after:inline-block after:h-1 after:w-full after:border-[0px] after:content-['']">
              <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-white drop-shadow-lg dark:bg-blue-800 lg:h-[60px] lg:w-[60px]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-1 dark:bg-blue-800 lg:h-[50px] lg:w-[50px]">
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
                      fill="#6BE4BC"
                    />
                  </svg>
                </span>
              </span>
            </li>
            <li className="after: flex w-full items-center rounded-3xl text-dark after:inline-block after:h-1 after:w-full after:content-['']">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tightWhite drop-shadow-lg dark:bg-blue-800 lg:h-12 lg:w-12">
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
                      fill="#E8F1FB"
                    />
                  </svg>
                </span>
              </span>
            </li>
            <li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full  after:content-['']">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tightWhite drop-shadow-lg dark:bg-blue-800 lg:h-12 lg:w-12">
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
                      fill="#E8F1FB"
                    />
                  </svg>
                </span>
              </span>
            </li>
            <li className="flex w-full items-center text-dark after:inline-block after:h-1 after:w-full after:content-['']">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tightWhite drop-shadow-lg dark:bg-blue-800 lg:h-12 lg:w-12">
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
                      fill="#E8F1FB"
                    />
                  </svg>
                </span>
              </span>
            </li>
            <li className="flex items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 lg:h-12 lg:w-12">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5 text-gray-500 dark:text-gray-100 lg:h-6 lg:w-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
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
