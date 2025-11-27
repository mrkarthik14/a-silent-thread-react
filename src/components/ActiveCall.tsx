import {
  LocalUser,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
  useRTCClient,
} from "agora-rtc-react";
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveCallProps {
  channelName: string;
  appId: string;
  token: string;
  uid: number;
  callType: "voice" | "video";
  onEndCall: () => void;
}

export function ActiveCall({
  channelName,
  appId,
  token,
  uid,
  callType,
  onEndCall,
}: ActiveCallProps) {
  const client = useRTCClient(AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }));

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col animate-in fade-in duration-300">
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-[#0a0a0a] to-[#0a0a0a]">
        <CallRoom
          appId={appId}
          token={token}
          channelName={channelName}
          uid={uid}
          callType={callType}
          client={client}
          onEndCall={onEndCall}
        />
      </div>
    </div>
  );
}

function CallRoom({
  appId,
  token,
  channelName,
  uid,
  callType,
  client,
  onEndCall,
}: ActiveCallProps & { client: any }) {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(callType === "video");
  
  // Join the channel
  useJoin(
    {
      appid: appId,
      channel: channelName,
      token: token,
      uid: uid,
    },
    true,
    client
  );

  // Local tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);

  // Publish tracks
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Remote users
  const remoteUsers = useRemoteUsers();

  return (
    <div className="h-full w-full flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
        {/* Local User */}
        <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/5 transition-all duration-300 hover:ring-white/10 group">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
            <p className="text-white/20 font-medium tracking-widest uppercase text-sm">You</p>
          </div>
          <LocalUser
            audioTrack={localMicrophoneTrack}
            cameraOn={cameraOn}
            micOn={micOn}
            videoTrack={localCameraTrack}
            cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
          >
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-medium tracking-wide">
              You
            </div>
          </LocalUser>
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 rounded-3xl group-hover:ring-white/10 transition-all duration-500" />
        </div>

        {/* Remote Users */}
        {remoteUsers.map((user: any) => (
          <div
            key={user.uid}
            className="relative bg-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/5 transition-all duration-300 hover:ring-white/10 group"
          >
            <RemoteUser user={user} cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg">
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-medium tracking-wide">
                User {user.uid}
              </div>
            </RemoteUser>
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 rounded-3xl group-hover:ring-white/10 transition-all duration-500" />
          </div>
        ))}
        
        {remoteUsers.length === 0 && (
           <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center group">
             <div className="text-center p-8">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse ring-1 ring-white/10">
                 <span className="text-3xl text-white/50">...</span>
               </div>
               <p className="text-white/40 font-medium tracking-wide">Waiting for others to join...</p>
             </div>
             <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 rounded-3xl" />
           </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-32 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-8 pb-6">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-16 w-16 rounded-full border-0 transition-all duration-300 shadow-lg hover:scale-105",
            micOn 
              ? "bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/10" 
              : "bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/20"
          )}
          onClick={() => setMicOn(!micOn)}
        >
          {micOn ? <Mic className="h-7 w-7" /> : <MicOff className="h-7 w-7" />}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20 transition-all duration-300 hover:scale-110 ring-4 ring-red-500/10"
          onClick={onEndCall}
        >
          <PhoneOff className="h-9 w-9" />
        </Button>

        {callType === "video" && (
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-16 w-16 rounded-full border-0 transition-all duration-300 shadow-lg hover:scale-105",
              cameraOn 
                ? "bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/10" 
                : "bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/20"
            )}
            onClick={() => setCameraOn(!cameraOn)}
          >
            {cameraOn ? <Video className="h-7 w-7" /> : <VideoOff className="h-7 w-7" />}
          </Button>
        )}
      </div>
    </div>
  );
}