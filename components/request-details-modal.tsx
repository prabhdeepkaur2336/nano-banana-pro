'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import type { ImageGenerationRequest } from '@/lib/supabase-client';

interface RequestDetailsModalProps {
  request: ImageGenerationRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestDetailsModal({
  request,
  open,
  onOpenChange,
}: RequestDetailsModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!request) return null;

  const handleDownload = async () => {
    if (!request.generated_image_url) return;

    setDownloading(true);
    try {
      const response = await fetch(request.generated_image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${request.id}.${request.output_format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            View the full details of this image generation request
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Prompt</h3>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {request.prompt}
              </p>
            </div>

            {request.images && request.images.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Input Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {request.images.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg border border-border bg-muted overflow-hidden"
                    >
                      <img
                        src={imageUrl}
                        alt={`Input ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">Aspect Ratio</h3>
                <p className="text-sm text-muted-foreground">
                  {request.aspect_ratio}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Resolution</h3>
                <p className="text-sm text-muted-foreground">
                  {request.resolution}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Output Format</h3>
                <p className="text-sm text-muted-foreground uppercase">
                  {request.output_format}
                </p>
              </div>
            </div>

            {request.generated_image_url && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Generated Image</h3>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
                <div className="rounded-lg border border-border bg-muted overflow-hidden">
                  <img
                    src={request.generated_image_url}
                    alt="Generated"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Created at: {new Date(request.created_at).toLocaleString()}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
