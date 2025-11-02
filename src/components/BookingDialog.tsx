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
        <DialogContent className="rounded-2xl max-w-md bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-emerald-200">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
            </motion.div>

            <DialogHeader className="text-center">
              <DialogTitle className="text-slate-900 text-xl">Booking Confirmed!</DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full space-y-4 my-4"
            >
              <p className="text-slate-700 text-sm">
                Your booking request has been successfully sent to the service owner.
              </p>

              <div className="bg-white/60 rounded-xl p-4 space-y-3 text-left">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Preferred Date</p>
                  <p className="text-sm font-semibold text-slate-900">{bookingDetails?.date}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Your Message</p>
                  <p className="text-sm text-slate-800 line-clamp-2">{bookingDetails?.message}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-900">
                  ℹ️ The owner will review your request and respond within 24 hours.
                </p>
              </div>
            </motion.div>

            <Button
              onClick={handleConfirmationClose}
              className="w-full rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold active:scale-95 transition-all duration-150"
            >
              Done
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}