import type { PaginatedResponse } from '@/types/api';
import type { Photo } from '@/types/photos';

/**
 * Mock Photos API.
 * When backend connection details arrive, replace these with real `apiClient` calls.
 * Example: `apiClient.get<PaginatedResponse<Photo>>('/api/photos/')`
 */
export const photosApi = {
  /**
   * MOCK: Fetches a paginated list of photos.
   * Expected real endpoint: GET /api/photos/
   */
  list: async (params?: Record<string, unknown>): Promise<PaginatedResponse<Photo>> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Mock data
    const mockPhotos: Photo[] = [
      { id: 1, title: 'Lion in Savannah', url: '/images/gallery/swahili_blue.png', photographer: 'W. Kamau', category: 'Wildlife', price: 2000, likes: 120, downloads: 45 },
      { id: 2, title: 'Nairobi Skyline', url: '/images/gallery/swahili_blue.png', photographer: 'S. Njoroge', category: 'Urban', price: 1500, likes: 89, downloads: 30 },
      // Duplicate slightly to simulate list
      { id: 3, title: 'Maasai Mara Sunrise', url: '/images/gallery/swahili_blue.png', photographer: 'W. Kamau', category: 'Landscape', price: 2500, likes: 300, downloads: 110 },
    ];

    return {
      count: 3,
      next: null,
      previous: null,
      results: mockPhotos,
    };
  },

  /**
   * MOCK: Fetches a single photo by ID.
   * Expected real endpoint: GET /api/photos/{id}/
   */
  detail: async (id: number | string): Promise<Photo> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id,
      title: 'Mock Photo Detail',
      url: '/images/gallery/swahili_blue.png',
      photographer: 'Mock Photographer',
      category: 'Mock Category',
      price: 1000,
      likes: 10,
      downloads: 5,
    };
  },
};
