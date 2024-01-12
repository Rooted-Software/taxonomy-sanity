import Image from 'next/image'

export default function DashboardLoading() {
  return (
    <>
      <div className="container mx-auto mt-8 grid w-full grid-cols-1 content-center items-center bg-dark pt-8 text-center  lg:max-w-none lg:grid-cols-1 lg:px-0">
        getting gifts and batches...
        <br />
        <br />
        <Image
          className="mx-auto animate-spin"
          src={'/icon.png'}
          alt="loading"
          width={64}
          height={64}
        />
      </div>
    </>
  )
}
