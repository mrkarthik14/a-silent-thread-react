import { useCallback, useState, useRef } from 'react';
import { captureElementScreenshot, captureElementScreenshotDataURL, ScreenshotOptions } from '@/utils/screenshot';

export interface UseScreenshotOptions extends ScreenshotOptions {
  useDataURL?: boolean;
}

/**
 * Hook for easy screenshot capture functionality
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { ref, capture, isCapturing } = useScreenshot();
 *
 *   return (
 *     <>
 *       <div ref={ref}>Content to capture</div>
 *       <Button onClick={() => capture({ filename: 'my-screenshot.png' })} disabled={isCapturing}>
 *         {isCapturing ? 'Capturing...' : 'Screenshot'}
 *       </Button>
 *     </>
 *   );
 * }
 * ```
 */
export function useScreenshot<T extends HTMLElement = HTMLDivElement>(
  defaultOptions?: UseScreenshotOptions
) {
  const ref = useRef<T>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const capture = useCallback(
    async (options?: UseScreenshotOptions) => {
      if (!ref.current) {
        const error = new Error('Target element not found');
        setError(error);
        throw error;
      }

      setIsCapturing(true);
      setError(null);

      try {
        const mergedOptions = { ...defaultOptions, ...options };
        const { useDataURL, ...screenshotOptions } = mergedOptions;

        if (useDataURL) {
          await captureElementScreenshotDataURL(ref.current, screenshotOptions);
        } else {
          await captureElementScreenshot(ref.current, screenshotOptions);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Screenshot failed');
        setError(error);
        throw error;
      } finally {
        setIsCapturing(false);
      }
    },
    [defaultOptions]
  );

  return {
    ref,
    capture,
    isCapturing,
    error,
  };
}

/**
 * Hook that provides a ready-to-use screenshot button handler
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { targetRef, buttonProps } = useScreenshotButton({
 *     filename: 'my-screenshot.png',
 *     scale: 2,
 *   });
 *
 *   return (
 *     <>
 *       <div ref={targetRef}>Content to capture</div>
 *       <Button {...buttonProps}>
 *         {buttonProps.disabled ? 'Capturing...' : 'Screenshot'}
 *       </Button>
 *     </>
 *   );
 * }
 * ```
 */
export function useScreenshotButton<T extends HTMLElement = HTMLDivElement>(
  options?: UseScreenshotOptions
) {
  const { ref, capture, isCapturing, error } = useScreenshot<T>(options);

  const buttonProps = {
    onClick: () => capture(options),
    disabled: isCapturing,
  };

  return {
    targetRef: ref,
    buttonProps,
    isCapturing,
    error,
    capture,
  };
}

/**
 * Advanced hook with more control and callback support
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { ref, capture, isCapturing, reset } = useScreenshotAdvanced({
 *     onSuccess: (canvas) => {
 *       console.log('Screenshot captured!', canvas);
 *     },
 *     onError: (error) => {
 *       console.error('Screenshot failed:', error);
 *     },
 *   });
 *
 *   return (
 *     <>
 *       <div ref={ref}>Content</div>
 *       <Button onClick={() => capture()}>Capture</Button>
 *     </>
 *   );
 * }
 * ```
 */
export function useScreenshotAdvanced<T extends HTMLElement = HTMLDivElement>(config?: {
  defaultOptions?: UseScreenshotOptions;
  onSuccess?: (canvas: HTMLCanvasElement) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onComplete?: () => void;
}) {
  const ref = useRef<T>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastCanvas, setLastCanvas] = useState<HTMLCanvasElement | null>(null);

  const capture = useCallback(
    async (options?: UseScreenshotOptions) => {
      if (!ref.current) {
        const error = new Error('Target element not found');
        setError(error);
        config?.onError?.(error);
        throw error;
      }

      setIsCapturing(true);
      setError(null);
      config?.onStart?.();

      try {
        const mergedOptions = { ...config?.defaultOptions, ...options };
        const { useDataURL, ...screenshotOptions } = mergedOptions;

        // Import dynamically to get canvas
        const { getElementCanvas } = await import('@/utils/screenshot');
        const canvas = await getElementCanvas(ref.current, screenshotOptions);

        setLastCanvas(canvas);

        // Now trigger download
        if (useDataURL) {
          await captureElementScreenshotDataURL(ref.current, screenshotOptions);
        } else {
          await captureElementScreenshot(ref.current, screenshotOptions);
        }

        config?.onSuccess?.(canvas);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Screenshot failed');
        setError(error);
        config?.onError?.(error);
        throw error;
      } finally {
        setIsCapturing(false);
        config?.onComplete?.();
      }
    },
    [config]
  );

  const reset = useCallback(() => {
    setError(null);
    setLastCanvas(null);
  }, []);

  return {
    ref,
    capture,
    isCapturing,
    error,
    lastCanvas,
    reset,
  };
}
