import { AgoraRTCProvider } from "agora-rtc-react";

export function ActiveCall() {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  return (
    <AgoraRTCProvider client={client}>
       <CallRoom ... />
    </AgoraRTCProvider>
  )
}