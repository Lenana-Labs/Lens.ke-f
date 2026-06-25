import { apiClient } from './client';
import type { PaginatedResponse } from '@/types/api';
import type { Photo } from '@/types/photos';
import axios from 'axios';

export const photosApi = {
  /**
   * Fetches a paginated list of active photos from the backend.
   * GET /api/v1/photos
   */
  list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Photo>> => {
    const { data } = await apiClient.get<PaginatedResponse<Photo>>('/api/v1/photos', { params });
    return data;
  },

  /**
   * Fetches a single photo detail by ID.
   * GET /api/v1/photos/{id}
   */
  detail: async (id: number | string): Promise<Photo> => {
    const { data } = await apiClient.get<Photo>(`/api/v1/photos/${id}`);
    return data;
  },

  /**
   * Registers a photo upload intent, returning upload destinations (S3/Supabase etc).
   * POST /api/v1/photos/upload-intent
   */
  createUploadIntent: async (payload: {
    filename: string;
    file_size: number;
    content_type: string;
  }): Promise<{ upload_url: string; photo_id: string | number }> => {
    const { data } = await apiClient.post<any>('/api/v1/photos/upload-intent', payload);
    return data;
  },

  /**
   * Uploads raw binary file to a presigned URL using standard axios (to avoid attaching backend JWT headers).
   */
  uploadFileBinary: async (
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  },

  /**
   * Finalizes a photo upload after file is pushed to store.
   * POST /api/v1/photos/{id}/finalize
   */
  finalizeUpload: async (
    id: number | string,
    metadata: {
      title: string;
      description?: string;
      location: string;
      camera?: string;
      category: string;
      tags: string[];
    }
  ): Promise<Photo> => {
    const payload = {
      title: metadata.title,
      description: metadata.description,
      location: metadata.location,
      camera: metadata.camera,
      category: metadata.category,
      tags: metadata.tags,
    };
    const { data } = await apiClient.post<Photo>(`/api/v1/photos/${id}/finalize`, payload);
    return data;
  },
};
