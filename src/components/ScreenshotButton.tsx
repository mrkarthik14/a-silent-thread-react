import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Download } from 'lucide-react';
import { captureElementScreenshot, captureElementScreenshotDataURL } from '@/utils/screenshot';

interface ScreenshotButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  filename?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  useDataURL?: boolean;
  children?: React.ReactNode;
}

/**
 * Button component that captures a screenshot of a target element
 * Usage:
 * ```tsx
 * const targetRef = useRef<HTMLDivElement>(null);
 *
 * <div ref={targetRef}>Content to capture</div>
 * <ScreenshotButton targetRef={targetRef} filename="my-screenshot.png" />
 * ```
 */
export function ScreenshotButton({
  targetRef,
  filename,
  variant = 'default',
  useDataURL = false,
  children,
}: ScreenshotButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!targetRef.current) {
      console.error('Target element not found');
      return;
    }

    setIsCapturing(true);
    try {
      if (useDataURL) {
        await captureElementScreenshotDataURL(targetRef.current, {
          filename,
          useCORS: true,
          scale: 2,
        });
      } else {
        await captureElementScreenshot(targetRef.current, {
          filename,
          useCORS: true,
          scale: 2,
        });
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Button
      onClick={handleCapture}
      disabled={isCapturing}
      variant={variant}
      className="gap-2"
    >
      {isCapturing ? (
        <>
          <Download className="h-4 w-4 animate-bounce" />
          Capturing...
        </>
      ) : (
        <>
          <Camera className="h-4 w-4" />
          {children || 'Screenshot'}
        </>
      )}
    </Button>
  );
}

/**
 * Example usage component showing different scenarios
 */
export function ScreenshotExample() {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4 p-4">
      {/* Content to capture */}
      <div
        ref={contentRef}
        className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200"
      >
        <h2 className="text-2xl font-bold mb-4">Capture This Content</h2>
        <p className="text-gray-700 mb-4">
          This div will be captured when you click the screenshot button below.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold">Box 1</h3>
            <p>Some content here</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold">Box 2</h3>
            <p>More content here</p>
          </div>
        </div>

        {/* This element will be ignored in screenshots */}
        <div className="no-screenshot mt-4 text-sm text-gray-500">
          This text has the 'no-screenshot' class and will be ignored
        </div>
      </div>

      {/* Screenshot buttons */}
      <div className="flex gap-2">
        <ScreenshotButton
          targetRef={contentRef}
          filename="my-custom-screenshot.png"
        />

        <ScreenshotButton
          targetRef={contentRef}
          filename="screenshot-dataurl.png"
          variant="outline"
          useDataURL={true}
        >
          Screenshot (DataURL)
        </ScreenshotButton>
      </div>
    </div>
  );
}
