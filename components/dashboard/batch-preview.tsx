'use client'

import styles from './grid.module.css'
import { UniversalButton } from './universal-button'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import * as React from 'react'

interface BatchPreviewProps extends React.HTMLAttributes<HTMLButtonElement> {
  projects: any[]
  feAccounts: any[]
  mappings: any[]
  batches: any[]
  defaultCreditAccount?: any
  defaultDebitAccount?: any
  defaultJournal?: any
  feEnvironment?: string
  journalName?: string
  batchDaysLoaded: number
  nextBatchDays: number
  selectedBatch?: any
}

export function BatchPreview({
  projects,
  feAccounts,
  mappings,
  batches,
  className,
  defaultCreditAccount,
  defaultDebitAccount,
  defaultJournal,
  feEnvironment,
  journalName,
  batchDaysLoaded,
  nextBatchDays,
  selectedBatch,
  ...props
}: BatchPreviewProps) {
  const router = useRouter()
  const pathname = usePathname()

  function advanceStep() {
    if (pathname === '/step6') {
      router.push('/step8')
    } else {
      router.push('/dashboard')
    }
  }

  const [isSyncing, setIsSyncing] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [selectedBatchId, setSelectedBatchId] = React.useState<boolean>()
  useEffect(() => {
    setIsLoading(false)
    setSelectedBatchId(selectedBatch?.id)
  }, [selectedBatch])

  const [virProjectID, setVirProjectID] = React.useState<any[]>([])
  const [feAccountID, setFeAccountID] = React.useState('')
  const [feAccountObj, setFeAccountObj] = React.useState({})
  const [textFilter, setTextFilter] = React.useState('')
  const [textFeFilter, setTextFeFilter] = React.useState('')
  const [filteredProjects, setFilteredProjects] =
    React.useState<any[]>(projects)
  const [filteredAccounts, setFilteredAccounts] =
    React.useState<any[]>(feAccounts)

  // Project filters
  const [filterProjectName, setFilterProjectName] =
    React.useState<boolean>(true)
  const [filterProjectCode, setFilterProjectCode] =
    React.useState<boolean>(true)
  const [filterOnlineDisplayName, setFilterOnlineDisplayName] =
    React.useState<boolean>(false)
  const [filterExternalAccountingCode, setFilterExternalAccountingCode] =
    React.useState<boolean>(true)
  const [filterDescription, setFilterDescription] =
    React.useState<boolean>(true)
  const [filterIsActive, setFilterIsActive] = React.useState<boolean>(true)
  const [filterIsPublic, setFilterIsPublic] = React.useState<boolean>(false)
  const [filterIsTaxDeductible, setFilterIsTaxDeductible] =
    React.useState<boolean>(false)
  const [filterCase, setFilterCase] = React.useState<boolean>(false)

  // Account filters
  const [filterAccountId, setFilterAccountId] = React.useState<boolean>(true)
  const [filterAccountDescription, setFilterAccountDescription] =
    React.useState<boolean>(true)
  const [filterAccountNumber, setFilterAccountNumber] =
    React.useState<boolean>(true)
  const [filterFeCase, setFilterFeCase] = React.useState<boolean>(false)

  const searchParams = useSearchParams()

  const {
    gifts,
    synced,
    batch_name: batchName,
  } = selectedBatch ?? { gifts: [] }
  const batchCredits = gifts.reduce((total, gift) => total + gift.amount, 0)

  function lookupAccount(accountId) {
    const account = feAccounts.find((a) => a.account_id === accountId)
    return <span className="">{account?.description}</span>
  }

  function lookupBatch(tempBatchId) {
    const batch = batches.find((a) => a.id === tempBatchId)
    return batch
  }

  function lookupMapping(projectId: number) {
    const project = projects.find((p) => p.id === projectId)
    const mapping = mappings.find((m) => m.virProjectId === projectId)
    console.log(mapping)
    if (!mapping) {
      return (
        <span className="">
          {project.name} <br />
          <Icons.arrowRight className="mr-2 inline h-4 w-4" />{' '}
          {lookupAccount(parseInt(defaultCreditAccount))} (default)
        </span>
      )
    }
    return (
      <span className="">
        {project?.name ?? mapping.virProjectName} <br />
        <Icons.arrowRight className="mr-2 inline h-4 w-4 " />{' '}
        {lookupAccount(mapping.feAccountId)}
      </span>
    )
  }

  useEffect(() => {
    filterProjects(textFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappings, virProjectID])

  function filterProjects(value) {
    if (!filterCase) {
      value = value.toLowerCase()
    }
    if (
      value === '' ||
      value.length === 0 ||
      value === null ||
      value === undefined
    ) {
      setFilteredProjects(
        projects.filter((project) => {
          if (filterIsActive) {
            if (project.isActive !== true) {
              return false
            }
          }
          if (filterIsPublic) {
            if (project.isPublic !== true) {
              return false
            }
          }
          if (filterIsTaxDeductible) {
            if (project.isTaxDeductible !== true) {
              return false
            }
          }
          if (mappings.find((mapping) => mapping.virProjectId === project.id)) {
            return false
          }
          return true
        })
      )
    } else {
      setFilteredProjects(
        projects.filter((project) => {
          if (filterIsActive) {
            if (project.isActive !== true) {
              return false
            }
          }
          if (filterIsPublic) {
            if (project.isPublic !== true) {
              return false
            }
          }
          if (filterIsTaxDeductible) {
            if (project.isTaxDeductible !== true) {
              return false
            }
          }
          let wholeString = ''
          if (filterProjectName) {
            wholeString = wholeString + project.name
          }
          if (filterProjectCode) {
            wholeString = wholeString + project.projectCode
          }
          if (filterExternalAccountingCode) {
            wholeString = wholeString + project.externalAccountingCode
          }
          if (filterOnlineDisplayName) {
            wholeString = wholeString + project.onlineDisplayName
          }

          if (filterDescription) {
            wholeString = wholeString + project.description
          }
          if (!filterCase) {
            wholeString = wholeString.toLowerCase()
          }
          if (mappings.find((mapping) => mapping.virProjectId === project.id)) {
            return false
          }

          return wholeString.includes(value)
        })
      )
    }
  }

  function filterFeAccounts(value) {
    if (!filterFeCase) {
      value = value.toLowerCase()
    }
    if (
      value === '' ||
      value.length === 0 ||
      value === null ||
      value === undefined
    ) {
      setFilteredAccounts(feAccounts)
    } else {
      setFilteredAccounts(
        feAccounts.filter((account) => {
          let wholeString = ''
          if (filterAccountId) {
            wholeString = wholeString + account.account_id
          }
          if (filterAccountNumber) {
            wholeString = wholeString + account.account_number
          }
          if (filterAccountDescription) {
            wholeString = wholeString + account.description
          }

          if (!filterFeCase) {
            wholeString = wholeString.toLowerCase()
          }

          return wholeString.includes(value)
        })
      )
    }
  }

  async function postFE() {
    if (isSyncing) {
      return
    }
    setIsSyncing(true)

    console.log('client side sync')
    const response = await fetch('/api/reJournalEntryBatches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        batchId: selectedBatch.id,
        batchName: batchName,
        defaultJournal: defaultJournal,
      }),
    })

    if (!response?.ok) {
      if (response.status === 402) {
        return toast({
          title: 'Debug 3.',
          description: 'Your Mapping was not created.',
          variant: 'success',
        })
      }

      return toast({
        title: 'Debug 4.',
        description: 'Your batch was not synced. Please try again.',
        variant: 'success',
      })
    }

    console.log('invalidating cache')
    var data = await response.json()
    // This forces a cache invalidation.  Had to set a delay to get the new item. :)
    console.log(data)
    setTimeout(function () {
      console.log('Executed after 1 second')
      setIsSyncing(false)
      console.log(response)
      if (data.record_id && pathname === '/step6') {
        router.push(
          `/step7?batchId=${selectedBatch.id}&batchName=${batchName}&defaultJournal=${defaultJournal}&synced=${data.synced}&record_id=${data.record_id}&envid=${feEnvironment}`
        )
      }
      router.refresh()
    }, 400)
  }

  const createMoreBatchesHref = () => {
    const params = new URLSearchParams(
      searchParams ? Array.from(searchParams.entries()) : undefined
    )
    params.set('batchDays', nextBatchDays.toString())
    return `${pathname}?${params.toString()}`
  }

  const createBatchHref = (id: string) => {
    const params = new URLSearchParams(
      searchParams ? Array.from(searchParams.entries()) : undefined
    )
    params.set('batchId', id)
    return `${pathname}?${params.toString()}`
  }

  const [isLoadingMoreBatches, setIsLoadingMoreBatches] =
    React.useState<boolean>(false)
  useEffect(() => {
    setIsLoadingMoreBatches(false)
  }, [batchDaysLoaded])

  return (
    <>
      <div className="h-screen bg-dark p-4 xl:p-8">
        <h1 className="font-3xl my-0 py-0 text-3xl  text-white xl:my-4 xl:py-4">
          {pathname === '/batchManagement' ? 'Batch Management' : 'Data Review'}{' '}
        </h1>
        <div className="m-auto flex flex-col justify-center space-y-3 xl:space-y-6 ">
          <div className="w-full text-left ">
            <p className="justify-left text-lg text-white">
              <span className="text-accent-1">Batches</span>
            </p>
          </div>
          <div className="justify-stretch flex w-full flex-row">
            {batches?.length ? (
              <div
                className={`justify-left col-span-6 w-full overflow-scroll bg-whiteSmoke p-4 text-left text-dark`}
                style={{ height: '45vh' }}
              >
                {batches &&
                  batches.map((batch) => (
                    <div key={batch.id} className="flex p-1">
                      <Link
                        href={createBatchHref(batch.id)}
                        scroll={false}
                        className={`flex w-full cursor-pointer flex-row items-center p-2  ${
                          batch.id === selectedBatchId
                            ? `bg-dark text-white`
                            : `text-dark`
                        }`}
                        onClick={() => {
                          setSelectedBatchId(batch.id)
                          setIsLoading(true)
                        }}
                      >
                        <div className="flex-col">{batch.batch_name}</div>
                        <div className="w-full flex-col  text-right">
                          {' '}
                          {batch.synced ? (
                            <a
                              className="align-items-right text-xs"
                              target=""
                              href={`javascript:window.open('https://host.nxt.blackbaud.com/journalentry/${batch.reBatchNo}?envid=${feEnvironment}', 'financialEdge', 'width=1200,height=750');`}
                            >
                              {' '}
                              View in FE{' '}
                              <span className="text-accent-1">
                                &nbsp; (synced)
                              </span>
                            </a>
                          ) : (
                            <></>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                {batchDaysLoaded < 730 && (
                  <Link
                    href={createMoreBatchesHref()}
                    scroll={false}
                    className={cn(
                      `relative mt-2 inline-flex items-center rounded-full bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
                      {
                        'cursor-not-allowed opacity-60': isLoadingMoreBatches,
                      }
                    )}
                    onClick={() => setIsLoadingMoreBatches(true)}
                  >
                    {isLoadingMoreBatches && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Load more batches
                  </Link>
                )}
              </div>
            ) : (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon name="post" />
                <EmptyPlaceholder.Title className="text-white">
                  No Virtuous Projects Found
                </EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  Try adjusting the search terms, filter, or refreshing the
                  project list from virtuous.
                </EmptyPlaceholder.Description>
              </EmptyPlaceholder>
            )}
          </div>
        </div>
        <div className="mt-2">
          {batchDaysLoaded === 730 ? (
            <p>Showing batches from the two years</p>
          ) : batchDaysLoaded === 365 ? (
            <p>Showing batches from the past year</p>
          ) : (
            <p>Showing batches from the past {batchDaysLoaded} days</p>
          )}
        </div>
      </div>
      <div className="col-span-2 h-screen bg-dark p-4 xl:p-8">
        <h1 className="font-3xl my-0 py-0 text-3xl  text-white xl:my-4 xl:py-4">
          &nbsp;
        </h1>
        <div className="m-auto flex flex-col justify-center space-y-3 xl:space-y-6 ">
          <div className="w-full text-left ">
            <p className="justify-left text-lg text-white">
              <span className="text-accent-1">Gifts</span>
            </p>
          </div>
          <div className="flex w-full flex-row">
            <div
              className="justify-left col-span-6 w-full overflow-scroll bg-whiteSmoke p-4 text-left text-dark"
              style={{ height: '45vh' }}
            >
              {gifts?.length ? (
                <>
                  {!isLoading ? (
                    <>
                      <div className="grid grid-cols-9 gap-0 text-xs">
                        <div className="col-span-4 flex flex-col gap-2 p-2 pl-3">
                          <p className="text-3xl">
                            Batch # {batchName || 'TBD'}
                          </p>
                          {synced ? (
                            <a
                              className="align-items-right text-sm text-accent-1"
                              target=""
                              href={`javascript:window.open('https://host.nxt.blackbaud.com/journalentry/${selectedBatch.reBatchNo}?envid=${feEnvironment}', 'financialEdge', 'width=1200,height=750');`}
                            >
                              View in FE
                            </a>
                          ) : (
                            <></>
                          )}
                        </div>

                        <div className=" p-2  pl-3 "></div>
                        <div className=" p-2  pl-3 "></div>
                        <div className=" p-2  pl-3 "></div>

                        <div className=" p-2  pl-3 ">
                          <div className=" p-2  pl-3 text-right">
                            Total debit
                            <br />${batchCredits.toFixed(2)}
                          </div>
                          <div className=" p-2  pl-3 text-right">
                            Total credit
                            <br />${batchCredits.toFixed(2)}
                          </div>
                          <div className=" p-2  pl-3 text-right">
                            Balance
                            <br />
                            $0.00
                          </div>
                        </div>
                        <div className=" p-2  pl-3 ">
                          <div className=" p-2  pl-3 ">
                            Status
                            <br />
                            Open
                          </div>
                          <div className=" p-2  pl-3 ">
                            Type
                            <br />
                            Regular
                          </div>
                        </div>
                      </div>
                      <div
                        className={`grid grid-cols-9 gap-0 text-xs ${styles.wrapper}`}
                      >
                        <div className=" col-span-2  p-2 pl-3 font-bold">
                          Account
                        </div>
                        <div className=" p-2  pl-3 font-bold">Post date</div>

                        <div className=" col-span  p-2 pl-3 font-bold">
                          Journal
                        </div>
                        <div className=" p-2  pl-3 font-bold">
                          Journal reference
                        </div>
                        <div className=" p-2  pl-3 text-right font-bold">
                          Debit
                        </div>
                        <div className=" p-2  pl-3 text-right font-bold">
                          Credit
                        </div>
                        <div className=" col-span-2  p-2 pl-3 font-bold">
                          Transaction Codes
                        </div>

                        {gifts.map((gift, index) => (
                          <>
                            {/* do a credit for each designation */}
                            {gift.giftDesignations.length > 0 ? (
                              <>
                                {gift.giftDesignations.map((part) => (
                                  <>
                                    <div className=" col-span-2  p-2 pl-3">
                                      {lookupMapping(part.projectId)}
                                    </div>
                                    <div className=" p-2  pl-3 ">
                                      {gift.giftDateFormatted}
                                    </div>
                                    <div className=" p-2  pl-3 ">
                                      {journalName}
                                    </div>
                                    <div className=" p-2  pl-3 ">DonorSync</div>
                                    <div className=" p-2  pl-3 "></div>
                                    <div className=" p-2  pl-3 text-right">
                                      ${part.amountDesignated.toFixed(2)}
                                    </div>

                                    <div className=" col-span-2  p-2 pl-3">
                                      Default Transaction Codes (Set in FE)
                                    </div>
                                  </>
                                ))}
                                {/* do a credit for difference between total and designation */}
                              </>
                            ) : (
                              <>
                                {/* do a credit if there are no designations */}
                                <div className=" col-span-2  p-2 pl-3">
                                  {lookupMapping(
                                    parseInt(defaultCreditAccount)
                                  )}
                                </div>
                                <div className=" p-2  pl-3 ">
                                  {gift.giftDateFormatted}
                                </div>
                                <div className=" p-2  pl-3 ">{journalName}</div>
                                <div className=" p-2  pl-3 ">DonorSync</div>
                                <div className=" p-2  pl-3 "></div>
                                <div className=" p-2  pl-3 text-right">
                                  ${gift.amount.toFixed(2)}
                                </div>

                                <div className=" col-span-2  p-2 pl-3">
                                  Default Transaction Codes (Set in FE)
                                </div>
                              </>
                            )}
                          </>
                        ))}
                        {/* do the debit for total amount */}
                        <div className=" col-span-2  p-2 pl-3">
                          {lookupAccount(parseInt(defaultDebitAccount))}
                        </div>
                        <div className=" p-2  pl-3 "></div>
                        <div className=" p-2  pl-3 ">{journalName}</div>
                        <div className=" p-2  pl-3 ">DonorSync</div>

                        <div className=" p-2  pl-3 text-right">
                          ${batchCredits.toFixed(2)}
                        </div>
                        <div className=" p-2  pl-3 "></div>
                        <div className=" col-span-2  p-2 pl-3">
                          Default Transaction Codes (Set in FE)
                        </div>
                      </div>
                    </>
                  ) : (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}{' '}
                </>
              ) : (
                <EmptyPlaceholder className="h-full w-full text-black">
                  <EmptyPlaceholder.Icon name="post" className="text-white" />
                  <EmptyPlaceholder.Title>
                    {isLoading ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      `No Batch Selected`
                    )}
                  </EmptyPlaceholder.Title>
                  <EmptyPlaceholder.Description>
                    Select a batch to the left to see how the gifts will be
                    synchronized with Financial Edge
                  </EmptyPlaceholder.Description>
                </EmptyPlaceholder>
              )}
            </div>
          </div>
          <div className="m-auto flex flex-row items-start  justify-center space-y-3 xl:space-y-6 ">
            <div className="space-y-2 text-center">
              {' '}
              {!synced ? (
                <div>
                  <button
                    onClick={postFE}
                    className={cn(
                      `relative m-4 inline-flex h-9 max-w-md items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
                      {
                        'cursor-not-allowed opacity-60':
                          isLoading || isSyncing || gifts.length === 0,
                      }
                    )}
                    disabled={isLoading || isSyncing || gifts.length === 0}
                    {...props}
                  >
                    {isLoading || isSyncing ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.refresh className="mr-2 h-4 w-4" />
                    )}
                    Sync This Batch
                  </button>
                  <button
                    onClick={advanceStep}
                    className={cn(
                      `relative m-4 inline-flex h-9 max-w-md items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
                      {
                        'cursor-not-allowed opacity-60': isSyncing,
                      }
                    )}
                    disabled={isSyncing}
                    {...props}
                  >
                    <Icons.arrowRight className="mr-2 h-4 w-4" />
                    {pathname === '/batchManagement'
                      ? 'Return to dashboard'
                      : 'Skip for Now'}
                  </button>
                </div>
              ) : (
                <div className="text-white">
                  {' '}
                  {pathname !== '/step6' ? 'Synced' : 'Synced'}{' '}
                  <button
                    onClick={advanceStep}
                    className={cn(
                      `relative m-8 inline-flex h-9 max-w-md items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
                      {
                        'cursor-not-allowed opacity-60': isSyncing,
                      }
                    )}
                    disabled={isSyncing}
                    {...props}
                  >
                    <Icons.arrowRight className="mr-2 h-4 w-4" />
                    {pathname !== '/step6' ? 'Dashboard' : 'Continue'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div></div>
    </>
  )
}
