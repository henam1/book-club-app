export interface UserProfile {
  displayName: string;
  bio: string;
  photoURL?: string;
  favoriteBook?: {
    id: string;
    title: string;
    authors: string;
    thumbnail?: string;
  };
  readingPreferences?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserBook {
  id: string;
  userId: string;
  title: string;
  authors: string;
  publishedDate: string;
  thumbnail?: string;
  status: 'want-to-read' | 'reading' | 'finished';
  startDate?: string | null;
  completedDate?: string | null;
  ratings?: Record<string, number> | null;
  review?: {
    text: string;
    ratingType: 'simple' | 'detailed';
    simpleRating?: number;
    ratings?: Record<string, number>;
    overall: number;
  } | null;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReadingStatus = 'want-to-read' | 'reading' | 'finished';
export type RatingType = 'simple' | 'detailed';