import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: Id<"posts">;
}

export function BookingDialog({ open, onOpenChange, serviceId }: BookingDialogProps) {
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      toast.success("Booking request sent!");
      onOpenChange(false);
      setDate("");
      setMessage("");
    } catch (error) {
      toast.error("Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle>Book This Service</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Preferred Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div>
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the owner about your booking request..."
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 rounded-xl active:scale-95 transition-all duration-150 disabled:opacity-70"
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
              className="flex-1 rounded-xl active:scale-95 transition-all duration-150"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
