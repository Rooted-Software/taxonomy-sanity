'use client'

import { UniversalButton } from './universal-button'
import { useState, Fragment, useEffect } from 'react'
import { VirtuousGetProjectsButton } from '@/components/dashboard/virtuous-get-projects'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { CheckCircle } from 'lucide-react'
import { CheckSquare } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { Dialog, Transition } from '@headlessui/react'
import tr from 'date-fns/esm/locale/tr'
import { AnyZodObject } from 'zod'

interface MappingCreateButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  projects: any[]
  feAccounts: any[]
  mappings: any[]
}




export function MappingCreateButton({
  projects,
  feAccounts,
  mappings,
  className,
  ...props
}: MappingCreateButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [virProjectID, setVirProjectID] = React.useState<any[]>([])
  const [feAccountID, setFeAccountID] = React.useState('')
  const [feAccountObj, setFeAccountObj] = React.useState<any>({})
  const [textFilter, setTextFilter] = React.useState('')
  const [textFeFilter, setTextFeFilter] = React.useState('')
  const [filteredProjects, setFilteredProjects] = React.useState<any[]>(projects )
  const [filteredAccounts, setFilteredAccounts] = React.useState<any[]>(feAccounts)
  

  // Project filters
  const [filterProjectName, setFilterProjectName] = React.useState<boolean>(true)
  const [filterProjectCode, setFilterProjectCode] = React.useState<boolean>(true)
  const [filterOnlineDisplayName, setFilterOnlineDisplayName] = React.useState<boolean>(false)
  const [filterExternalAccountingCode, setFilterExternalAccountingCode] = React.useState<boolean>(true)
  const [filterDescription, setFilterDescription] = React.useState<boolean>(true)
  const [filterIsActive, setFilterIsActive] = React.useState<boolean>(false)
  const [filterIsPublic, setFilterIsPublic] = React.useState<boolean>(false)
  const [filterIsTaxDeductible, setFilterIsTaxDeductible] = React.useState<boolean>(false)
  const [filterCase, setFilterCase] = React.useState<boolean>(false)

  // Account filters
  const [filterAccountId, setFilterAccountId] = React.useState<boolean>(true)
  const [filterAccountDescription, setFilterAccountDescription] = React.useState<boolean>(true)
  const [filterAccountNumber, setFilterAccountNumber] = React.useState<boolean>(true)
  const [filterFeCase, setFilterFeCase] = React.useState<boolean>(false)

  function advanceStep() { 
    router.push('/step6')
  }

  function lookupProject(projectId) { 
    const project = projects.find(p => p.project_id === projectId)

    return <span className='text-sm'>{project.name}</span>
  }

  function lookupProjectId(projectId) { 
    const project = projects.find(p => p.id === projectId)

    return <span className='text-sm'>{project?.name}</span>
  }

  function lookupAccount(accountId) { 
    const account = feAccounts.find(a => a.account_id === accountId)
    return <span className='text-sm'>{account?.description}</span>
  }

  let [isOpen, setIsOpen] = useState(false)
  let [isFeAccountFilterOpen, setIsFeAccountFilterOpen] = useState(false)
  function addVirProject(id) {
    console.log(id); 
    var array =  virProjectID.slice(); 
    array.push(id);
    setVirProjectID(array);

  }
  
  useEffect(() => {
    filterProjects(textFilter)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappings, virProjectID])


  function removeVirProject(id){ 
    var array = virProjectID;
    const index = array.indexOf(id);
    if (index > -1) { // only splice array when item is found
      array.splice(index, 1); // 2nd parameter means remove one item only
    }
    setVirProjectID(array.slice());

  }

  function filterProjects(value) { 

    if (!filterCase) { 
      value =value.toLowerCase(); 
    }
   if (value === "" || value.length===0 || value === null || value===undefined) { 
      setFilteredProjects(projects.filter((project)=> { 
      if (filterIsActive) { 
        if (project.isActive !== true) { return false }
      }
      if (filterIsPublic) { 
        if (project.isPublic !== true) { return false }
      }
      if (filterIsTaxDeductible) { 
        if (project.isTaxDeductible !== true) { return false }
      }
      if  (mappings.find((mapping) => mapping.virProjectId === project.project_id)) {return false}
      return true 
    }
    )) 
  } else { 
    setFilteredProjects(projects.filter((project)=> {
      if (filterIsActive) { 
        if (project.isActive !== true) { return false }
      }
      if (filterIsPublic) { 
        if (project.isPublic !== true) { return false }
      }
      if (filterIsTaxDeductible) { 
        if (project.isTaxDeductible !== true) { return false }
      }
      let wholeString = ''; 
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
      if  (mappings.find((mapping) => mapping.virProjectId === project.project_id)) {return false}

      return wholeString.includes(value)
    }));
  }

  }

  function filterFeAccounts(value) { 
   
    if (!filterFeCase) { 
      value =value.toLowerCase(); 
    }
   if (value === "" || value.length===0 || value === null || value===undefined) 
    { setFilteredAccounts(feAccounts) } 
   else { 
    setFilteredAccounts(feAccounts.filter((account)=> {
     
      let wholeString = ''; 
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
        wholeString = wholeString.toLowerCase(); 
      }
      
      return wholeString.includes(value)
    }));
  }

  }

  async function onClick() {

    if (isLoading) { return }
    setIsLoading(true);
    console.log('client side mapping')
    const response = await fetch('/api/mapping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        virProjectIDs: virProjectID,
        feAccountID: feAccountID,
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

    console.log('invalidating cache')
    setVirProjectID([])
    // This forces a cache invalidation.  Had to set a delay to get the new item. :) 
    setTimeout(function(){
      console.log("Executed after 1 second");
      setIsLoading(false)
      router.refresh()
  }, 400);
    
  }

  async function onDeleteMapping(mappingId) {
    console.log('deleting mapping: ' + mappingId);
    if (isLoading) { return }
    setIsLoading(true);

    console.log(virProjectID); 
    console.log(feAccountID); 
    console.log('client side deleting')
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

    console.log('invalidating cache')

    // This forces a cache invalidation.
    router.refresh()
  }



  return (<>
    <div className="h-screen bg-dark lg:p-8">
      <h1 className='font-3xl py-4 text-3xl text-white'> Master Data Map</h1>
      <div className="m-auto flex flex-col justify-center space-y-6 ">
      <div className="w-full text-left " >
            <p className="justify-left text-lg text-white">
              <span className='text-accent-1'>Virtuous Projects</span> 
            </p>
          </div>
        <div className="flex w-full flex-row space-y-2 text-center">
          
          <div className="mt-1 basis-2/3 items-center justify-end">
              <input
                id='textFilter'
                value={textFilter}
                onChange={(e)=> {setTextFilter(e.target.value);  filterProjects(e.target.value)}}
                placeholder="Search"
                className="w-full rounded-lg border border-gray-400 p-2 text-brand-400"
              />
          </div>
          <div className='align-right items-right my-auto mx-2 basis-1/3'>
            <button
              onClick={(e)=>{e.preventDefault(); setIsOpen(true)}}
              className='inline-flex h-9 shrink items-center rounded-md border border-transparent bg-tightWhite px-4 py-2 text-sm text-dark hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
              disabled={isLoading}
              {...props}
            >
              <Icons.listFilter className="mr-2 h-4 w-4" />
                Filter
              </button>
            </div>   
            <UniversalButton icon='refresh' className='bg-tightWhite text-dark' title="" route={process.env.NEXT_PUBLIC_APP_URL +'/api/virProjects'} method="GET" fields={['id', 'name', 'projectCode']} />
        </div>
      <div className='flex w-full flex-row'>
            {filteredProjects?.length ? (
      <div className='justify-left col-span-6 w-full overflow-scroll bg-whiteSmoke p-4 text-left text-dark' style={{height: '45vh'}}>
        {filteredProjects && filteredProjects.map((project) => (<div className='p-1' key={project.project_id}>
        <div className="flex flex-row items-center" >
          <input id={`checked-checkbox-${project.project_id}`}  type="checkbox" value={project.project_id} onClick={(e)=>{if ((e.target as HTMLInputElement).checked) {addVirProject((e.target as HTMLInputElement).value)} else {removeVirProject((e.target as HTMLInputElement).value)} }} className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
          <label htmlFor={`checked-checkbox-${project.project_id}`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{project.name} </label>
                
        </div>{project.onlineDisplayName
                ? <div className='ml-8 pl-3 text-xs font-bold text-brand-400'> {project.onlineDisplayName}</div>
                : null} 
        <div className='ml-8 pl-3 text-xs text-brand-400'>id: {project.id} | Project code: {project.projectCode}</div>
        <div className='ml-8 pl-3 text-xs text-brand-400'>{project.externalAccountingCode !=='none' ? <span> Accounting Code: {project.externalAccountingCode}</span> : null} {project.description ? <span>| desc: {project.description}</span> : null}</div>
        <div className='ml-8 pl-3 text-xs text-brand-400'>{project.isPublic ? <span className='text-success'>Public</span> : null } {project.isActive ? <span className='text-red'>Active</span> : null } {project.isTaxDeductible ? <span className='text-green'>Tax Deductible</span> : null }</div> 
      </div>
          ))}
    </div>
      ) : (
        <EmptyPlaceholder >
          <EmptyPlaceholder.Icon name="post" />
          <EmptyPlaceholder.Title className='text-white'>
            No Virtuous Projects Found
          </EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            Try adjusting the search terms, filter, or refreshing the project list from virtuous.
          </EmptyPlaceholder.Description>
         
        </EmptyPlaceholder>
      )}
          </div>
        </div>
      
        
        {virProjectID.length === 0 ? null
        
        : <> <div className='mt-4 bg-tightWhite p-4 text-dark'>
        {virProjectID.map((project)=><span key={`list-${project}`}>{lookupProject(project)}<br/></span>)}
        </div></>}

       



      </div>
      <div className="h-screen bg-dark  lg:p-8">
      <h1 className='font-3xl p-4 text-3xl text-white'>&nbsp;</h1>
        <div className="m-auto flex w-full flex-col justify-center space-y-6 ">
          <div className="m-auto flex w-full flex-col justify-center space-y-6 ">
            <div className="w-full text-left " >
                  <p className="justify-left text-lg text-white">
                  <span className='text-accent-1'>Financial Edge Accounts</span> 
                </p>
            </div>
            <div className="flex w-full flex-row space-y-2 text-center">
          
          <div className="mt-1 basis-2/3 items-center justify-end">
              <input
                id='textFilter'
                value={textFeFilter}
                onChange={(e)=> {setTextFeFilter(e.target.value);  filterFeAccounts(e.target.value)}}
                placeholder="Search"
                className="w-full rounded-lg border border-gray-400 p-2 text-brand-400"
              />
          </div>
          <div className='align-right items-right my-auto mx-2 basis-1/3'>
            <button
              onClick={(e)=>{e.preventDefault(); setIsFeAccountFilterOpen(true)}}
              className='inline-flex h-9 shrink items-center rounded-md border border-transparent bg-tightWhite px-4 py-2 text-sm font-medium  text-dark hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
              disabled={isLoading}
              {...props}
            >
              <Icons.listFilter className="mr-2 h-4 w-4" />
                Filter
              </button>
            </div>   
            <UniversalButton icon='refresh' className='bg-tightWhite text-dark' title="" route={process.env.NEXT_PUBLIC_APP_URL +'/api/feAccounts'} method="GET" fields={['account_id', 'description', 'account_number']}  />
        </div>
        <div className='flex w-full flex-row'>
            {filteredAccounts?.length ? (
        <div className='justify-left col-span-6 w-full overflow-scroll bg-whiteSmoke p-4 text-left text-dark' style={{height: '45vh'}}>
          {filteredAccounts.map((feAccount) => (
            <div className='p-1' key={feAccount?.account_id} >
             <div className="flex flex-row items-center" >
                <input id={`checked-checkbox-${feAccount?.account_id}`} type="radio" name="re-radio" value={feAccount?.account_id} onClick={(e)=>{setFeAccountID((e.target as HTMLInputElement).value); console.log((e.target as HTMLInputElement).value); let accountObj = feAccounts.find(account=>account.account_id == (e.target as HTMLInputElement).value); console.log(accountObj); setFeAccountObj(accountObj) }} className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600" />
                <label htmlFor={`checked-checkbox-${feAccount?.account_id}`}  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">{feAccount?.description
                      ? <span className='mx-4'> {feAccount?.description}</span>
                      : <span className='mx-4'> Undefined </span>} </label>
                      </div>
                <div className='ml-8 pl-3 text-xs text-brand-400'>id: {feAccount.account_id} | number: {feAccount.account_number}</div>
                <div className='ml-8 pl-3 text-xs text-brand-400'>{feAccount.class !=='none' ? <span> Class: {feAccount.class}</span> : null} </div>
                <div className='ml-8 pl-3 text-xs text-brand-400'>{feAccount.cashflow ? <span className='text-success'>{feAccount.cashflow}</span> : null }  </div> 
                <div className='ml-8 pl-3 text-xs text-brand-400'>{feAccount.working_capital ? <span className='text-success'>{feAccount.working_capital}</span> : null }  </div> 
            </div>
    
          ))}
        </div>
      ) : (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="post" />
          <EmptyPlaceholder.Title>
            No Accounts Found
          </EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any RE/FE accounts yet.
          </EmptyPlaceholder.Description>
          
        </EmptyPlaceholder>
      )}
      </div>
          </div>
        </div>
        <div className='mt-4 bg-tightWhite p-4 text-dark'>
        {feAccountID && feAccountObj?.account_id ? 
        <button
            onClick={onClick}
            className={cn(
              `relative float-right m-4 inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
              {
                'cursor-not-allowed opacity-60': isLoading,
              },
          
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
          </button> : <span className='text-dark' >Please Select an Account</span>}
          
          {feAccountID && feAccountObj?.account_id ? <div className='' >{feAccountObj?.description ? feAccountObj?.description : null } 
          
          <br/> <span className='text-sm text-dark'>Transaction Codes:</span> <br/>
          {feAccountObj?.default_transaction_codes?.map((tc)=> { 
            return (<span key={'tc' + tc?.name}className='text-sm'>
            {tc?.name}: {tc?.value && tc?.value !== 'None' ? tc?.value : 'None'}  <br/>
            </span>

            )

          } )} </div> : null }

         
         
        </div>
      </div>
      <div className='flex h-screen w-full flex-col bg-whiteSmoke p-8 pt-[24px] '>
        <h1 className='py-8 text-2xl text-dark'>Mappings </h1>

        {mappings?.length ? (
         <div className='justify-left m-8 overflow-scroll bg-whiteSmoke p-2 text-left text-dark' style={{height: '50vh'}}>
          {mappings.map((mapping) => (
            <div className='p-1' key={mapping.id} >
            <div className="flex items-center" > <Icons.trash className="mr-2 h-4 w-4 text-red" onClick={()=>onDeleteMapping(mapping.id)} /> {lookupProject(mapping.virProjectId)} <Icons.arrowRight className="mr-2 h-4 w-4" />  {lookupAccount(mapping.feAccountId)}
             
        </div>
              </div>
          ))}


        </div>
      ) : (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="post" />
          <EmptyPlaceholder.Title>
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
          `relative m-8 inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
          {
            'cursor-not-allowed opacity-60': isLoading,
          },
       
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.arrowRight className="mr-2 h-4 w-4" />
        )}
        Continue (Data Review)
      </button>) : (
        null
      )}
    </div>
    
    <div>
      
      
    <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={()=>setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Virtuous Projects Filter
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                    <input id={`checkbox-filterProjectName`} 
                      checked={filterProjectName ? true : false}
                      type="checkbox" value={filterProjectName.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterProjectName(true)} else {setFilterProjectName(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterProjectName`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Filter Project Name </label><br/>
                    <input id={`checkbox-filterProjectCode`} 
                      checked={filterProjectCode ? true : false}
                      type="checkbox" value={filterProjectCode.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterProjectCode(true)} else {setFilterProjectCode(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterProjectCode`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Filter External Accounting Code </label><br/>
                    <input id={`checkbox-filterExternalAccountingCode`} 
                      checked={filterExternalAccountingCode ? true : false}
                      type="checkbox" value={filterExternalAccountingCode.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterExternalAccountingCode(true)} else {setFilterExternalAccountingCode(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterExternalAccountingCode`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Filter Project Code </label><br/>
                    <input id={`checkbox-filterOnlineDisplayName`} 
                      checked={filterOnlineDisplayName ? true : false}
                      type="checkbox" value={filterOnlineDisplayName.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterOnlineDisplayName(true)} else {setFilterOnlineDisplayName(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterOnlineDisplayName`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Filter Online Display Name </label><br/>
                    <input id={`checkbox-filterDescription`} 
                      checked={filterDescription ? true : false}
                      type="checkbox" value={filterDescription.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterDescription(true)} else {setFilterDescription(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterDescription`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Filter Description </label><br/>
                    <input id={`checkbox-filterIsPublic`} 
                      checked={filterIsPublic ? true : false}
                      type="checkbox" value={filterIsPublic.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterIsPublic(true)} else {setFilterIsPublic(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterIsPublic`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Show only Public Projects</label><br/>
                    <input id={`checkbox-filterIsTaxDeductible`} 
                      checked={filterIsTaxDeductible ? true : false}
                      type="checkbox" value={filterIsTaxDeductible.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterIsTaxDeductible(true)} else {setFilterIsTaxDeductible(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterCase`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Show only Tax Deductible Projects</label><br/>
                    <input id={`checkbox-filterCase`} 
                      checked={filterCase ? true : false}
                      type="checkbox" value={filterCase.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterCase(true)} else {setFilterCase(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterCase`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Match Exact Case</label><br/>

                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={()=>{setIsOpen(false); filterProjects(textFilter);}}
                    >
                      Done
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isFeAccountFilterOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={()=>setIsFeAccountFilterOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    FE Accounts Filter
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                    <input id={`checkbox-filterAccountId`} 
                      checked={filterAccountId ? true : false}
                      type="checkbox" value={filterAccountId.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterAccountId(true)} else {setFilterAccountId(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterAccountId`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Filter Account Id </label><br/>
                    <input id={`checkbox-filterAccountNumber`} 
                      checked={filterAccountNumber ? true : false}
                      type="checkbox" value={filterAccountNumber.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterAccountNumber(true)} else {setFilterAccountNumber(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterAccountNumber`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Filter Account Number </label><br/>
                    <input id={`checkbox-filterAccountDescription`} 
                      checked={filterAccountDescription ? true : false}
                      type="checkbox" value={filterAccountDescription.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterAccountDescription(true)} else {setFilterAccountDescription(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterAccountDescription`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Filter Account Description </label><br/>
                    <input id={`checkbox-filterCase`} 
                      checked={filterCase ? true : false}
                      type="checkbox" value={filterCase.toString()} 
                      onChange={(e)=>{if (e.target.checked) {setFilterCase(true)} else {setFilterCase(false)} }} 
                      className="text-large h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 " />
                    <label htmlFor={`checkbox-filterCase`} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Match Exact Case</label><br/>

                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={()=>{setIsFeAccountFilterOpen(false); filterFeAccounts(textFeFilter);}}
                    >
                      Done
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>

    </>
  )
}
