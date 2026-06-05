import useSWR from 'swr';
import { photosApi } from '@/lib/api/photos';
import type { PaginatedResponse } from '@/types/api';
import type { Photo } from '@/types/photos';

export function usePhotos(params?: Record<string, unknown>) {
  // SWR key can include stringified params for caching distinct requests
  const key = ['/api/photos/', JSON.stringify(params || {})];
  
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Photo>>(
    key,
    () => photosApi.list(params)
  );

  return {
    photos: data?.results ?? [],
    pagination: {
      count: data?.count ?? 0,
      next: data?.next,
      previous: data?.previous,
    },
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePhotoDetail(id: string | number) {
  const { data, error, isLoading, mutate } = useSWR<Photo>(
    id ? `/api/photos/${id}/` : null,
    () => photosApi.detail(id)
  );

  return {
    photo: data,
    isLoading,
    isError: error,
    mutate,
  };
}
