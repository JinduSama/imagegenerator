import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ImageItem {
  filename: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: number;
  width: number;
  height: number;
}

export interface Settings {
  apiKey: string;
  defaultModel: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultNumImages: number;
  darkMode: boolean;
}

interface AppState {
  // Settings
  settings: Settings;
  setApiKey: (key: string) => void;
  setSettings: (settings: Partial<Settings>) => void;
  
  // Generated images
  images: ImageItem[];
  addImages: (images: ImageItem[]) => void;
  setImages: (images: ImageItem[]) => void;
  
  // Current generation state
  isGenerating: boolean;
  generationProgress: number;
  generationStatus: string;
  setGenerating: (generating: boolean) => void;
  setProgress: (progress: number) => void;
  setStatus: (status: string) => void;
  
  // UI state
  selectedImage: ImageItem | null;
  setSelectedImage: (image: ImageItem | null) => void;
  
  // Prompt history
  promptHistory: string[];
  addToHistory: (prompt: string) => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Default settings
      settings: {
        apiKey: '',
        defaultModel: 'flux2-pro',
        defaultWidth: 1024,
        defaultHeight: 1024,
        defaultNumImages: 1,
        darkMode: true,
      },
      
      setApiKey: (apiKey) => 
        set((state) => ({
          settings: { ...state.settings, apiKey }
        })),
      
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),
      
      // Images
      images: [],
      addImages: (newImages) =>
        set((state) => ({
          images: [...newImages, ...state.images].slice(0, 50)
        })),
      
      setImages: (images) => set({ images }),
      
      // Generation state
      isGenerating: false,
      generationProgress: 0,
      generationStatus: '',
      setGenerating: (generating) => set({ isGenerating: generating }),
      setProgress: (progress) => set({ generationProgress: progress }),
      setStatus: (status) => set({ generationStatus: status }),
      
      // Selected image
      selectedImage: null,
      setSelectedImage: (image) => set({ selectedImage: image }),
      
      // Prompt history
      promptHistory: [],
      addToHistory: (prompt) =>
        set((state) => ({
          promptHistory: [
            prompt,
            ...state.promptHistory.filter((p) => p !== prompt)
          ].slice(0, 20)
        })),
      
      clearHistory: () => set({ promptHistory: [] }),
    }),
    {
      name: 'bildgenerator-storage',
      partialize: (state) => ({
        settings: state.settings,
        images: state.images.slice(0, 10), // Only persist last 10 in localStorage
        promptHistory: state.promptHistory,
      }),
    }
  )
);
