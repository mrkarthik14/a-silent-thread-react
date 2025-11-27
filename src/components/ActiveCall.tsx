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
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex-1 relative overflow-hidden">
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
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Local User */}
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-500">You</p>
          </div>
          <LocalUser
            audioTrack={localMicrophoneTrack}
            cameraOn={cameraOn}
            micOn={micOn}
            videoTrack={localCameraTrack}
            cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
          >
            <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-sm">
              You
            </div>
          </LocalUser>
        </div>

        {/* Remote Users */}
        {remoteUsers.map((user: any) => (
          <div
            key={user.uid}
            className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
          >
            <RemoteUser user={user} cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg">
              <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-sm">
                User {user.uid}
              </div>
            </RemoteUser>
          </div>
        ))}
        
        {remoteUsers.length === 0 && (
           <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
             <div className="text-center">
               <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                 <span className="text-2xl">...</span>
               </div>
               <p className="text-slate-400">Waiting for others to join...</p>
             </div>
           </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-24 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 flex items-center justify-center gap-6">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full border-0 transition-all duration-300",
            micOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
          )}
          onClick={() => setMicOn(!micOn)}
        >
          {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all duration-300 hover:scale-105"
          onClick={onEndCall}
        >
          <PhoneOff className="h-8 w-8" />
        </Button>

        {callType === "video" && (
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full border-0 transition-all duration-300",
              cameraOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
            )}
            onClick={() => setCameraOn(!cameraOn)}
          >
            {cameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>
        )}
      </div>
    </div>
  );
}