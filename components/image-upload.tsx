'use client';

import { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
}

export function ImageUpload({
  value,
  onChange,
  maxFiles = 8,
  maxSize = 10 * 1024 * 1024,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`;
    }
    if (file.size > maxSize) {
      return `${file.name}: File size exceeds 10MB limit.`;
    }
    return null;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newErrors: string[] = [];
      const validFiles: File[] = [];

      const remainingSlots = maxFiles - value.length;
      const filesToProcess = Math.min(files.length, remainingSlots);

      for (let i = 0; i < filesToProcess; i++) {
        const file = files[i];
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      if (files.length > remainingSlots) {
        newErrors.push(
          `Maximum ${maxFiles} files allowed. Some files were not added.`
        );
      }

      setErrors(newErrors);
      if (validFiles.length > 0) {
        onChange([...value, ...validFiles]);
      }
    },
    [value, onChange, maxFiles, maxSize, acceptedTypes]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = value.filter((_, i) => i !== index);
      onChange(newFiles);
      setErrors([]);
    },
    [value, onChange]
  );

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted hover:border-primary/50',
          value.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          disabled={value.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center justify-center py-10 px-4">
          <Upload
            className={cn(
              'w-10 h-10 mb-4',
              dragActive ? 'text-primary' : 'text-muted-foreground'
            )}
          />
          <p className="text-sm font-medium mb-1">
            {value.length >= maxFiles
              ? 'Maximum files reached'
              : 'Drop images here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground">
            {value.length >= maxFiles
              ? `${maxFiles}/${maxFiles} files uploaded`
              : `Up to ${maxFiles} images, max 10MB each (JPEG, PNG, WebP)`}
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {value.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg border border-border bg-muted overflow-hidden">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
