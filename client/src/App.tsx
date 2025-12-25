import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Wand2,
  LayoutGrid,
  Image as ImageIcon,
  History,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from './components/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/Tabs';
import PromptInput from './components/PromptInput';
import { ParameterControls } from './components/ModelSelector';
import ImageGallery, { ImageViewer } from './components/ImageGallery';
import { SettingsPanel, LoadingOverlay, Toast } from './components/UI';
import { useStore } from './store/store';
import { generateImage, getImages } from './services/api';
import type { ImageItem } from './store/store';

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 60;

function App() {
  const {
    settings,
    images,
    addImages,
    setImages,
    isGenerating,
    setGenerating,
    generationProgress,
    setProgress,
    generationStatus,
    setStatus,
    selectedImage,
    setSelectedImage,
    promptHistory,
    clearHistory,
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'gallery' | 'history'>('gallery');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Local state for generation parameters
  const [model, setModel] = useState(settings.defaultModel);
  const [width, setWidth] = useState(settings.defaultWidth);
  const [height, setHeight] = useState(settings.defaultHeight);
  const [numImages, setNumImages] = useState(settings.defaultNumImages);

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const response = await getImages();
      const imagesWithMetadata = response.images.map((img) => ({
        filename: img.filename,
        url: img.url,
        prompt: 'Saved image',
        model: 'unknown',
        timestamp: img.timestamp,
        width: 1024,
        height: 1024,
      }));
      setImages(imagesWithMetadata);
    } catch (error) {
      console.error('Failed to load images:', error);
    }
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  }, []);

  const handleGenerate = async (prompt: string) => {
    if (!settings.apiKey && !prompt.trim()) {
      showToast('Please enter a prompt and API key', 'error');
      return;
    }

    setGenerating(true);
    setProgress(0);
    setStatus('Initializing...');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      setStatus('Generating images...');
      const response = await generateImage({
        prompt,
        model,
        width,
        height,
        numImages,
        apiKey: settings.apiKey || undefined,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStatus('Complete!');

      addImages(response.images);
      showToast(`Successfully generated ${response.images.length} image(s)`, 'success');
    } catch (error) {
      console.error('Generation failed:', error);
      showToast(error instanceof Error ? error.message : 'Generation failed', 'error');
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
        setStatus('');
      }, 1000);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        setSettingsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedImage]);

  const recentImages = images.slice(0, 10);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-40"
        style={{ width: sidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH }}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-3 border-b border-border flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg gradient-text">BildGenerator</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {sidebarOpen && (
            <>
              {/* Sidebar Tabs */}
              <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as 'gallery' | 'history')}>
                <TabsList className="w-full justify-start p-2 border-b border-border">
                  <TabsTrigger value="gallery" className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Gallery
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="gallery" className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Recent Images</h3>
                    {recentImages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No images yet</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {recentImages.slice(0, 6).map((image) => (
                          <div
                            key={image.filename}
                            className="aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all"
                            onClick={() => setSelectedImage(image)}
                          >
                            <img
                              src={image.url}
                              alt={image.prompt}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="history" className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-muted-foreground">Prompt History</h3>
                      {promptHistory.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearHistory}
                          className="text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    {promptHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No history yet</p>
                    ) : (
                      <div className="space-y-1">
                        {promptHistory.slice(0, 10).map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              handleGenerate(prompt);
                            }}
                            className="w-full text-left p-2 rounded-md text-sm hover:bg-secondary transition-colors truncate"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? SIDEBAR_WIDTH : COLLAPSED_WIDTH }}
      >
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-border p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold gradient-text hidden sm:block">
              AI Image Generator
            </h1>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Prompt Input */}
              <section className="space-y-4">
                <PromptInput onGenerate={handleGenerate} isGenerating={isGenerating} />
              </section>

              {/* Parameters */}
              <section>
                <ParameterControls
                  model={model}
                  width={width}
                  height={height}
                  numImages={numImages}
                  onModelChange={setModel}
                  onSizeChange={(w, h) => {
                    setWidth(w);
                    setHeight(h);
                  }}
                  onNumImagesChange={setNumImages}
                />
              </section>

              {/* Image Gallery */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Generated Images</h2>
                </div>
                <ImageGallery
                  images={images}
                  onImageClick={setSelectedImage}
                />
              </section>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground">
            <p>
              Press{' '}
              <kbd className="px-1.5 py-0.5 bg-secondary rounded">Ctrl</kbd> +{' '}
              <kbd className="px-1.5 py-0.5 bg-secondary rounded">Enter</kbd>
              {' '}to generate •{' '}
              <kbd className="px-1.5 py-0.5 bg-secondary rounded">Ctrl</kbd> +{' '}
              <kbd className="px-1.5 py-0.5 bg-secondary rounded">S</kbd>
              {' '}for settings
            </p>
          </footer>
        </div>
      </main>

      {/* Modals & Overlays */}
      <ImageViewer
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <LoadingOverlay
        isGenerating={isGenerating}
        progress={generationProgress}
        status={generationStatus}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
