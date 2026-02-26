import { useRef } from 'react';
import { ScreenshotButton } from '@/components/ScreenshotButton';
import { captureElementScreenshot, captureElementScreenshotDataURL } from '@/utils/screenshot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Download, Image as ImageIcon } from 'lucide-react';

export default function ScreenshotTest() {
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const fullPageRef = useRef<HTMLDivElement>(null);

  const handleManualCapture = async (element: HTMLElement | null, method: 'blob' | 'dataurl') => {
    if (!element) return;

    try {
      if (method === 'blob') {
        await captureElementScreenshot(element, {
          filename: `manual-screenshot-${Date.now()}.png`,
          scale: 2,
          useCORS: true,
        });
      } else {
        await captureElementScreenshotDataURL(element, {
          filename: `manual-screenshot-dataurl-${Date.now()}.png`,
          scale: 2,
          useCORS: true,
        });
      }
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  return (
    <div ref={fullPageRef} className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Screenshot Test Page
          </h1>
          <p className="text-gray-600">
            Test different screenshot methods and troubleshoot issues
          </p>
        </div>

        {/* Test Card 1 - Simple Content */}
        <Card ref={card1Ref} className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Test Card 1: Simple Content
            </CardTitle>
            <CardDescription className="text-blue-100">
              Basic text and styling - no external images
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-gray-700">
              This card contains simple content without any external images. It should
              capture perfectly without any CORS issues.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-100 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">123</div>
                <div className="text-sm text-gray-600">Metric 1</div>
              </div>
              <div className="p-4 bg-purple-100 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">456</div>
                <div className="text-sm text-gray-600">Metric 2</div>
              </div>
              <div className="p-4 bg-pink-100 rounded-lg text-center">
                <div className="text-2xl font-bold text-pink-600">789</div>
                <div className="text-sm text-gray-600">Metric 3</div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <ScreenshotButton
                targetRef={card1Ref}
                filename="card1-screenshot.png"
              >
                Screenshot (Blob)
              </ScreenshotButton>

              <ScreenshotButton
                targetRef={card1Ref}
                filename="card1-screenshot-dataurl.png"
                variant="outline"
                useDataURL={true}
              >
                Screenshot (DataURL)
              </ScreenshotButton>

              <Button
                variant="secondary"
                onClick={() => handleManualCapture(card1Ref.current, 'blob')}
              >
                <Download className="h-4 w-4 mr-2" />
                Manual Blob
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Card 2 - With Images */}
        <Card ref={card2Ref} className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Test Card 2: With Images
            </CardTitle>
            <CardDescription className="text-purple-100">
              Contains placeholder images from external source
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-gray-700">
              This card contains images from an external source. If CORS is configured
              properly, these should be captured. Otherwise, you'll see CORS errors.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <img
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400"
                  alt="Sample 1"
                  className="w-full h-48 object-cover rounded-lg"
                  crossOrigin="anonymous"
                />
                <p className="text-sm text-gray-600 text-center">
                  Image with crossOrigin
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  Gradient Background
                </div>
                <p className="text-sm text-gray-600 text-center">Pure CSS</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <ScreenshotButton
                targetRef={card2Ref}
                filename="card2-screenshot.png"
              >
                Screenshot (CORS)
              </ScreenshotButton>

              <Button
                variant="outline"
                onClick={() => handleManualCapture(card2Ref.current, 'dataurl')}
              >
                <Download className="h-4 w-4 mr-2" />
                Manual DataURL
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Card 3 - Complex Layout */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardTitle>Test Card 3: Complex Layout</CardTitle>
            <CardDescription className="text-pink-100">
              Mixed content with various elements
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Features</h3>
                <ul className="space-y-2">
                  {['High quality capture', 'CORS support', 'Custom filename', 'Multiple formats'].map(
                    (feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Captures</span>
                    <span className="font-bold text-pink-600">1,234</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-bold text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Avg Time</span>
                    <span className="font-bold text-blue-600">2.3s</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="no-screenshot p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ This element has the 'no-screenshot' class and will be excluded from captures
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Full Page Capture */}
        <Card className="shadow-lg border-2 border-purple-200">
          <CardHeader>
            <CardTitle>Capture Entire Page</CardTitle>
            <CardDescription>
              Screenshot the entire visible content on this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Click the button below to capture everything above (including all cards)
            </p>
            <div className="flex gap-2">
              <ScreenshotButton
                targetRef={fullPageRef}
                filename="full-page-screenshot.png"
              >
                Capture Full Page
              </ScreenshotButton>

              <Button
                variant="outline"
                onClick={() => handleManualCapture(fullPageRef.current, 'blob')}
              >
                Manual Full Capture
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Guide */}
        <Card className="shadow-lg bg-gray-50">
          <CardHeader>
            <CardTitle>Troubleshooting Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div>
              <strong>✅ Download works:</strong> Check your browser's download folder
            </div>
            <div>
              <strong>❌ CORS error:</strong> Images need crossOrigin="anonymous" attribute
            </div>
            <div>
              <strong>🖼️ Blank screenshot:</strong> Wait for images to load, or increase imageTimeout
            </div>
            <div>
              <strong>🔍 Low quality:</strong> Increase scale option (default is 2)
            </div>
            <div>
              <strong>📱 Mobile issues:</strong> Try DataURL method instead of Blob
            </div>
            <div className="pt-2 border-t">
              <strong>💡 Pro tip:</strong> Check browser console for detailed error messages
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
