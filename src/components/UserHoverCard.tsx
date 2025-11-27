import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useNavigate } from "react-router";
import { CalendarDays } from "lucide-react";

interface UserHoverCardProps {
  userId?: string;
  user?: any;
  children: React.ReactNode;
}

export function UserHoverCard({ userId, user: initialUser, children }: UserHoverCardProps) {
  const navigate = useNavigate();
  const idToUse = (userId || initialUser?._id) as Id<"users"> | undefined;
  
  const userData = useQuery(api.users.getUser, idToUse ? { userId: idToUse } : "skip");
  const user = userData || initialUser;
  
  const followerCount = useQuery(api.follows.getFollowerCount, idToUse ? { userId: idToUse } : "skip");
  const followingCount = useQuery(api.follows.getFollowingCount, idToUse ? { userId: idToUse } : "skip");

  if (!user) {
    return <>{children}</>;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div 
          className="cursor-pointer inline-block" 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${user._id}`);
          }}
        >
            {children}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4 rounded-xl shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] z-50">
        <div className="flex gap-4">
          <Avatar className="h-14 w-14 border-2 border-white dark:border-slate-700 shadow-sm cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
            <AvatarImage src={user.image} />
            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer hover:underline" onClick={() => navigate(`/profile/${user._id}`)}>{user.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">@{user.email?.split('@')[0]}</p>
            
            <div className="flex items-center pt-2 text-xs text-muted-foreground">
              <CalendarDays className="mr-2 h-3 w-3 opacity-70" />
              <span>
                Joined {new Date(user._creationTime).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
            </div>
            
            <div className="flex gap-4 pt-3">
                <div className="flex gap-1 text-xs items-center hover:underline cursor-pointer">
                    <span className="font-bold text-slate-900 dark:text-white">{followingCount ?? 0}</span>
                    <span className="text-slate-500 dark:text-slate-400">Following</span>
                </div>
                <div className="flex gap-1 text-xs items-center hover:underline cursor-pointer">
                    <span className="font-bold text-slate-900 dark:text-white">{followerCount ?? 0}</span>
                    <span className="text-slate-500 dark:text-slate-400">Followers</span>
                </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
