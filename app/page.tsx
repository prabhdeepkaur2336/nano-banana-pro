'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GenerateImageModal } from '@/components/generate-image-modal';
import { RequestsTable } from '@/components/requests-table';
import { RequestDetailsModal } from '@/components/request-details-modal';
import type { ImageGenerationRequest } from '@/lib/supabase-client';

export default function Home() {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ImageGenerationRequest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleRowClick = (request: ImageGenerationRequest) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              AI Image Generator
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create stunning AI-generated images with custom prompts and
              settings. Upload reference images and watch your ideas come to
              life.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => setIsGenerateModalOpen(true)}
              className="gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate New Image
            </Button>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Generation History</h2>
            <RequestsTable onRowClick={handleRowClick} />
          </div>
        </div>
      </div>

      <GenerateImageModal
        open={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        onSuccess={() => {}}
      />

      <RequestDetailsModal
        request={selectedRequest}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
    </div>
  );
}
