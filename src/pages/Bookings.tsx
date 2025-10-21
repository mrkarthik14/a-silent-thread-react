import { Sidebar } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Calendar, Loader2, Filter, Clock, CheckCircle, XCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function Bookings() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "accepted" | "rejected" | "completed">("all");
  const [viewMode, setViewMode] = useState<"all" | "renting" | "rented">("all");
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  // Filter bookings based on selected filters
  const filteredBookings = bookings?.filter((booking) => {
    const statusMatch = filterStatus === "all" || booking.status === filterStatus;
    const viewMatch = 
      viewMode === "all" ||
      (viewMode === "renting" && booking.renterId === user?._id) ||
      (viewMode === "rented" && booking.ownerId === user?._id);
    return statusMatch && viewMatch;
  }) || [];

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

          {/* Filter and View Options */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-4"
          >
            {/* View Mode Selector */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={viewMode === "all" ? "default" : "outline"}
                onClick={() => setViewMode("all")}
                size="sm"
                className="rounded-xl bg-gradient-to-br from-pink-200 to-pink-300 hover:from-pink-300 hover:to-pink-400 text-pink-900 font-semibold border-none"
              >
                All Bookings
              </Button>
              <Button
                variant={viewMode === "renting" ? "default" : "outline"}
                onClick={() => setViewMode("renting")}
                size="sm"
                className="rounded-xl bg-gradient-to-br from-purple-200 to-purple-300 hover:from-purple-300 hover:to-purple-400 text-purple-900 font-semibold border-none"
              >
                I'm Renting
              </Button>
              <Button
                variant={viewMode === "rented" ? "default" : "outline"}
                onClick={() => setViewMode("rented")}
                size="sm"
                className="rounded-xl bg-gradient-to-br from-blue-200 to-blue-300 hover:from-blue-300 hover:to-blue-400 text-blue-900 font-semibold border-none"
              >
                I'm Rented To
              </Button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap items-center">
              <Filter className="h-4 w-4 text-slate-600" />
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
                className="rounded-xl bg-gradient-to-br from-yellow-200 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-yellow-900 font-semibold border-none"
              >
                All Status
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
                size="sm"
                className="rounded-xl bg-gradient-to-br from-orange-200 to-orange-300 hover:from-orange-300 hover:to-orange-400 text-orange-900 font-semibold border-none"
              >
                Pending
              </Button>
              <Button
                variant={filterStatus === "accepted" ? "default" : "outline"}
                onClick={() => setFilterStatus("accepted")}
                size="sm"
                className="rounded-xl bg-gradient-to-br from-emerald-200 to-emerald-300 hover:from-emerald-300 hover:to-emerald-400 text-emerald-900 font-semibold border-none"
              >
                Accepted
              </Button>
              <Button
                variant={filterStatus === "rejected" ? "default" : "outline"}
                onClick={() => setFilterStatus("rejected")}
                size="sm"
                className="rounded-xl bg-gradient-to-br from-red-200 to-red-300 hover:from-red-300 hover:to-red-400 text-red-900 font-semibold border-none"
              >
                Rejected
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                onClick={() => setFilterStatus("completed")}
                size="sm"
                className="rounded-xl bg-gradient-to-br from-cyan-200 to-cyan-300 hover:from-cyan-300 hover:to-cyan-400 text-cyan-900 font-semibold border-none"
              >
                Completed
              </Button>
            </div>
          </motion.div>

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
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
                    <Badge className={`${getStatusColor(booking.status)} border-none flex items-center gap-1`}>
                      {getStatusIcon(booking.status)}
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

            {filteredBookings.length === 0 && (
              <div className="text-center py-12 text-slate-600">
                No bookings found with the selected filters
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