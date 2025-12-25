const API_BASE = '/api';

export interface GenerationParams {
  prompt: string;
  model: string;
  width: number;
  height: number;
  numImages: number;
  apiKey?: string;
}

export interface GeneratedImage {
  filename: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: number;
  width: number;
  height: number;
}

export interface GenerationResponse {
  success: boolean;
  images: GeneratedImage[];
  usage?: {
    total_tokens: number;
    images: number;
  };
}

export interface ImageListResponse {
  images: Array<{
    filename: string;
    url: string;
    timestamp: number;
    size: number;
  }>;
}

export async function generateImage(params: GenerationParams): Promise<GenerationResponse> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Generation failed');
  }

  return response.json();
}

export async function getImages(): Promise<ImageListResponse> {
  const response = await fetch(`${API_BASE}/images`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch images');
  }

  return response.json();
}

export async function checkHealth(): Promise<{ status: string; timestamp: number }> {
  const response = await fetch(`${API_BASE}/health`);
  
  if (!response.ok) {
    throw new Error('Server health check failed');
  }

  return response.json();
}
