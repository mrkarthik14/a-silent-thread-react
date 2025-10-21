import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Video, X } from "lucide-react";

interface CallIndicatorProps {
  callStatus: "idle" | "ringing" | "active" | "ended";
  callDuration: number;
  onStartCall: (type: "voice" | "video") => void;
  onEndCall: () => void;
  userName: string;
}

export function CallIndicator({
  callStatus,
  callDuration,
  onStartCall,
  onEndCall,
  userName,
}: CallIndicatorProps) {
  return (
    <>
      {/* Header Status */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{userName}</p>
          {callStatus === "ringing" ? (
            <p className="text-xs text-orange-600 animate-pulse">Ringing...</p>
          ) : callStatus === "active" ? (
            <p className="text-xs text-emerald-600 font-semibold">
              On call • {Math.floor(callDuration / 60)}:
              {String(callDuration % 60).padStart(2, "0")}
            </p>
          ) : null}
        </div>
        {callStatus === "active" && (
          <Button
            onClick={onEndCall}
            size="sm"
            className="rounded-xl bg-red-500 hover:bg-red-600 text-white ml-2"
          >
            End Call
          </Button>
        )}
      </div>

      {/* Call in Progress Banner */}
      {callStatus === "active" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl p-3 border border-emerald-200 flex items-center gap-2"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-3 h-3 bg-emerald-500 rounded-full"
          />
          <span className="text-sm font-semibold text-emerald-700">
            Call in progress
          </span>
        </motion.div>
      )}

      {/* Call Buttons */}
      <div className="flex gap-2 mt-3">
        <Button
          onClick={() => onStartCall("voice")}
          disabled={callStatus !== "idle"}
          className="rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 active:scale-95 transition-all duration-150 disabled:opacity-70 text-white font-semibold shadow-md hover:shadow-lg"
          title="Start voice call"
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => onStartCall("video")}
          disabled={callStatus !== "idle"}
          className="rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 active:scale-95 transition-all duration-150 disabled:opacity-70 text-white font-semibold shadow-md hover:shadow-lg"
          title="Start video call"
        >
          <Video className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
