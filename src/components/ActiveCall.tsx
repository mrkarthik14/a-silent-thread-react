import {
  LocalUser,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
  useLocalScreenTrack,
  AgoraRTCProvider,
} from "agora-rtc-react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX, Monitor, MonitorOff, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ActiveCallProps {
  channelName: string;
  appId: string;
  token: string;
  uid: number;
  callType: "voice" | "video";
  onEndCall: () => void;
  startTime: number;
  children?: React.ReactNode;
}

export function ActiveCall({
  channelName,
  appId,
  token,
  uid,
  callType,
  onEndCall,
  startTime,
  children,
}: ActiveCallProps) {
  const client = useMemo(() => AgoraRTC.createClient({ codec: "vp8", mode: "rtc" }), []);
  const [showChat, setShowChat] = useState(false);

  return (
    <AgoraRTCProvider client={client}>
      <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex animate-in fade-in duration-300">
        <div className={`flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-[#0a0a0a] to-[#0a0a0a] transition-all duration-300 ${showChat ? 'mr-[400px]' : ''}`}>
          <CallRoom
            appId={appId}
            token={token}
            channelName={channelName}
            uid={uid}
            callType={callType}
            client={client}
            onEndCall={onEndCall}
            startTime={startTime}
            onToggleChat={() => setShowChat(!showChat)}
            isChatOpen={showChat}
          />
        </div>
        
        <div className={`fixed right-0 top-0 bottom-0 w-[400px] bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 transform transition-transform duration-300 z-50 flex flex-col ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
          {children}
        </div>
      </div>
    </AgoraRTCProvider>
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
  startTime,
  onToggleChat,
  isChatOpen,
}: ActiveCallProps & { client: any; onToggleChat: () => void; isChatOpen: boolean }) {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(callType === "video");
  const [speakerOn, setSpeakerOn] = useState(true);
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const updateDuration = () => {
      setDuration(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    };
    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
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
  const { screenTrack, error: screenShareError } = useLocalScreenTrack(screenShareOn, {}, "auto");

  // Handle screen share error
  useEffect(() => {
    if (screenShareError) {
      console.error("Screen share error:", screenShareError);
      setScreenShareOn(false);
      toast.error("Failed to start screen share");
    }
  }, [screenShareError]);

  // Handle screen track ended (e.g. user clicks "Stop sharing" in browser)
  useEffect(() => {
    if (screenTrack) {
      screenTrack.on("track-ended", () => {
        setScreenShareOn(false);
      });
    }
  }, [screenTrack]);

  // Publish tracks
  usePublish([localMicrophoneTrack, localCameraTrack, screenTrack]);

  // Remote users
  const remoteUsers = useRemoteUsers();

  // Handle speaker toggle (mute remote users)
  useEffect(() => {
    if (remoteUsers) {
      remoteUsers.forEach((user: any) => {
        if (user.audioTrack) {
          user.audioTrack.setVolume(speakerOn ? 100 : 0);
        }
      });
    }
  }, [speakerOn, remoteUsers]);

  return (
    <div className="h-full w-full flex flex-col relative">
      {/* Duration Pill */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-lg ring-1 ring-white/5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span className="text-white font-medium font-mono text-sm tracking-wider">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
        {/* Local User */}
        <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/5 transition-all duration-300 hover:ring-white/10 group">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
            <p className="text-white/20 font-medium tracking-widest uppercase text-sm">You</p>
          </div>
          <LocalUser
            audioTrack={localMicrophoneTrack}
            cameraOn={cameraOn || screenShareOn}
            micOn={micOn}
            videoTrack={screenShareOn ? screenTrack : localCameraTrack}
            cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
          >
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-medium tracking-wide flex items-center gap-2">
              You {micOn ? "" : "(Muted)"} {screenShareOn ? "(Sharing Screen)" : ""}
              {!micOn && <MicOff className="h-3 w-3 text-red-400" />}
            </div>
            {!micOn && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10">
                <MicOff className="h-5 w-5 text-red-500" />
              </div>
            )}
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
      <div className="h-32 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-6 pb-6">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full border-0 transition-all duration-300 shadow-lg hover:scale-105",
            speakerOn 
              ? "bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/10" 
              : "bg-slate-500/20 text-slate-400 hover:bg-slate-500/30 ring-1 ring-slate-500/20"
          )}
          onClick={() => setSpeakerOn(!speakerOn)}
          title={speakerOn ? "Mute Speaker" : "Unmute Speaker"}
        >
          {speakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
        </Button>

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
          title={micOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {micOn ? <Mic className="h-7 w-7" /> : <MicOff className="h-7 w-7" />}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20 transition-all duration-300 hover:scale-110 ring-4 ring-red-500/10"
          onClick={onEndCall}
          title="End Call"
        >
          <PhoneOff className="h-9 w-9" />
        </Button>

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
          title={cameraOn ? "Turn Off Camera" : "Turn On Camera"}
        >
          {cameraOn ? <Video className="h-7 w-7" /> : <VideoOff className="h-7 w-7" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full border-0 transition-all duration-300 shadow-lg hover:scale-105",
            screenShareOn 
              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 ring-1 ring-blue-500/20" 
              : "bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/10"
          )}
          onClick={() => setScreenShareOn(!screenShareOn)}
          title={screenShareOn ? "Stop Screen Share" : "Share Screen"}
        >
          {screenShareOn ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full border-0 transition-all duration-300 shadow-lg hover:scale-105",
            isChatOpen
              ? "bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/10"
              : "bg-white/5 hover:bg-white/10 text-white/70 ring-1 ring-white/5"
          )}
          onClick={onToggleChat}
          title={isChatOpen ? "Close Chat" : "Open Chat"}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}