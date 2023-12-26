'use client'

import * as React from 'react'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'

import { JournalEntry } from '@/lib/feGiftBatches'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { DashboardHeader } from '@/components/header'
import { Icons } from '@/components/icons'

import { DashboardShell } from '../shell'
import WindowOpenLink from '../ui/window-open-link'
import styles from './grid.module.css'

interface BatchPreviewProps extends React.HTMLAttributes<HTMLButtonElement> {
  projects: any[]
  feAccounts: any[]
  mappings: any[]
  batches: any[]
  journalEntries?: JournalEntry[]
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
  journalEntries,
  defaultCreditAccount,
  defaultDebitAccount,
  defaultJournal,
  feEnvironment,
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
    setIsSyncing(false)
    setSelectedBatchId(selectedBatch?.id)
  }, [selectedBatch])

  const searchParams = useSearchParams()

  const {
    gifts,
    synced,
    batch_name: batchName,
  } = selectedBatch ?? { gifts: [] }
  const batchCredits = gifts.reduce((total, gift) => total + gift.amount, 0)

  function lookupAccount(accountId) {
    const account = feAccounts.find((a) => a.account_id === accountId)
    if (
      accountId === parseInt(defaultCreditAccount) ||
      accountId === parseInt(defaultDebitAccount)
    ) {
      return <span className="">{account?.description} (default)</span>
    }
    return <span className="">{account?.description}</span>
  }

  function lookupAccountForNumber(account_number?: string) {
    const account = feAccounts.find((a) => a.account_number === account_number)
    if (
      account.account_id === parseInt(defaultCreditAccount) ||
      account.account_id === parseInt(defaultDebitAccount)
    ) {
      return <span className="">{account?.description} (default)</span>
    }
    return <span className="">{account?.description}</span>
  }

  function lookupMapping(projectId: number) {
    const project = projects.find((p) => p.id === projectId)
    const mapping = mappings.find((m) => m.virProjectId === projectId)
    if (!mapping) {
      return (
        <span className="">
          {project?.name} <br />
          <Icons.arrowRight className="mr-2 inline h-4 w-4" />{' '}
          {lookupAccount(parseInt(defaultCreditAccount))}
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
    <DashboardShell>
      <DashboardHeader
        heading={
          pathname === '/dashboard/batchManagement'
            ? 'Batch Management'
            : 'Data Review'
        }
      />

      <div className="flex h-0 w-full flex-1 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col bg-dark p-4 pt-0">
          <div className="flex h-0 flex-1 flex-col">
            <p className="justify-left mb-4 text-lg text-white">
              <span className="font-bold text-accent-1">Batches</span>
            </p>
            {batches?.length ? (
              <div
                className={`justify-left col-span-6 h-0 max-h-[50vh] flex-1 overflow-scroll bg-whiteSmoke p-4 text-left text-dark lg:max-h-full`}
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
                            <WindowOpenLink
                              className="align-items-right text-xs"
                              url={`https://host.nxt.blackbaud.com/journalentry/${batch.reBatchNo}?envid=${feEnvironment}`}
                              target="financialEdge"
                              features="width=1200,height=750"
                            >
                              {' '}
                              View in FE{' '}
                              <span className="text-accent-1">
                                &nbsp; (synced)
                              </span>
                            </WindowOpenLink>
                          ) : (
                            <></>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyPlaceholder className="h-0 min-h-0 flex-1">
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
          <div className="mt-2 text-sm">
            {batchDaysLoaded === 730 ? (
              <p>Showing batches from the past two years</p>
            ) : batchDaysLoaded === 365 ? (
              <p>Showing batches from the past year</p>
            ) : (
              <p>Showing batches from the past {batchDaysLoaded} days</p>
            )}
          </div>
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
        <div className="h-full bg-dark p-4 pt-0 md:flex-[2]">
          <div className="flex h-full flex-col">
            <p className="justify-left mb-4 text-lg text-white">
              <span className="font-bold text-accent-1">Gifts</span>
            </p>
            <div className="justify-left col-span-6 w-full overflow-scroll bg-whiteSmoke p-4 text-left text-dark">
              {journalEntries?.length ? (
                <>
                  {!isLoading ? (
                    <>
                      <div className="grid grid-cols-9 gap-0 text-xs">
                        <div className="col-span-4 flex flex-col gap-2 p-2 pl-3">
                          <p className="text-3xl">
                            Batch # {batchName || 'TBD'}
                          </p>
                          {synced ? (
                            <WindowOpenLink
                              className="align-items-right text-sm text-accent-1"
                              url={`https://host.nxt.blackbaud.com/journalentry/${selectedBatch.reBatchNo}?envid=${feEnvironment}`}
                              target="financialEdge"
                              features="width=1200,height=750"
                            >
                              View in FE
                            </WindowOpenLink>
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
                        {journalEntries?.map((entry, index) => (
                          <>
                            <div
                              key={'entry-' + index}
                              className=" col-span-2  p-2 pl-3"
                            >
                              {lookupAccountForNumber(entry.account_number)}
                            </div>
                            <div className=" p-2  pl-3 ">
                              {format(new Date(entry.post_date), 'MM/dd/yyyy')}
                            </div>
                            <div className=" p-2  pl-3 ">{entry.journal}</div>
                            <div className=" p-2  pl-3 ">{entry.reference}</div>
                            <div className=" p-2  pl-3 text-right">
                              {entry.type_code === 'Debit'
                                ? `$${entry.amount.toFixed(2)}`
                                : ''}
                            </div>
                            <div className=" p-2  pl-3 text-right">
                              {entry.type_code === 'Credit'
                                ? `$${entry.amount.toFixed(2)}`
                                : ''}
                            </div>

                            <div className=" col-span-2  p-2 pl-3">
                              Default Transaction Codes (Set in FE)
                            </div>
                          </>
                        ))}
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
            <div className="flex flex-row items-start justify-center">
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
                    {isSyncing ? (
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
                <div className="mt-4 flex items-center justify-center gap-4 text-white">
                  <span>{pathname !== '/step6' ? 'Synced' : 'Synced'}</span>
                  <button
                    onClick={advanceStep}
                    className={cn(
                      `relative inline-flex h-9 max-w-md items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
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
    </DashboardShell>
  )
}
