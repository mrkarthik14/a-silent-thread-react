import { Sidebar } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Calendar, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function Bookings() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const bookings = useQuery(api.bookings.list, {});
  const updateStatus = useMutation(api.bookings.updateStatus);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handleStatusUpdate = async (bookingId: any, status: any) => {
    try {
      await updateStatus({ bookingId, status });
      toast.success(`Booking ${status}`);
    } catch (error) {
      toast.error("Failed to update booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">Manage your rental requests</p>
          </motion.div>

          <div className="space-y-4">
            {bookings?.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {booking.service?.serviceDetails?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {booking.renterId === user?._id ? "Renting from" : "Renting to"}{" "}
                        {booking.renterId === user?._id ? booking.owner?.name : booking.renter?.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {booking.date}
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} border-none`}>
                      {booking.status}
                    </Badge>
                  </div>

                  <p className="text-sm mb-4 p-3 bg-pink-50 rounded-xl">
                    {booking.message}
                  </p>

                  {booking.ownerId === user?._id && booking.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStatusUpdate(booking._id, "accepted")}
                        className="flex-1 rounded-xl bg-green-400 hover:bg-green-500"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(booking._id, "rejected")}
                        variant="outline"
                        className="flex-1 rounded-xl"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}

            {bookings?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No bookings yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
