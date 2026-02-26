# Screenshot Functionality Guide

This guide explains how to use the screenshot functionality in your React application using html2canvas.

## Quick Start

### 1. Basic Usage

```tsx
import { useRef } from 'react';
import { captureElementScreenshot } from '@/utils/screenshot';
import { Button } from '@/components/ui/button';

function MyComponent() {
  const targetRef = useRef<HTMLDivElement>(null);

  const handleScreenshot = async () => {
    if (targetRef.current) {
      await captureElementScreenshot(targetRef.current, {
        filename: 'my-screenshot.png',
      });
    }
  };

  return (
    <div>
      <div ref={targetRef}>
        {/* Content to capture */}
        <h1>Capture This!</h1>
      </div>
      <Button onClick={handleScreenshot}>Take Screenshot</Button>
    </div>
  );
}
```

### 2. Using the ScreenshotButton Component

```tsx
import { useRef } from 'react';
import { ScreenshotButton } from '@/components/ScreenshotButton';

function MyComponent() {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div ref={contentRef}>
        {/* Content to capture */}
      </div>
      <ScreenshotButton
        targetRef={contentRef}
        filename="screenshot.png"
      />
    </div>
  );
}
```

## Common Issues & Solutions

### Issue 1: Download Not Triggering

**Problem**: The screenshot captures but the download doesn't start.

**Solutions**:
1. **Use the blob method** (default in our implementation):
   ```ts
   await captureElementScreenshot(element, { filename: 'screenshot.png' });
   ```

2. **Try the DataURL method** if blob doesn't work:
   ```ts
   await captureElementScreenshotDataURL(element, { filename: 'screenshot.png' });
   ```

3. **Check browser popup blockers**: Some browsers block automatic downloads. Make sure the download is triggered by a user action (button click).

### Issue 2: CORS Errors with Images

**Problem**: "Tainted canvases may not be exported" or CORS errors when capturing images from external sources.

**Solutions**:

1. **Enable useCORS** (enabled by default):
   ```ts
   await captureElementScreenshot(element, {
     useCORS: true,
   });
   ```

2. **For images you control**, add CORS headers:
   ```
   Access-Control-Allow-Origin: *
   ```

3. **For external images**, use a proxy or set `allowTaint`:
   ```ts
   await captureElementScreenshot(element, {
     allowTaint: true, // Warning: may cause security issues
   });
   ```

4. **Use Convex file storage**: Upload images to Convex storage, which handles CORS automatically:
   ```ts
   const imageUrl = await ctx.storage.getUrl(fileId);
   // Use imageUrl in your component
   ```

### Issue 3: Canvas toDataURL() Security Error

**Problem**: "Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported."

**Solutions**:
1. Enable `useCORS: true` in options
2. Ensure all images have proper CORS headers
3. Use `allowTaint: true` for mixed-origin content (with caution)
4. Host images on the same domain or use a proxy

### Issue 4: Blank or Incomplete Screenshot

**Problem**: Screenshot is blank or missing some content.

**Solutions**:

1. **Increase image timeout**:
   ```ts
   await captureElementScreenshot(element, {
     imageTimeout: 30000, // Wait 30 seconds for images
   });
   ```

2. **Wait for images to load**:
   ```ts
   const handleScreenshot = async () => {
     // Wait for all images to load
     const images = element.querySelectorAll('img');
     await Promise.all(
       Array.from(images).map(
         (img) =>
           new Promise((resolve) => {
             if (img.complete) resolve(true);
             else img.onload = () => resolve(true);
           })
       )
     );

     await captureElementScreenshot(element);
   };
   ```

3. **Check element visibility**: Ensure the element is visible and has dimensions.

### Issue 5: Low Quality Screenshots

**Problem**: Screenshot looks blurry or pixelated.

**Solution**: Increase the scale:
```ts
await captureElementScreenshot(element, {
  scale: 3, // Higher scale = better quality (but larger file)
});
```

### Issue 6: Background Not Captured

**Problem**: Transparent or missing background.

**Solution**: Set a background color:
```ts
await captureElementScreenshot(element, {
  backgroundColor: '#ffffff', // or any color
});
```

## Advanced Usage

### Ignore Specific Elements

Add the `no-screenshot` class to elements you want to exclude:
```tsx
<div ref={targetRef}>
  <h1>Captured Content</h1>
  <div className="no-screenshot">
    This won't appear in the screenshot
  </div>
</div>
```

### Get Canvas for Further Processing

```ts
import { getElementCanvas } from '@/utils/screenshot';

const canvas = await getElementCanvas(element);
// Now you can:
// 1. Convert to different format
const blob = await new Promise(resolve =>
  canvas.toBlob(resolve, 'image/jpeg', 0.8)
);

// 2. Upload to Convex
const file = new File([blob!], 'screenshot.jpg');
const storageId = await generateUploadUrl();
// ... upload to Convex storage
```

### Capture with Custom Options

```ts
await captureElementScreenshot(element, {
  filename: `screenshot-${Date.now()}.png`,
  backgroundColor: '#f0f0f0',
  scale: 2,
  useCORS: true,
  allowTaint: false,
  logging: true, // Enable for debugging
});
```

## Best Practices

1. **Always trigger from user action**: Don't auto-download on page load
2. **Show loading state**: Screenshots can take a few seconds
3. **Handle errors**: Wrap in try-catch and show user-friendly messages
4. **Optimize scale**: Balance quality vs file size (scale: 2 is usually good)
5. **Test with real content**: Test with actual images and styles you'll use
6. **Consider mobile**: Screenshots work on mobile but may be slower

## Debugging

Enable logging to see what html2canvas is doing:
```ts
await captureElementScreenshot(element, {
  logging: true,
});
```

Check the browser console for:
- CORS errors
- Image loading failures
- Element dimensions
- Canvas creation errors

## Performance Tips

1. **Limit capture area**: Capture only what's needed, not the whole page
2. **Optimize images**: Use compressed images in your content
3. **Reduce scale**: Lower scale = faster capture
4. **Cache canvases**: If capturing the same content multiple times
5. **Lazy load**: Only load html2canvas when needed (dynamic import)

## Browser Support

html2canvas works in all modern browsers:
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (may need useCORS)
- Mobile: ✅ Works but may be slower

## Example: Upload Screenshot to Convex

```tsx
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { getElementCanvas } from '@/utils/screenshot';

function UploadScreenshot() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveScreenshot = useMutation(api.files.saveScreenshot);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCapture = async () => {
    if (!contentRef.current) return;

    try {
      // 1. Get canvas
      const canvas = await getElementCanvas(contentRef.current);

      // 2. Convert to blob
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );

      // 3. Get upload URL
      const uploadUrl = await generateUploadUrl();

      // 4. Upload
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: blob,
      });
      const { storageId } = await response.json();

      // 5. Save to database
      await saveScreenshot({ storageId, name: 'screenshot.png' });

      toast.success('Screenshot uploaded!');
    } catch (error) {
      toast.error('Failed to upload screenshot');
    }
  };

  return (
    <div>
      <div ref={contentRef}>{/* content */}</div>
      <Button onClick={handleCapture}>Capture & Upload</Button>
    </div>
  );
}
```

## Resources

- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
