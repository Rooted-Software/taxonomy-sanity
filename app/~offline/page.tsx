import Head from "next/head";

import { StreamButton } from "@/components/webcam/stream-button";

async function getAccess() { 

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true 
    });
  
      const videoTracks = stream.getVideoTracks()
      const track = videoTracks[0]
      alert(`Getting video from: ${track.label}`)
      document.querySelector('video').srcObject = stream

  //The video stream is stopped by track.stop() after 3 second of playback.
     
}

export default function Offline() {
  return (
    <>
      <Head>
        <title>next-pwa example</title>
      </Head>
      <h1>This is offline fallback page</h1>
      <h2>When offline, any page route will fallback to this page</h2>
      <div><input type="file" accept="image/x-png,image/jpeg,image/gif"/></div>
      <div><input type="text" id="name" /></div>
      <input type="submit"></input>
      <StreamButton />
<video></video>
<script src="https://webrtc.github.io/adapter/adapter-latest.js"></script>
    </>
  );
}