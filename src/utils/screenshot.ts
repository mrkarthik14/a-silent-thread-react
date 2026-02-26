import html2canvas from 'html2canvas';
import { toast } from 'sonner';

export interface ScreenshotOptions {
  filename?: string;
  backgroundColor?: string;
  scale?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
  logging?: boolean;
}

/**
 * Captures a screenshot of a specific DOM element and triggers download
 * @param element - The DOM element to capture
 * @param options - Screenshot configuration options
 * @returns Promise that resolves when screenshot is complete
 */
export async function captureElementScreenshot(
  element: HTMLElement,
  options: ScreenshotOptions = {}
): Promise<void> {
  const {
    filename = `screenshot-${Date.now()}.png`,
    backgroundColor = '#ffffff',
    scale = 2,
    useCORS = true,
    allowTaint = false,
    logging = false,
  } = options;

  try {
    // Show loading toast
    const loadingToast = toast.loading('Capturing screenshot...');

    // Capture the element with html2canvas
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale,
      useCORS, // This helps with CORS issues for external images
      allowTaint, // Set to true if you have cross-origin images
      logging, // Enable for debugging
      imageTimeout: 15000, // Wait up to 15 seconds for images to load
      removeContainer: true,
      // Ignore certain elements if needed
      ignoreElements: (el) => {
        // Optionally ignore elements with specific classes
        return el.classList?.contains('no-screenshot') || false;
      },
    });

    // Dismiss loading toast
    toast.dismiss(loadingToast);

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error('Failed to create screenshot');
            reject(new Error('Failed to create blob from canvas'));
            return;
          }

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;

          // Append to body, click, and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up the object URL after a short delay
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 100);

          toast.success('Screenshot saved successfully!');
          resolve();
        },
        'image/png',
        1.0 // Quality (1.0 = highest)
      );
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    toast.error(
      error instanceof Error
        ? `Screenshot failed: ${error.message}`
        : 'Failed to capture screenshot'
    );
    throw error;
  }
}

/**
 * Alternative method using canvas.toDataURL if toBlob doesn't work
 * @param element - The DOM element to capture
 * @param options - Screenshot configuration options
 */
export async function captureElementScreenshotDataURL(
  element: HTMLElement,
  options: ScreenshotOptions = {}
): Promise<void> {
  const {
    filename = `screenshot-${Date.now()}.png`,
    backgroundColor = '#ffffff',
    scale = 2,
    useCORS = true,
    allowTaint = false,
    logging = false,
  } = options;

  try {
    const loadingToast = toast.loading('Capturing screenshot...');

    const canvas = await html2canvas(element, {
      backgroundColor,
      scale,
      useCORS,
      allowTaint,
      logging,
      imageTimeout: 15000,
      removeContainer: true,
    });

    toast.dismiss(loadingToast);

    // Use toDataURL instead of toBlob
    const dataURL = canvas.toDataURL('image/png', 1.0);

    // Create download link
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);

    toast.success('Screenshot saved successfully!');
  } catch (error) {
    console.error('Screenshot error:', error);
    toast.error(
      error instanceof Error
        ? `Screenshot failed: ${error.message}`
        : 'Failed to capture screenshot'
    );
    throw error;
  }
}

/**
 * Returns the canvas without downloading - useful for further processing
 * @param element - The DOM element to capture
 * @param options - Screenshot configuration options
 * @returns Promise<HTMLCanvasElement>
 */
export async function getElementCanvas(
  element: HTMLElement,
  options: Omit<ScreenshotOptions, 'filename'> = {}
): Promise<HTMLCanvasElement> {
  const {
    backgroundColor = '#ffffff',
    scale = 2,
    useCORS = true,
    allowTaint = false,
    logging = false,
  } = options;

  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale,
      useCORS,
      allowTaint,
      logging,
      imageTimeout: 15000,
      removeContainer: true,
    });

    return canvas;
  } catch (error) {
    console.error('Canvas generation error:', error);
    throw error;
  }
}
