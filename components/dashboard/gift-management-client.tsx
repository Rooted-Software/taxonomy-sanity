'use client'

import * as React from 'react'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  FeJournal,
  GiftBatch,
  ProjectAccountMapping,
  Team,
} from '@prisma/client'
import { format, isAfter, isBefore, isSameDay } from 'date-fns'

import {
  syncBatchGiftsPublic,
  syncGiftsInDateRangePublic,
  syncSelectedGiftsPublic,
} from '@/lib/feGiftBatchesPublic'
import { createJournalEntries, JournalEntry } from '@/lib/feJournalEntries'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { Icons } from '@/components/icons'

import { Button } from '../ui/button'
import { DatePickerWithRange } from '../ui/datePickerWithRange'
import WindowOpenLink from '../ui/window-open-link'

interface BatchPreviewProps extends React.HTMLAttributes<HTMLButtonElement> {
  feAccounts: any[]
  batches: Pick<GiftBatch, 'batch_name' | 'reBatchNo' | 'synced'>[]
  gifts: any[]
  mappings: Partial<ProjectAccountMapping>[]
  defaultJournal: Pick<FeJournal, 'id' | 'code' | 'journal'> | null
  team: Team
  defaultCreditAccount?: any
  defaultDebitAccount?: any
  feEnvironment?: string
  journalName?: string
  selectedBatch?: any
  startDate: string
  endDate: string
  onlyUnsynced: boolean
}

// Keep this as a separate form so that we don't risk using temp values during the post
function FilterForm({
  initialValues,
  isLoading,
  setIsLoading,
}: {
  initialValues: {
    startDate: string
    endDate: string
    onlyUnsynced: boolean
  }
  isLoading: boolean
  setIsLoading: (val: boolean) => void
}) {
  const router = useRouter()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [startDate, setStartDate] = React.useState<string | undefined>(
    initialValues.startDate
  )
  const [endDate, setEndDate] = React.useState<string | undefined>(
    initialValues.endDate
  )

  const [onlyUnsynced, setOnlyUnsynced] = React.useState(
    initialValues.onlyUnsynced
  )

  const setRange = (startDate, endDate) => {
    setStartDate(startDate)
    setEndDate(endDate)
  }

  const applyFilters = () => {
    if (!isLoading) {
      let url = new URL(window.location.href)
      if (startDate) {
        url.searchParams.set('startDate', startDate)
      } else {
        url.searchParams.delete('startDate')
      }
      if (endDate) {
        url.searchParams.set('endDate', endDate)
      } else {
        url.searchParams.delete('endDate')
      }
      if (onlyUnsynced) {
        url.searchParams.delete('onlyUnsynced')
      } else {
        url.searchParams.set('onlyUnsynced', 'false')
      }
      url.searchParams.delete('batch')

      setIsLoading(true)
      router.replace(url.toString())
    }
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-2 md:flex-row">
      <div>
        <label className="my-0 py-1 text-xs">Gift Date</label>
        <DatePickerWithRange
          className="w-[300px]"
          setDateFunction={setRange}
          initialDate={startDate || undefined}
          endDate={endDate || undefined}
        />
        <div className="mt-1 flex items-center gap-1">
          <input
            id="excludeSynced"
            type="checkbox"
            checked={onlyUnsynced}
            onChange={(e) => setOnlyUnsynced(e.target.checked)}
          />
          <label className="my-0 py-1 text-xs" htmlFor="excludeSynced">
            Exclude gifts that have already been synced
          </label>
        </div>
      </div>
      <Button onClick={() => applyFilters()} className="mt-5" size="sm">
        Apply
      </Button>
    </div>
  )
}

function JournalEntryRow({
  index,
  entry,
  accountName,
  checked,
  onChange,
}: {
  index: number
  entry: JournalEntry
  accountName: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}) {
  return (
    <tr className={index % 2 === 0 ? 'bg-gray-200' : ''}>
      <td className="p-2">
        {entry.type_code === 'Credit' && entry.gift_id && (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
          />
        )}
      </td>
      <td>
        {entry.gift_id}{' '}
        {entry.gift_synced ? (
          <span className="text-accent-1">&nbsp; (synced)</span>
        ) : (
          ''
        )}
      </td>
      <td>{entry.designation_project}</td>
      <td key={'entry-' + index} className="p-2 pl-3">
        {accountName}
      </td>
      <td className="p-2 pl-3">
        {format(new Date(entry.post_date), 'MM/dd/yyyy')}
      </td>
      <td className=" p-2  pl-3 ">{entry.journal}</td>
      <td className=" p-2  pl-3 ">{entry.reference}</td>
      <td className=" p-2  pl-3 text-right">
        {entry.type_code === 'Debit' ? `$${entry.amount.toFixed(2)}` : ''}
      </td>
      <td className=" p-2  pl-3 text-right">
        {entry.type_code === 'Credit' ? `$${entry.amount.toFixed(2)}` : ''}
      </td>
    </tr>
  )
}

export default function GiftManagementClientComponent({
  feAccounts,
  batches,
  gifts,
  mappings,
  defaultJournal,
  team,
  defaultCreditAccount,
  defaultDebitAccount,
  feEnvironment,
  selectedBatch,
  startDate,
  endDate,
  onlyUnsynced,
}: BatchPreviewProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [isSyncing, setIsSyncing] = React.useState<string>()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [selectedBatchName, setSelectedBatchName] = React.useState<string>()
  useEffect(() => {
    setIsLoading(false)
    setIsSyncing(undefined)
    setSelectedBatchName(selectedBatch?.batch_name)
  }, [selectedBatch, gifts])

  const searchParams = useSearchParams()

  function lookupAccountForNumber(account_number?: string) {
    const account = feAccounts.find((a) => a.account_number === account_number)
    if (
      account.account_id === parseInt(defaultCreditAccount) ||
      account.account_id === parseInt(defaultDebitAccount)
    ) {
      return `${account?.description} (default)`
    }
    return account?.description
  }

  const createBatchHref = (name: string | null) => {
    const params = new URLSearchParams(
      searchParams ? Array.from(searchParams.entries()) : undefined
    )
    if (name) params.set('batch', name)
    else params.delete('batch')
    return `${pathname}?${params.toString()}`
  }

  const [selectedGifts, setSelectedGifts] = React.useState<string[]>([])

  useEffect(() => {
    setSelectedGifts(
      gifts
        .filter(
          (g) =>
            (!startDate ||
              isAfter(new Date(g.giftDate), new Date(startDate)) ||
              isSameDay(new Date(g.giftDate), new Date(startDate))) &&
            (!endDate ||
              isBefore(new Date(g.giftDate), new Date(endDate)) ||
              isSameDay(new Date(g.giftDate), new Date(endDate)))
        )
        .map((g) => g.id)
    )
  }, [gifts, startDate, endDate])

  const journalEntries = React.useMemo(
    () =>
      createJournalEntries(
        gifts,
        feAccounts,
        mappings,
        defaultJournal,
        team,
        true
      ),
    [gifts, feAccounts, mappings, defaultJournal, team]
  )

  const selectedJournalEntries = React.useMemo(
    () =>
      createJournalEntries(
        gifts.filter((g) => selectedGifts.includes(g.id)),
        feAccounts,
        mappings,
        defaultJournal,
        team,
        true
      ),
    [gifts, feAccounts, mappings, defaultJournal, team, selectedGifts]
  )

  const totalCredits = selectedJournalEntries
    .filter((entry) => entry.type_code === 'Credit')
    .reduce((total, entry) => total + entry.amount, 0)

  const selectedCredits = gifts
    .filter((g) => selectedGifts.includes(g.id))
    .reduce((total, gift) => total + gift.amount, 0)

  async function postFE() {
    if (isSyncing) {
      return
    }

    const allInBatch = selectedGifts.length === gifts.length

    setIsSyncing(allInBatch ? 'all' : 'selected')
    const onlyUnsynced = searchParams?.get('onlyUnsynced') !== 'false'

    try {
      let record_id
      if (selectedBatch) {
        if (allInBatch) {
          const result = await syncBatchGiftsPublic(
            selectedBatch.batch_name,
            onlyUnsynced
          )
          record_id = result.record_id
        } else {
          const result = await syncSelectedGiftsPublic(
            selectedGifts,
            `${selectedGifts.length} gifts from batch ${selectedBatch.batch_name}`,
            onlyUnsynced
          )
          record_id = result.record_id
        }
      } else {
        if (allInBatch) {
          if (!startDate || !endDate)
            throw new Error('Start and end date required')
          const result = await syncGiftsInDateRangePublic(
            startDate,
            endDate,
            onlyUnsynced
          )
          record_id = result.record_id
        } else {
          const result = await syncSelectedGiftsPublic(
            selectedGifts,
            `${selectedGifts.length} gifts from ${startDate} to ${endDate}`,
            onlyUnsynced
          )
          record_id = result.record_id
        }
      }
      if (record_id && pathname === '/step6') {
        router.push(`/step7?record_id=${record_id}&envid=${feEnvironment}`)
      } else {
        setIsLoading(true)
        router.refresh()
      }
    } catch {
      return toast({
        title: 'Sync Error',
        description: 'Your batch was not synced. Please try again.',
        variant: 'success',
      })
    } finally {
      setIsSyncing(undefined)
    }
  }

  const creditEntriesCount = journalEntries.filter(
    (entry) => entry.type_code === 'Credit'
  ).length

  return (
    <div className="flex h-0 flex-1 flex-col gap-2">
      <FilterForm
        initialValues={{
          startDate,
          endDate,
          onlyUnsynced,
        }}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />

      <div className="flex h-0 w-full flex-1 flex-col lg:flex-row">
        <div className="flex flex-col bg-dark p-4 pt-0 lg:w-[300px]">
          <div className="flex h-0 flex-1 flex-col">
            {gifts.length ? (
              <div
                className={`justify-left col-span-6 h-0 max-h-[50vh] flex-1 overflow-scroll bg-whiteSmoke p-4 text-left text-dark lg:max-h-full`}
              >
                <Link
                  href={createBatchHref(null)}
                  scroll={false}
                  className={`flex w-full cursor-pointer flex-row items-center p-2  ${
                    !selectedBatchName ? `bg-dark text-white` : `text-dark`
                  }`}
                  onClick={() => {
                    setSelectedBatchName(undefined)
                    setIsLoading(true)
                  }}
                >
                  All gifts in date range
                </Link>
                <p className="justify-left mt-4 text-lg font-bold">Batches</p>
                {batches.length ? (
                  batches.map((batch) => (
                    <div key={batch.batch_name} className="flex p-1">
                      <Link
                        href={createBatchHref(batch.batch_name)}
                        scroll={false}
                        className={`flex w-full cursor-pointer flex-row items-center p-2  ${
                          batch.batch_name === selectedBatchName
                            ? `bg-dark text-white`
                            : `text-dark`
                        }`}
                        onClick={() => {
                          setSelectedBatchName(batch.batch_name)
                          setIsLoading(true)
                        }}
                      >
                        <div className="flex-col">{batch.batch_name}</div>
                        <div className="w-full flex-col text-right">
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
                  ))
                ) : (
                  <p>
                    No {onlyUnsynced ? 'unsynced ' : ''}gifts that belong to a
                    batch in the selected date rate
                  </p>
                )}
              </div>
            ) : (
              <EmptyPlaceholder className="h-0 min-h-0 flex-1">
                <EmptyPlaceholder.Icon name="post" />
                <EmptyPlaceholder.Title className="text-white">
                  No Virtuous Gifts Found
                </EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  Try adjusting the date range
                </EmptyPlaceholder.Description>
              </EmptyPlaceholder>
            )}
          </div>
        </div>

        {(journalEntries?.length || isLoading) && (
          <div className="max-h-[80vh] bg-dark p-4 pt-0 md:max-h-full md:w-0 md:flex-1">
            <div className="flex h-full flex-col">
              <div className="justify-left col-span-6 w-full overflow-scroll bg-whiteSmoke p-4 text-left text-dark">
                <>
                  {!isLoading ? (
                    <>
                      <div className="flex gap-3">
                        <div className="flex flex-1 flex-col gap-2 p-2 pl-3">
                          <p className="text-3xl">
                            {selectedBatch?.batch_name
                              ? selectedBatch.batch_name
                              : `All gifts from ${
                                  searchParams?.get('startDate') ?? startDate
                                } to ${
                                  searchParams?.get('endDate') ?? endDate
                                }`}
                          </p>
                          {selectedBatch?.synced ? (
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
                        <div className="flex gap-8 pr-8">
                          <div className="space-y-2 p-2 text-sm">
                            <div>
                              <p className="whitespace-nowrap">Total debit</p>
                              <p>
                                <b>${totalCredits.toFixed(2)}</b>
                              </p>
                            </div>
                            <div>
                              <p className="whitespace-nowrap">Total credit</p>
                              <p>
                                <b>${totalCredits.toFixed(2)}</b>
                              </p>
                            </div>
                            <div>
                              <p className="whitespace-nowrap">Balance</p>
                              <p>
                                <b>$0.00</b>
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2 p-2 text-sm">
                            <div>
                              Status
                              <br />
                              <b>Open</b>
                            </div>
                            <div>
                              Entries
                              <br />
                              <b>{selectedJournalEntries?.length ?? 0}</b>
                            </div>
                            <div>
                              Type
                              <br />
                              <b>Regular</b>
                            </div>
                          </div>
                        </div>
                      </div>

                      <table className="text-sm">
                        <thead>
                          <tr>
                            <th />
                            <th>Virtuous Gift ID</th>
                            <th>Virtuous Project</th>
                            <th className=" col-span-2  p-2 pl-3 font-bold">
                              Account
                            </th>
                            <th className=" p-2  pl-3 font-bold">Post date</th>

                            <th className=" col-span  p-2 pl-3 font-bold">
                              Journal
                            </th>
                            <th className=" p-2  pl-3 font-bold">
                              Journal reference
                            </th>
                            <th className=" p-2  pl-3 text-right font-bold">
                              Debit
                            </th>
                            <th className=" p-2  pl-3 text-right font-bold">
                              Credit
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {journalEntries
                            .filter((entry) => entry.type_code === 'Credit')
                            .map((entry, index) => (
                              <JournalEntryRow
                                index={index}
                                entry={entry}
                                accountName={lookupAccountForNumber(
                                  entry.account_number
                                )}
                                checked={
                                  entry.gift_id
                                    ? selectedGifts.includes(entry.gift_id)
                                    : false
                                }
                                onChange={(checked) =>
                                  entry.gift_id &&
                                  setSelectedGifts(
                                    checked
                                      ? [...selectedGifts, entry.gift_id]
                                      : selectedGifts.filter(
                                          (g) => g !== entry.gift_id
                                        )
                                  )
                                }
                              />
                            ))}
                        </tbody>
                        <tbody>
                          {selectedJournalEntries
                            .filter((entry) => entry.type_code === 'Debit')
                            .map((entry, index) => (
                              <JournalEntryRow
                                index={index + creditEntriesCount}
                                entry={entry}
                                accountName={lookupAccountForNumber(
                                  entry.account_number
                                )}
                              />
                            ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}{' '}
                </>
              </div>

              <div className="mt-3 flex flex-row items-center justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="white"
                    size="xs"
                    onClick={() => setSelectedGifts(gifts.map((g) => g.id))}
                  >
                    Select All
                  </Button>
                  <Button
                    size="xs"
                    variant="white"
                    onClick={() => setSelectedGifts([])}
                    className="whitespace-nowrap"
                  >
                    Unselect All
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={postFE}
                    className={cn('rounded-full', {
                      'cursor-not-allowed opacity-60':
                        isLoading || !!isSyncing || selectedGifts.length === 0,
                    })}
                    disabled={
                      isLoading || !!isSyncing || selectedGifts.length === 0
                    }
                  >
                    {isSyncing === 'selected' ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.refresh className="mr-2 h-4 w-4" />
                    )}
                    Sync {selectedGifts.length} Selected Gifts ($
                    {selectedCredits})
                  </Button>
                </div>
                <div>
                  {pathname === '/step6' && (
                    <Button
                      onClick={() => router.push('/step8')}
                      className="rounded-full"
                      disabled={!!isSyncing}
                    >
                      <Icons.arrowRight className="mr-2 h-4 w-4" />
                      Skip for now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
