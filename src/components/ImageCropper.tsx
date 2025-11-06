import { useState } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
}

export function ImageCropper({ open, onOpenChange, imageSrc, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleCropAreaChange = (_croppedArea: any, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    if (!croppedAreaPixels) return;

    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          onCropComplete(url);
          onOpenChange(false);
        }
      }, "image/jpeg");
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative w-full h-96 bg-slate-100 rounded-xl overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropAreaChange={handleCropAreaChange}
              onZoomChange={setZoom}
            />
          </div>

          <div className="space-y-2">
            <Label>Zoom</Label>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCrop}
              className="rounded-xl"
            >
              Save Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
