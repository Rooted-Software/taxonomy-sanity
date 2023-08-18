'use client'

import { Fragment } from 'react'
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useRouter, usePathname } from 'next/navigation'
import { any } from 'prop-types'
import * as React from 'react'
import { set } from 'date-fns'
import "@/styles/globals.css"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'


interface UniversalButtonProps {
    title: String,
    route: RequestInfo,
    method: String,
    fields: string[],
    redirect: string,
    selected: any,
    subType?: string,
  }

export function UniversalSelect({
  title, 
  route, 
  method,
  fields,
  selected,
  subType,
  redirect, 
  ...props
}: UniversalButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [returnedData , setReturnedData] = React.useState(Array<{any}>)
  const [selectValue, setSelectValue] = React.useState(selected)
  const [selectTitle, setSelecTitle] = React.useState(selected)
  const [filterValue, setFilterValue] = React.useState('')
  const [filteredObjects, setFilteredObjects] = React.useState(Array<{any}>)
  console.log(selected)


  async function getInitialData() {
    console.log('getInitialData')
    if (isLoading && route) {return}
    setIsLoading(true)
    setReturnedData([])
    setFilterValue('')
    console.log(route)
    

    const response = await fetch(route, {
      method: 'GET',
    })

    
    console.log(response)
    if (!response?.ok) {
      if (response.status === 429) {
        console.log(response)
        const data = await response.json()
        console.log(data)
        return toast({
          title: 'API rate limit exceeded',
          description: data.message,
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your post was not created. Please try again.',
        variant: 'destructive',
      })
    }

    const data = await response.json()
    console.log(data)
    if (data?.length > 0) {
      setReturnedData(data)
      setFilteredObjects(data)
   
  
      if (selected === undefined || selected === null || selected === '') {
      setSelectValue( (data[0][fields[0]])?.toString()  ) } 
    }
    console.log(data[0][fields[0]])
    setIsLoading(false)
    // This forces a cache invalidation.
  
  }

  function selectLabel() { 
    if (selectValue === undefined || selectValue === null || selectValue === '') {return <>Loading...</>}
    if (returnedData.length === 0) {return <>Loading...</>}
    console.log('Selected Value')
    console.log(selectValue)
    const aLabel = returnedData.find((item, indexA) => {
      console.log(item[fields[0]].toString() === selectValue.toString())
      return item[fields[0]].toString() === selectValue.toString() 
    })  
    console.log('Selected Label')
    console.log(aLabel)
    if (aLabel === undefined) {return <>Loading...</>}
    let item=aLabel
    return <>{fields?.map((field :any, index) =>  {if (index >0) { return <Fragment key={item[field] + index + '-key'} > {item[field]} </Fragment>} else  {return <Fragment key={item[field] + index + '-key'} ></Fragment>} }  )}</>
  }
  
  function updateFilter() {
          if (filterValue === '' || filterValue === null) {setFilteredObjects(returnedData)} else 
          {
        
          setFilteredObjects(returnedData.filter((item)=>{
            var text = ''
          fields?.forEach((field :any, index) =>  {if (index > 0) { text = text + item[field]?.toString().toLowerCase()    } }  )
          
          return text.includes(filterValue.toLowerCase())
        
        }))
      }
        
  }

  async function saveSelectedData() {
    console.log('getInitialData')
    if (isLoading) {return}
    setIsLoading(true)

    const bodyJson = JSON.stringify({
        route: route,
        selectValue: selectValue,
        subType: subType,
      })
      console.log(bodyJson)

    const response = await fetch(route, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyJson, 
    })

   
   
    if (!response?.ok) {
      if (response.status === 429) {
        console.log(response)
        const data = await response.json()
        console.log(data)
        return toast({
          title: 'API rate limit exceeded',
          description: data.message,
          variant: 'destructive',
        })
      }
      setIsLoading(false)
      return toast({
        title: 'Something went wrong.',
        description: 'Your post was not created. Please try again.',
        variant: 'destructive',
      })
    }
     router.push(redirect)
  }
 
  if (!isLoading && returnedData?.length < 1) { 
    
        const user =  getInitialData()
  }
  return (
    <div className='w-100'>
      
    
        <div className='w-100'>




<DropdownMenu>
        {!isLoading ? <DropdownMenuTrigger className="text-md m-5 h-10 w-full overflow-hidden  rounded-full border border-accent-1 bg-accent-1 py-2 px-5 text-left text-dark focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
        {selectLabel()}
          <svg className="float-right ml-2.5 mt-2 h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
  </svg>
        </DropdownMenuTrigger> : <div className="text-md mx-5 mt-4 mb-0 h-10 w-full overflow-hidden rounded-full  border border-accent-1 bg-accent-1 py-2 px-5  text-left text-dark focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
       <div className=''>{selectLabel()} 
          <svg className="float-right ml-2.5 mt-2 h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
  </svg></div> 
        </div> }
        

        <DropdownMenuContent align='start' className='w-100 border-whiteSomke dropdown ml-5 border-none bg-whiteSmoke text-dark'>
        <input type="text" autoComplete="off" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500" value={filterValue} onChange={(e)=>{
          e.preventDefault()
          e.stopPropagation()
          setFilterValue(e.target.value)
          updateFilter()
        }
      
        }
        id="inputSearch" placeholder="Search" />
  {filteredObjects?.map((item :any, index) => (
    <DropdownMenuItem className='w-100 border-whiteSomke border-none bg-whiteSmoke' key={'option' + index} data-value={item[fields[0]]} onClick={(e)=>setSelectValue((e.target as HTMLElement).dataset.value)}>
  {fields?.map((field :any, index) =>  {if (index >0) { return <Fragment key={item[field] + index + '-key'} > {item[field]} </Fragment>} else  {return <Fragment key={item[field] + index + '-key'} ></Fragment>} }  )}
  </DropdownMenuItem>

          ))}
    
    </DropdownMenuContent>
      </DropdownMenu>



<br/>
 
          


            
<button
        onClick={saveSelectedData}
        className={cn(
          'font-large relative inline-flex h-9 items-center rounded-full border border-transparent bg-whiteSmoke  py-1  px-5 text-lg text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
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
         <>{ title }</> 
        )}
       
      </button>
        </div>

    </div>
  )
}
