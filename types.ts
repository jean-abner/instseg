
export enum ViewState {
  HOME = 'HOME',
  CALCULATOR = 'CALCULATOR',
  DIAGRAM_GENERATOR = 'DIAGRAM_GENERATOR',
  BLOG = 'BLOG',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  WHO_WE_ARE = 'WHO_WE_ARE',
  DOWNLOAD_APP = 'DOWNLOAD_APP',
  CONTACT = 'CONTACT'
}

export interface CircuitInput {
  id: string;
  name: string;
  power: number; // Always stored in Watts
  unit: 'W' | 'BTU'; // UI Toggle state
  voltage: 127 | 220 | 380;
  type: 'lighting' | 'outlet' | 'dedicated';
  distance: number; // meters
  distanceUnknown?: boolean;
}

export interface CalculationResult {
  current: number;
  minCable: number;
  breaker: number;
  voltageDrop: number;
}

export interface BlogPost {
  id: number;
  slug?: string;
  title: string;
  excerpt: string;
  tag: string;
  tags2?: string; // Comma-separated tags for the article view
  tags?: string[]; // Array of tags for the post
  display_date: string;
  image_url: string;
  content: string; // HTML content
  editor_name?: string;
  editor_avatar_url?: string;
  created_at?: string;
}
