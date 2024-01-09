'use client'

import * as React from 'react'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PopoverTrigger } from '@radix-ui/react-popover'

import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { Icons } from '@/components/icons'

import { giftTypes } from '../DebitAccountSelector'
import { Button } from '../ui/button'
import Combobox from '../ui/combobox'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Popover, PopoverContent } from '../ui/popover'

interface MappingEditorProps extends React.HTMLAttributes<HTMLButtonElement> {
  projects: any[]
  feAccounts: any[]
  mappings: any[]
  projectsDaysLoaded?: number
  nextProjectDays: number
}

type FeAccount = {
  account_id: number
  account_number: number
  description?: string
  class: string
  cashflow: number
  working_capital: number
}

function FeAccountPicker({
  title,
  name,
  feAccounts,
  onSelect,
  isLoading,
}: {
  title: string
  name: string
  feAccounts: FeAccount[]
  onSelect: (id: string, obj?: FeAccount) => void
  isLoading?: boolean
}) {
  const [textFeFilter, setTextFeFilter] = React.useState('')
  const [filterAccountId, setFilterAccountId] = React.useState<boolean>(true)
  const [filterAccountDescription, setFilterAccountDescription] =
    React.useState<boolean>(true)
  const [filterAccountNumber, setFilterAccountNumber] =
    React.useState<boolean>(true)
  const [filterFeCase, setFilterFeCase] = React.useState<boolean>(false)

  const filteredAccounts = React.useMemo(() => {
    let value = textFeFilter
    if (!filterFeCase) {
      value = value.toLowerCase()
    }
    if (
      value === '' ||
      value.length === 0 ||
      value === null ||
      value === undefined
    ) {
      return feAccounts
    } else {
      return feAccounts.filter((account) => {
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
    }
  }, [
    textFeFilter,
    feAccounts,
    filterFeCase,
    filterAccountDescription,
    filterAccountNumber,
    filterAccountId,
  ])

  return (
    <div className="flex flex-1 flex-col justify-center gap-3">
      <p className="justify-left text-lg font-bold text-accent-1">{title}</p>
      <div className="flex flex-row items-center gap-2">
        <div className="w-0 flex-1 items-center justify-end">
          <input
            id="textFilter"
            value={textFeFilter}
            onChange={(e) => {
              setTextFeFilter(e.target.value)
            }}
            placeholder="Search"
            className="w-full rounded-lg border border-gray-400 p-2 text-brand-400"
          />
        </div>
        <Popover>
          <PopoverTrigger>
            <button
              className="inline-flex h-9 shrink items-center rounded-md border border-transparent bg-tightWhite px-4 py-2 text-sm font-medium  text-dark hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              <Icons.listFilter className="mr-2 h-4 w-4" />
              Filter
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            side="bottom"
            align="end"
          >
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                <input
                  id={`checkbox-filterAccountId`}
                  checked={filterAccountId ? true : false}
                  type="checkbox"
                  value={filterAccountId.toString()}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilterAccountId(true)
                    } else {
                      setFilterAccountId(false)
                    }
                  }}
                  className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                />
                <label
                  htmlFor={`checkbox-filterAccountId`}
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Filter Account Id{' '}
                </label>
                <br />
                <input
                  id={`checkbox-filterAccountNumber`}
                  checked={filterAccountNumber ? true : false}
                  type="checkbox"
                  value={filterAccountNumber.toString()}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilterAccountNumber(true)
                    } else {
                      setFilterAccountNumber(false)
                    }
                  }}
                  className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                />
                <label
                  htmlFor={`checkbox-filterAccountNumber`}
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Filter Account Number{' '}
                </label>
                <br />
                <input
                  id={`checkbox-filterAccountDescription`}
                  checked={filterAccountDescription ? true : false}
                  type="checkbox"
                  value={filterAccountDescription.toString()}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilterAccountDescription(true)
                    } else {
                      setFilterAccountDescription(false)
                    }
                  }}
                  className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                />
                <label
                  htmlFor={`checkbox-filterAccountDescription`}
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Filter Account Description{' '}
                </label>
                <br />
                <input
                  id={`checkbox-filterCase`}
                  checked={filterFeCase ? true : false}
                  type="checkbox"
                  value={filterFeCase.toString()}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilterFeCase(true)
                    } else {
                      setFilterFeCase(false)
                    }
                  }}
                  className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                />
                <label
                  htmlFor={`checkbox-filterCase`}
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Match Exact Case
                </label>
                <br />
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="h-0 w-full flex-1">
        {filteredAccounts?.length ? (
          <div className="justify-left max-h-[50vh] overflow-scroll bg-whiteSmoke p-4 text-left text-dark lg:max-h-full">
            <div className="flex flex-row items-center p-1">
              <input
                type="radio"
                name={name}
                id={`${name}-default`}
                value=""
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                defaultChecked
                onClick={() => onSelect('')}
              />
              <label
                htmlFor={`${name}-default`}
                className="px-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Default
              </label>
            </div>
            {filteredAccounts.map((feAccount) => (
              <div className="p-1" key={feAccount?.account_id}>
                <div className="flex flex-row items-center">
                  <input
                    id={`${name}-checked-checkbox-${feAccount?.account_id}`}
                    type="radio"
                    name={name}
                    value={feAccount?.account_id}
                    onClick={(e) => {
                      let accountObj = feAccounts.find(
                        (account) =>
                          account.account_id?.toString() ===
                          (e.target as HTMLInputElement).value
                      )
                      onSelect((e.target as HTMLInputElement).value, accountObj)
                    }}
                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                  />
                  <label
                    htmlFor={`${name}-checked-checkbox-${feAccount?.account_id}`}
                    className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    {feAccount?.description ? (
                      <span>{feAccount?.description}</span>
                    ) : (
                      <span>Undefined </span>
                    )}{' '}
                  </label>
                </div>
                <div className="ml-3 pl-3 text-xs text-brand-400">
                  id: {feAccount.account_id} | number:{' '}
                  {feAccount.account_number}
                </div>
                <div className="ml-3 pl-3 text-xs text-brand-400">
                  {feAccount.class !== 'none' ? (
                    <span> Class: {feAccount.class}</span>
                  ) : null}{' '}
                </div>
                <div className="ml-3 pl-3 text-xs text-brand-400">
                  {feAccount.cashflow ? (
                    <span className="text-success">{feAccount.cashflow}</span>
                  ) : null}{' '}
                </div>
                <div className="ml-3 pl-3 text-xs text-brand-400">
                  {feAccount.working_capital ? (
                    <span className="text-success">
                      {feAccount.working_capital}
                    </span>
                  ) : null}{' '}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>No Accounts Found</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any RE/FE accounts yet.
            </EmptyPlaceholder.Description>
          </EmptyPlaceholder>
        )}
      </div>
    </div>
  )
}

function VirProjectList({
  virProjects,
  setVirProjects,
  projects,
  mappings,
  isLoading,
  projectsDaysLoaded,
  nextProjectDays,
}: {
  projects: any[]
  virProjects: any[]
  setVirProjects: React.Dispatch<React.SetStateAction<any[]>>
  mappings: any[]
  isLoading?: boolean
  projectsDaysLoaded?: number
  nextProjectDays: number
}) {
  const [textFilter, setTextFilter] = React.useState('')
  const [filteredProjects, setFilteredProjects] =
    React.useState<any[]>(projects)

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
  const [filterIsActive, setFilterIsActive] = React.useState<boolean>(false)
  const [filterIsPublic, setFilterIsPublic] = React.useState<boolean>(false)
  const [filterIsTaxDeductible, setFilterIsTaxDeductible] =
    React.useState<boolean>(false)
  const [filterCase, setFilterCase] = React.useState<boolean>(false)

  function addVirProject(project) {
    setVirProjects([...virProjects, project])
  }

  useEffect(() => {
    filterProjects(textFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappings, virProjects])

  function removeVirProject(id) {
    setVirProjects(virProjects.filter((project) => project.id !== id))
  }

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

  const searchParams = useSearchParams()
  const pathname = usePathname()
  const createMoreProjectsHref = () => {
    const params = new URLSearchParams(
      searchParams ? Array.from(searchParams.entries()) : undefined
    )
    params.set('projectDays', nextProjectDays.toString())
    return `${pathname}?${params.toString()}`
  }

  const [isLoadingMoreProjects, setIsLoadingMoreProjects] =
    React.useState<boolean>(false)
  useEffect(() => {
    setIsLoadingMoreProjects(false)
  }, [projectsDaysLoaded])

  function lookupProject(id) {
    const project = projects.find((p) => p.id === id)

    return <span className="text-sm">{project.name}</span>
  }

  return (
    <>
      <div className="flex flex-1 flex-col bg-dark pb-5">
        <div className="flex h-0 flex-1 flex-col justify-center gap-3">
          <p className="justify-left text-lg text-white">
            <span className="font-bold text-accent-1">Virtuous Projects</span>
          </p>
          <div className="flex flex-row items-center gap-2">
            <input
              id="textFilter"
              value={textFilter}
              onChange={(e) => {
                setTextFilter(e.target.value)
                filterProjects(e.target.value)
              }}
              placeholder="Search"
              className="w-0 flex-1 rounded-lg border border-gray-400 p-2 text-brand-400"
            />
            <div className="align-right items-right">
              <Popover>
                <PopoverTrigger>
                  <button
                    className="inline-flex h-9 shrink items-center rounded-md border border-transparent bg-tightWhite px-4 py-2 text-sm text-dark hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    disabled={isLoading}
                  >
                    <Icons.listFilter className="mr-2 h-4 w-4" />
                    Filter
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                  side="bottom"
                  align="end"
                >
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      <input
                        id={`checkbox-filterProjectName`}
                        checked={filterProjectName ? true : false}
                        type="checkbox"
                        value={filterProjectName.toString()}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterProjectName(true)
                          } else {
                            setFilterProjectName(false)
                          }
                        }}
                        className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                      />
                      <label
                        htmlFor={`checkbox-filterProjectName`}
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Filter Project Name{' '}
                      </label>
                      <br />
                      <input
                        id={`checkbox-filterProjectCode`}
                        checked={filterProjectCode ? true : false}
                        type="checkbox"
                        value={filterProjectCode.toString()}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterProjectCode(true)
                          } else {
                            setFilterProjectCode(false)
                          }
                        }}
                        className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                      />
                      <label
                        htmlFor={`checkbox-filterProjectCode`}
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Filter External Accounting Code{' '}
                      </label>
                      <br />
                      <input
                        id={`checkbox-filterExternalAccountingCode`}
                        checked={filterExternalAccountingCode ? true : false}
                        type="checkbox"
                        value={filterExternalAccountingCode.toString()}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterExternalAccountingCode(true)
                          } else {
                            setFilterExternalAccountingCode(false)
                          }
                        }}
                        className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                      />
                      <label
                        htmlFor={`checkbox-filterExternalAccountingCode`}
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Filter Project Code{' '}
                      </label>
                      <br />
                      <input
                        id={`checkbox-filterOnlineDisplayName`}
                        checked={filterOnlineDisplayName ? true : false}
                        type="checkbox"
                        value={filterOnlineDisplayName.toString()}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterOnlineDisplayName(true)
                          } else {
                            setFilterOnlineDisplayName(false)
                          }
                        }}
                        className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                      />
                      <label
                        htmlFor={`checkbox-filterOnlineDisplayName`}
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Filter Online Display Name{' '}
                      </label>
                      <br />
                      <input
                        id={`checkbox-filterDescription`}
                        checked={filterDescription ? true : false}
                        type="checkbox"
                        value={filterDescription.toString()}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterDescription(true)
                          } else {
                            setFilterDescription(false)
                          }
                        }}
                        className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                      />
                      <label
                        htmlFor={`checkbox-filterDescription`}
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Filter Description{' '}
                      </label>
                      <br />
                      <input
                        id={`checkbox-filterIsPublic`}
                        checked={filterIsPublic ? true : false}
                        type="checkbox"
                        value={filterIsPublic.toString()}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterIsPublic(true)
                          } else {
                            setFilterIsPublic(false)
                          }
                        }}
                        className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                      />
                      <label
                        htmlFor={`checkbox-filterIsPublic`}
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Show only Public Projects
                      </label>
                      <br />
                      <input
                        id={`checkbox-filterIsTaxDeductible`}
                        checked={filterIsTaxDeductible ? true : false}
                        type="checkbox"
                        value={filterIsTaxDeductible.toString()}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterIsTaxDeductible(true)
                          } else {
                            setFilterIsTaxDeductible(false)
                          }
                        }}
                        className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                      />
                      <label
                        htmlFor={`checkbox-filterCase`}
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Show only Tax Deductible Projects
                      </label>
                      <br />
                      <input
                        id={`checkbox-filterCase`}
                        checked={filterCase ? true : false}
                        type="checkbox"
                        value={filterCase.toString()}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterCase(true)
                          } else {
                            setFilterCase(false)
                          }
                        }}
                        className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                      />
                      <label
                        htmlFor={`checkbox-filterCase`}
                        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Match Exact Case
                      </label>
                      <br />
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex h-0 flex-1 flex-row">
            {filteredProjects?.length ? (
              <div className="justify-left col-span-6 max-h-[50vh] overflow-scroll bg-whiteSmoke p-4 text-left text-dark lg:max-h-full">
                {filteredProjects &&
                  filteredProjects.map((project) => (
                    <div className="p-1" key={project.id}>
                      <div className="flex flex-row items-center">
                        <input
                          id={`checked-checkbox-${project.id}`}
                          type="checkbox"
                          checked={virProjects.some((p) => p.id === project.id)}
                          onChange={(e) => {
                            if ((e.target as HTMLInputElement).checked) {
                              addVirProject(project)
                            } else {
                              removeVirProject(project.id)
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 "
                        />
                        <label
                          htmlFor={`checked-checkbox-${project.id}`}
                          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          {project.name}{' '}
                        </label>
                      </div>
                      {project.onlineDisplayName ? (
                        <div className="ml-3 pl-3 text-xs font-bold text-brand-400">
                          {' '}
                          {project.onlineDisplayName}
                        </div>
                      ) : null}
                      <div className="ml-3 pl-3 text-xs text-brand-400">
                        id: {project.id} | Project code: {project.projectCode}
                      </div>
                      <div className="text-wrap ml-3 pl-3 text-xs text-brand-400">
                        {project.externalAccountCode &&
                        project.externalAccountingCode !== 'none' ? (
                          <span>
                            {' '}
                            Accounting Code: {project.externalAccountingCode}
                          </span>
                        ) : null}{' '}
                        {project.description ? (
                          <span>| desc: {project.description}</span>
                        ) : null}
                      </div>
                      <div className="ml-3 pl-3 text-xs text-brand-400">
                        {project.isPublic ? (
                          <span className="text-success">Public</span>
                        ) : null}{' '}
                        {project.isActive ? (
                          <span className="text-red">Active</span>
                        ) : null}{' '}
                        {project.isTaxDeductible ? (
                          <span className="text-green">Tax Deductible</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon name="post" />
                <EmptyPlaceholder.Title className="text-white">
                  No Un-mapped Virtuous Projects Found
                </EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  Try adjusting the search terms or filter
                </EmptyPlaceholder.Description>
              </EmptyPlaceholder>
            )}
          </div>
        </div>

        {virProjects.length === 0 ? null : (
          <>
            {' '}
            <div className="mt-4 bg-tightWhite p-4 text-dark">
              {virProjects.map((project) => (
                <span key={`list-${project.id}`}>
                  {lookupProject(project.id)}
                  <br />
                </span>
              ))}
            </div>
          </>
        )}

        <div className="mt-2 text-sm">
          {projectsDaysLoaded === 730 ? (
            <p>Showing projects from the past two years</p>
          ) : projectsDaysLoaded === 365 ? (
            <p>Showing projects from the past year</p>
          ) : (
            <p>Showing projects from the past {projectsDaysLoaded} days</p>
          )}
        </div>
        {(!projectsDaysLoaded || projectsDaysLoaded < 730) && (
          <Link
            href={createMoreProjectsHref()}
            scroll={false}
            className={cn(
              `relative mt-2 inline-flex items-center rounded-full bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
              {
                'cursor-not-allowed opacity-60': isLoadingMoreProjects,
              }
            )}
            onClick={() => setIsLoadingMoreProjects(true)}
          >
            {isLoadingMoreProjects && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Load more projects
          </Link>
        )}
      </div>
    </>
  )
}

export function MappingEditor({
  projects,
  feAccounts,
  mappings,
  projectsDaysLoaded,
  nextProjectDays,
  ...props
}: MappingEditorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [virProjects, setVirProjects] = React.useState<any[]>([])
  const [feCreditAccountID, setFeCreditAccountID] = React.useState('')
  const [feCreditAccountObj, setFeCreditAccountObj] = React.useState<any>({})
  const [feDebitAccountID, setFeDebitAccountID] = React.useState('')
  const [feDebitAccountObj, setFeDebitAccountObj] = React.useState<any>({})
  const [feDebitMap, setFeDebitMap] = React.useState({})

  function advanceStep() {
    if (pathname === '/projectMapping') {
      router.push('/dashboard')
    } else {
      router.push('/step6')
    }
  }

  function lookupAccount(accountId) {
    return accountId
      ? feAccounts.find((a) => a.account_id === accountId)?.description
      : 'Default'
  }

  async function onClick() {
    if (isLoading) {
      return
    }
    setIsLoading(true)
    const response = await fetch('/api/mapping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        virProjects,
        feCreditAccountID,
        feDebitAccountID,
        feDebitAccountForGiftType: feDebitMap,
      }),
    })

    if (!response?.ok) {
      if (response.status === 402) {
        return toast({
          title: 'Something Went Wrong 3.',
          description: 'Your Mapping was not created.',
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong4.',
        description: 'Your mapping was not created. Please try again.',
        variant: 'destructive',
      })
    }

    setVirProjects([])
    // This forces a cache invalidation.  Had to set a delay to get the new item. :)
    setTimeout(function () {
      setIsLoading(false)
      router.refresh()
    }, 400)
  }

  async function onDeleteMapping(mappingId) {
    if (isLoading) {
      return
    }
    setIsLoading(true)

    const response = await fetch('/api/mapping/' + mappingId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    setIsLoading(false)

    if (!response?.ok) {
      if (response.status === 402) {
        return toast({
          title: 'Something went wrong1.',
          description: 'Mapping was not removed.',
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong2.',
        description: 'Your mapping was not removed.',
        variant: 'destructive',
      })
    }
    toast({
      title: 'Mapping Removed.',
      description: 'Your Mapping was removed',
      variant: 'destructive',
    })

    // This forces a cache invalidation.
    router.refresh()
  }

  return (
    <div className="flex h-0 flex-1 flex-col gap-8 lg:flex-row">
      <VirProjectList
        virProjects={virProjects}
        setVirProjects={setVirProjects}
        projects={projects}
        mappings={mappings}
        isLoading={isLoading}
        projectsDaysLoaded={projectsDaysLoaded}
        nextProjectDays={nextProjectDays}
      />

      <div className="flex flex-col bg-dark pb-5 md:flex-[2]">
        <div className="flex h-0 flex-1 flex-col gap-4 md:flex-row">
          <FeAccountPicker
            title="Financial Edge Credit Account"
            name="fe-credit"
            onSelect={(id, obj) => {
              setFeCreditAccountID(id)
              setFeCreditAccountObj(obj)
            }}
            feAccounts={feAccounts}
            isLoading={isLoading}
          />
          <FeAccountPicker
            title="Financial Edge Debit Account"
            name="fe-debit"
            onSelect={(id, obj) => {
              setFeDebitAccountID(id)
              setFeDebitAccountObj(obj)
            }}
            feAccounts={feAccounts}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-4 bg-tightWhite p-4 text-dark">
          {(feCreditAccountID && feCreditAccountObj?.account_id) ||
          (feDebitAccountID && feDebitAccountObj) ? (
            <button
              onClick={onClick}
              className={cn(
                `relative float-right m-4 inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
                {
                  'cursor-not-allowed opacity-60': isLoading,
                }
              )}
              disabled={isLoading}
              {...props}
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.add className="mr-2 h-4 w-4" />
              )}
              Map Project(s)
            </button>
          ) : (
            <span className="text-dark">Please Select an Account</span>
          )}

          {(feCreditAccountID && feCreditAccountObj?.account_id) ||
          (feDebitAccountID && feDebitAccountObj?.account_id) ? (
            <div>
              <p>
                Credit:{' '}
                <b>
                  {feCreditAccountObj?.description
                    ? feCreditAccountObj?.description
                    : 'Default'}
                </b>
              </p>
              <div className="my-2 flex items-center gap-3">
                <p>
                  Debit:{' '}
                  <b>
                    {feDebitAccountObj?.description
                      ? feDebitAccountObj?.description
                      : 'Default'}
                  </b>
                </p>
                <Dialog>
                  <DialogTrigger>
                    <Button variant="outline" size="xs">
                      Customize for gift type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[unset]">
                    <DialogTitle className="px-7 text-center">
                      Customize Financial Edge Debit Account for Virtuous Gift
                      Type
                    </DialogTitle>
                    <div className="mt-4 space-y-3">
                      {giftTypes.map((giftType) => (
                        <div className="flex flex-col items-start">
                          <p className="mb-1 text-sm font-bold text-gray-800">
                            {giftType}
                          </p>
                          <Combobox
                            value={feDebitMap[giftType]}
                            onChange={(val) =>
                              setFeDebitMap({
                                ...feDebitMap,
                                [giftType]: val,
                              })
                            }
                            isLoading={isLoading}
                            disabled={isLoading}
                            options={[
                              { label: 'Unset', value: '' },
                              ...feAccounts.map((item: any) => ({
                                value: item.account_id,
                                label: [
                                  'account_number',
                                  'description',
                                  'class',
                                ]
                                  .map((f) => item[f])
                                  .join(' '),
                              })),
                            ]}
                          />
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-sm text-dark">Transaction Codes:</p>
              <div className="ml-3">
                {feCreditAccountObj?.default_transaction_codes?.map((tc) => {
                  return (
                    <span key={'tc' + tc?.name} className="text-sm">
                      {tc?.name}:{' '}
                      {tc?.value && tc?.value !== 'None' ? tc?.value : 'None'}{' '}
                      <br />
                    </span>
                  )
                })}{' '}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex h-full flex-1 flex-col bg-whiteSmoke px-2 py-4">
        <h1 className="mb-4 ml-4 text-2xl text-dark">Mappings</h1>

        {mappings?.length ? (
          <div className="justify-left h-0 max-h-[50vh] flex-1 overflow-scroll bg-whiteSmoke text-left text-dark lg:max-h-full">
            <div className="flex items-center p-1">
              <Icons.trash className="mr-2 h-4 w-4 opacity-0" />
              <span className="flex-1 text-right font-bold">
                Virtuous Project
              </span>
              <Icons.arrowRight className="mx-2 h-4 w-4" />{' '}
              <span className="flex-1 text-sm font-bold">
                FE Credit Account
              </span>
            </div>
            {mappings.map((mapping) => (
              <div className="flex items-center p-1" key={mapping.id}>
                <Icons.trash
                  className="mr-2 h-4 w-4 text-red-500"
                  onClick={() => onDeleteMapping(mapping.id)}
                />
                <span className="flex-1 text-right text-sm">
                  {mapping.virProjectName}
                </span>
                <Icons.arrowRight className="mx-2 h-4 w-4" />{' '}
                <span
                  className="flex-1 text-sm"
                  title={`Credit: ${lookupAccount(
                    mapping.feAccountId
                  )}, Debit: ${lookupAccount(mapping.feDebitAccountId)} ${
                    Object.keys(mapping.feDebitAccountForGiftType ?? {})
                      .length > 0
                      ? '(with gift type customization)'
                      : ''
                  }`}
                >
                  {lookupAccount(mapping.feAccountId)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title className="text-gray-800">
              No Mappings Found
            </EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any mappings yet.
            </EmptyPlaceholder.Description>
          </EmptyPlaceholder>
        )}
        {mappings?.length ? (
          <button
            onClick={advanceStep}
            className={cn(
              `relative m-4 inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
              {
                'cursor-not-allowed opacity-60': isLoading,
              }
            )}
            disabled={isLoading}
            {...props}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.arrowRight className="mr-2 h-4 w-4" />
            )}
            {pathname === '/projectMapping'
              ? 'Return to dashboard'
              : 'Continue (Data Review)'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
