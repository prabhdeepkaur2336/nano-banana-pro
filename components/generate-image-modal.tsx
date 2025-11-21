'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/image-upload';
import { toast } from 'sonner';

interface GenerateImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GenerateImageModal({
  open,
  onOpenChange,
  onSuccess,
}: GenerateImageModalProps) {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1K');
  const [outputFormat, setOutputFormat] = useState('png');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = prompt.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('aspect_ratio', aspectRatio);
      formData.append('resolution', resolution);
      formData.append('output_format', outputFormat);

      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit request');
      }

      const data = await response.json();

      toast.success('Image generation request submitted successfully!');

      setPrompt('');
      setImages([]);
      setAspectRatio('1:1');
      setResolution('1K');
      setOutputFormat('png');

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit request'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate New Image</DialogTitle>
          <DialogDescription>
            Enter your prompt and configure the generation settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">
              Prompt <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Images (Optional)</Label>
            <ImageUpload value={images} onChange={setImages} maxFiles={8} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aspect-ratio">
                Aspect Ratio <span className="text-destructive">*</span>
              </Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger id="aspect-ratio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">1:1</SelectItem>
                  <SelectItem value="2:3">2:3</SelectItem>
                  <SelectItem value="3:2">3:2</SelectItem>
                  <SelectItem value="3:4">3:4</SelectItem>
                  <SelectItem value="4:3">4:3</SelectItem>
                  <SelectItem value="4:5">4:5</SelectItem>
                  <SelectItem value="5:4">5:4</SelectItem>
                  <SelectItem value="9:16">9:16</SelectItem>
                  <SelectItem value="16:9">16:9</SelectItem>
                  <SelectItem value="21:9">21:9</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution">
                Resolution <span className="text-destructive">*</span>
              </Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger id="resolution">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1K">1K</SelectItem>
                  <SelectItem value="2K">2K</SelectItem>
                  <SelectItem value="4K">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="output-format">
                Output Format <span className="text-destructive">*</span>
              </Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger id="output-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
