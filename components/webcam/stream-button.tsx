'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import { toast } from '@/ui/toast'

interface StreamButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

export function StreamButton({
  className,
  ...props
}: StreamButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [vidStream, setVidStream] = React.useState<any>('')
  const [storageAmnt, setStorageAmnt] = React.useState<any>(0)
  async function onClick() {
    const width = '320';
    setIsLoading(true)
    setIsLoading(false)
    let constraints = {
        audio: false,
        video: {
          facingMode: 'environment'
        }
      };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
  
        const devices = await navigator.mediaDevices.enumerateDevices(); 
        console.log(devices); 
      const videoTracks = stream.getVideoTracks()
      console.log(videoTracks); 
      const track = videoTracks[0]

      alert(`Getting video from: ${track.label}`)
      setVidStream(stream)
     const video =  document.querySelector('video'); 
      document.querySelector('video').srcObject = stream
      document.querySelector('video').play()
      const height = ((video.videoHeight / video.videoWidth) * parseInt(width)).toString();

      const canvas =  document.querySelector('canvas'); 
      video.setAttribute("width", width);
      video.setAttribute("height", height);
      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);
    }

 async function getFrame() {
    const width = '320';
    const canvas =  document.querySelector('canvas'); 
    const context = canvas.getContext("2d");
    const video =  document.querySelector('video'); 
    const height = ((video.videoHeight / video.videoWidth) * parseInt(width)).toString();
    console.log( navigator.storage.estimate()) 
    setStorageAmnt(navigator.storage.estimate()) 
   
  if (width && height) {
    canvas.width = parseInt(width);
    canvas.height = parseInt(height);
    context.drawImage(video, 0, 0, parseInt(width), parseInt(height));

    const data = canvas.toDataURL("image/png");

    }
 }
  return (
    <div>
    <button
      onClick={onClick}
      className={cn(
        'relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        {
          'cursor-not-allowed opacity-60': isLoading,
        },
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.add className="mr-2 h-4 w-4" />
      )}
      Stream
    </button>
    <button
      onClick={getFrame}
      className={cn(
        'relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        {
          'cursor-not-allowed opacity-60': isLoading,
        },
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.add className="mr-2 h-4 w-4" />
      )}
      Get Frame
    </button>
    <canvas id="canvas"> </canvas>
    <video id="video"> </video>
<script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
<div className="output">

</div>
    </div>
  )
}
