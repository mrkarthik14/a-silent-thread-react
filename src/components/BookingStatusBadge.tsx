import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface BookingStatusBadgeProps {
  serviceId: Id<"posts">;
}

export function BookingStatusBadge({ serviceId }: BookingStatusBadgeProps) {
  const bookings = useQuery(api.bookings.list, {});
  
  if (!bookings) return null;

  const serviceBookings = bookings.filter(b => b.serviceId === serviceId);
  const pendingCount = serviceBookings.filter(b => b.status === "pending").length;
  const acceptedCount = serviceBookings.filter(b => b.status === "accepted").length;

  if (pendingCount === 0 && acceptedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex gap-2"
    >
      {pendingCount > 0 && (
        <Badge className="bg-gradient-to-r from-orange-300 to-amber-300 text-orange-900 border-none flex items-center gap-1 text-xs font-semibold">
          <Clock className="h-3 w-3" />
          {pendingCount} pending
        </Badge>
      )}
      {acceptedCount > 0 && (
        <Badge className="bg-gradient-to-r from-emerald-300 to-teal-300 text-emerald-900 border-none flex items-center gap-1 text-xs font-semibold">
          ✓ {acceptedCount} active
        </Badge>
      )}
    </motion.div>
  );
}
