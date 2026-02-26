# Screenshot Quick Reference

## Using Hooks (Recommended - Easiest)

### Basic Hook
```tsx
import { useScreenshot } from '@/hooks/use-screenshot';

function MyComponent() {
  const { ref, capture, isCapturing } = useScreenshot();

  return (
    <>
      <div ref={ref}>Content to capture</div>
      <button onClick={() => capture({ filename: 'screenshot.png' })} disabled={isCapturing}>
        {isCapturing ? 'Capturing...' : 'Screenshot'}
      </button>
    </>
  );
}
```

### Button Hook (Even Simpler)
```tsx
import { useScreenshotButton } from '@/hooks/use-screenshot';
import { Button } from '@/components/ui/button';

function MyComponent() {
  const { targetRef, buttonProps, isCapturing } = useScreenshotButton({
    filename: 'my-screenshot.png',
    scale: 2,
  });

  return (
    <>
      <div ref={targetRef}>Content to capture</div>
      <Button {...buttonProps}>
        {isCapturing ? 'Capturing...' : 'Screenshot'}
      </Button>
    </>
  );
}
```

### Advanced Hook with Callbacks
```tsx
import { useScreenshotAdvanced } from '@/hooks/use-screenshot';

function MyComponent() {
  const { ref, capture, isCapturing, lastCanvas } = useScreenshotAdvanced({
    onSuccess: (canvas) => console.log('Success!', canvas),
    onError: (error) => console.error('Failed:', error),
    defaultOptions: { scale: 3 },
  });

  return (
    <>
      <div ref={ref}>Content</div>
      <button onClick={() => capture()}>Capture</button>
    </>
  );
}
```

## Basic Usage (Direct Function Calls)

```tsx
import { useRef } from 'react';
import { captureElementScreenshot } from '@/utils/screenshot';

function MyComponent() {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={targetRef}>Content to capture</div>
      <button onClick={() => captureElementScreenshot(targetRef.current)}>
        Screenshot
      </button>
    </>
  );
}
```

## Using the Component

```tsx
import { useRef } from 'react';
import { ScreenshotButton } from '@/components/ScreenshotButton';

function MyComponent() {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={targetRef}>Content to capture</div>
      <ScreenshotButton targetRef={targetRef} filename="my-screenshot.png" />
    </>
  );
}
```

## Common Options

```tsx
// High quality
await captureElementScreenshot(element, {
  scale: 3,
  filename: 'high-quality.png'
});

// With background
await captureElementScreenshot(element, {
  backgroundColor: '#ffffff',
});

// Handle CORS
await captureElementScreenshot(element, {
  useCORS: true,
  imageTimeout: 30000,
});

// Allow tainted canvas (for cross-origin images)
await captureElementScreenshot(element, {
  allowTaint: true,
});

// Enable debugging
await captureElementScreenshot(element, {
  logging: true,
});
```

## Alternative Methods

### DataURL Method (if blob fails)
```tsx
import { captureElementScreenshotDataURL } from '@/utils/screenshot';

await captureElementScreenshotDataURL(element, {
  filename: 'screenshot.png'
});
```

### Get Canvas (for custom processing)
```tsx
import { getElementCanvas } from '@/utils/screenshot';

const canvas = await getElementCanvas(element);
const blob = await new Promise(resolve =>
  canvas.toBlob(resolve, 'image/jpeg', 0.8)
);
// Use blob...
```

## Excluding Elements

Add `no-screenshot` class to elements you want to exclude:

```tsx
<div ref={targetRef}>
  <h1>This will be captured</h1>
  <div className="no-screenshot">
    This won't appear in screenshot
  </div>
</div>
```

## Error Handling

```tsx
try {
  await captureElementScreenshot(element, {
    filename: 'screenshot.png'
  });
  // Success - toast notification shown automatically
} catch (error) {
  // Error - toast notification shown automatically
  console.error('Screenshot failed:', error);
}
```

## Images with CORS

```tsx
// Add crossOrigin attribute to images
<img
  src="https://example.com/image.jpg"
  crossOrigin="anonymous"
  alt="Example"
/>

// Then capture with useCORS
await captureElementScreenshot(element, {
  useCORS: true,
});
```

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Download not triggering | Try `useDataURL={true}` on ScreenshotButton |
| CORS error | Add `useCORS: true` and `crossOrigin="anonymous"` to images |
| Blank screenshot | Increase `imageTimeout: 30000` |
| Low quality | Increase `scale: 3` |
| Transparent background | Set `backgroundColor: '#ffffff'` |

## Test Page

Visit `/screenshot-test` to try different methods and troubleshoot issues.

## Complete Documentation

See `docs/SCREENSHOT_GUIDE.md` for comprehensive documentation.
