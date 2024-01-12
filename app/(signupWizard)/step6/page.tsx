import GiftManagement from '@/components/dashboard/gift-management'

export const metadata = {
  title: 'Review your data',
  description: 'Double Check Your Mapping Before Syncing.',
}

export default function ReviewDataPage({ searchParams }) {
  return (
    <div className="flex h-full w-full flex-col justify-center p-4">
      <p className="justify-left p-4 text-lg text-white">
        <span className="font-bold text-accent-1">STEP 6:</span> Review your
        virtuous gifts and sync your first batch
      </p>
      <GiftManagement searchParams={searchParams} />
    </div>
  )
}
