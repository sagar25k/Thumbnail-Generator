export interface StylePreset {
  name: string;
  description: string;
  id: string;
}

export interface GeneratedImage {
  id: string;
  imageUrl: string; // Base64 data URL
  prompt: string;
  styleName: string;
  timestamp: number;
}

export type AppMode = 'DREAM' | 'STYLE' | 'EDIT';

export interface FeedbackData {
  rating: 'FIRE' | 'MID' | 'DEAD' | null;
  request: string;
}