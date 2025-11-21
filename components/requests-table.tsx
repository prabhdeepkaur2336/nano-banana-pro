'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase, type ImageGenerationRequest } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

interface RequestsTableProps {
  onRowClick: (request: ImageGenerationRequest) => void;
}

const ITEMS_PER_PAGE = 10;

export function RequestsTable({ onRowClick }: RequestsTableProps) {
  const [requests, setRequests] = useState<ImageGenerationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('image_generation_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'image_generation_requests',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchRequests();
          } else if (payload.eventType === 'UPDATE') {
            setRequests((prev) =>
              prev.map((req) =>
                req.id === payload.new.id
                  ? (payload.new as ImageGenerationRequest)
                  : req
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPage]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const { count } = await supabase
        .from('image_generation_requests')
        .select('*', { count: 'exact', head: true });

      setTotalCount(count || 0);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('image_generation_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching requests:', error);
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          >
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      case 'done':
        return (
          <Badge
            variant="secondary"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            Done
          </Badge>
        );
      case 'failed':
        return (
          <Badge
            variant="secondary"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">
          No image generation requests yet. Create your first one!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[50%]">Prompt</TableHead>
              <TableHead className="w-[20%]">Status</TableHead>
              <TableHead className="w-[30%]">Generated Image</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow
                key={request.id}
                onClick={() => {
                  if (request.status === 'done') {
                    onRowClick(request);
                  }
                }}
                className={cn(
                  'border-border',
                  request.status === 'done'
                    ? 'cursor-pointer hover:bg-primary/5'
                    : 'cursor-not-allowed opacity-60'
                )}
              >
                <TableCell className="font-medium">
                  <div className="line-clamp-2" title={request.prompt}>
                    {request.prompt}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>
                  {request.status === 'done' && request.generated_image_url ? (
                    <img
                      src={request.generated_image_url}
                      alt="Generated"
                      className="h-16 w-16 object-cover rounded border border-border"
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalCount} total requests)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
