import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: Id<"posts">;
}

export function BookingDialog({ open, onOpenChange, serviceId }: BookingDialogProps) {
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{ date: string; message: string } | null>(null);
  const createBooking = useMutation(api.bookings.create);

  const handleSubmit = async () => {
    if (!date.trim()) {
      toast.error("Please select a date");
      return;
    }
    if (!message.trim()) {
      toast.error("Please add a message");
      return;
    }

    setIsLoading(true);
    try {
      await createBooking({
        serviceId,
        date,
        message,
      });
      
      // Show confirmation dialog
      setBookingDetails({ date, message });
      setShowConfirmation(true);
      toast.success("Booking request sent!");
      
      // Reset form
      setDate("");
      setMessage("");
    } catch (error) {
      toast.error("Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setBookingDetails(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !showConfirmation} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-2xl max-w-md bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Book This Service</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-900 font-semibold">Preferred Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border-slate-200 focus:border-purple-400"
              />
            </div>

            <div>
              <Label className="text-slate-900 font-semibold">Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the owner about your booking request..."
                className="rounded-xl resize-none border-slate-200 focus:border-purple-400"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 rounded-xl active:scale-95 transition-all duration-150 disabled:opacity-70 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Send Booking Request"
                )}
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1 rounded-xl active:scale-95 transition-all duration-150 border-slate-300 text-slate-900 hover:bg-slate-100"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={handleConfirmationClose}>
        <DialogContent className="rounded-2xl max-w-md bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300 shadow-2xl">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
            className="flex flex-col items-center text-center py-2"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 150 }}
              className="relative mb-6"
            >
              <motion.div
                animate={{ boxShadow: ["0 0 0 0 rgba(16, 185, 129, 0.7)", "0 0 0 20px rgba(16, 185, 129, 0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
              />
              <CheckCircle className="h-20 w-20 text-emerald-500 relative z-10" strokeWidth={1.5} />
            </motion.div>

            <DialogHeader className="text-center mb-2">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Booking Confirmed!
              </DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="w-full space-y-4 my-6"
            >
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                Your booking request has been successfully sent to the service owner.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-gradient-to-br from-white/80 to-emerald-50/50 rounded-xl p-4 space-y-4 text-left border border-emerald-200/50 shadow-sm"
              >
                <div className="border-b border-emerald-100/50 pb-3">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">📅 Preferred Date</p>
                  <p className="text-base font-semibold text-slate-900">{bookingDetails?.date}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">💬 Your Message</p>
                  <p className="text-sm text-slate-800 leading-relaxed">{bookingDetails?.message}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm"
              >
                <p className="text-xs text-blue-900 font-medium leading-relaxed">
                  <span className="text-lg mr-2">ℹ️</span>The owner will review your request and respond within 24 hours.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="w-full"
            >
              <Button
                onClick={handleConfirmationClose}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-bold text-base active:scale-95 transition-all duration-150 shadow-lg hover:shadow-xl py-6"
              >
                Done
              </Button>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}