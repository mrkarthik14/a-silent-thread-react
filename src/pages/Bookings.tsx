import { Sidebar } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Calendar, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function Bookings() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bookingId: string | null;
    action: string | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    bookingId: null,
    action: null,
    isLoading: false,
  });
  
  const bookings = useQuery(api.bookings.list, {});
  const updateStatus = useMutation(api.bookings.updateStatus);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handleStatusUpdate = (bookingId: string, status: string) => {
    setConfirmDialog({
      isOpen: true,
      bookingId,
      action: status,
      isLoading: false,
    });
  };

  const confirmStatusUpdate = async () => {
    if (!confirmDialog.bookingId || !confirmDialog.action) return;
    
    setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      await updateStatus({ 
        bookingId: confirmDialog.bookingId as any, 
        status: confirmDialog.action as any 
      });
      toast.success(`Booking ${confirmDialog.action}`);
      setConfirmDialog({
        isOpen: false,
        bookingId: null,
        action: null,
        isLoading: false,
      });
    } catch (error) {
      toast.error("Failed to update booking");
      setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-200 text-yellow-900";
      case "accepted": return "bg-emerald-200 text-emerald-900";
      case "rejected": return "bg-pink-200 text-pink-900";
      case "completed": return "bg-blue-200 text-blue-900";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto ml-0 md:ml-20">
        <div className="max-w-4xl mx-auto p-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bookings</h1>
            <p className="text-slate-600">Manage your rental requests</p>
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
                      <h3 className="font-semibold text-lg mb-1 text-slate-900">
                        {booking.service?.serviceDetails?.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {booking.renterId === user?._id ? "Renting from" : "Renting to"}{" "}
                        {booking.renterId === user?._id ? booking.owner?.name : booking.renter?.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        {booking.date}
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(booking.status)} border-none`}>
                      {booking.status}
                    </Badge>
                  </div>

                  <p className="text-sm mb-4 p-3 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl text-slate-900">
                    {booking.message}
                  </p>

                  {booking.ownerId === user?._id && booking.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStatusUpdate(booking._id, "accepted")}
                        className="flex-1 rounded-xl bg-gradient-to-br from-emerald-200 to-emerald-300 hover:from-emerald-300 hover:to-emerald-400 text-emerald-900"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(booking._id, "rejected")}
                        variant="outline"
                        className="flex-1 rounded-xl border-slate-200"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}

            {bookings?.length === 0 && (
              <div className="text-center py-12 text-slate-600">
                No bookings yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setConfirmDialog({
            isOpen: false,
            bookingId: null,
            action: null,
            isLoading: false,
          });
        }
      }}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmDialog.action} this booking request?
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={confirmStatusUpdate}
              disabled={confirmDialog.isLoading}
              className={`flex-1 rounded-xl active:scale-95 transition-all duration-150 disabled:opacity-70 ${
                confirmDialog.action === "accepted"
                  ? "bg-gradient-to-br from-emerald-200 to-emerald-300 hover:from-emerald-300 hover:to-emerald-400 text-emerald-900"
                  : "bg-gradient-to-br from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 text-pink-900"
              }`}
            >
              {confirmDialog.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Confirm ${confirmDialog.action}`
              )}
            </Button>
            <Button
              onClick={() => setConfirmDialog({
                isOpen: false,
                bookingId: null,
                action: null,
                isLoading: false,
              })}
              variant="outline"
              className="flex-1 rounded-xl active:scale-95 transition-all duration-150"
              disabled={confirmDialog.isLoading}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}