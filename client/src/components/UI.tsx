import React from 'react';
import { Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './Dialog';
import { useStore } from '@/store/store';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { settings, setApiKey, setSettings } = useStore();
  const [showApiKey, setShowApiKey] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API key and default settings
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">OpenRouter API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                placeholder="sk-or-v1-..."
                value={settings.apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          {/* Default Model */}
          <div className="space-y-2">
            <Label htmlFor="defaultModel">Default Model</Label>
            <select
              id="defaultModel"
              value={settings.defaultModel}
              onChange={(e) => setSettings({ defaultModel: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="flux2-pro">FLUX.2 Pro</option>
              <option value="dalle3">DALL-E 3</option>
              <option value="dalle2">DALL-E 2</option>
              <option value="stable-diffusion">Stable Diffusion XL</option>
            </select>
          </div>

          {/* Default Size */}
          <div className="space-y-2">
            <Label>Default Image Size</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultWidth" className="text-xs">Width</Label>
                <Input
                  id="defaultWidth"
                  type="number"
                  value={settings.defaultWidth}
                  onChange={(e) =>
                    setSettings({ defaultWidth: parseInt(e.target.value) || 1024 })
                  }
                  min={256}
                  max={2048}
                  step={64}
                />
              </div>
              <div>
                <Label htmlFor="defaultHeight" className="text-xs">Height</Label>
                <Input
                  id="defaultHeight"
                  type="number"
                  value={settings.defaultHeight}
                  onChange={(e) =>
                    setSettings({ defaultHeight: parseInt(e.target.value) || 1024 })
                  }
                  min={256}
                  max={2048}
                  step={64}
                />
              </div>
            </div>
          </div>

          {/* Default Number of Images */}
          <div className="space-y-2">
            <Label htmlFor="defaultNumImages">Default Number of Images</Label>
            <select
              id="defaultNumImages"
              value={settings.defaultNumImages}
              onChange={(e) =>
                setSettings({ defaultNumImages: parseInt(e.target.value) })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value={1}>1 image</option>
              <option value={2}>2 images</option>
              <option value={3}>3 images</option>
              <option value={4}>4 images</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface LoadingOverlayProps {
  isGenerating: boolean;
  progress: number;
  status: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isGenerating,
  progress,
  status,
}) => {
  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-secondary"></div>
          <div
            className="absolute inset-0 rounded-full border-4 border-primary loading-pulse"
            style={{
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
            }}
          ></div>
          <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">{status}</p>
          <div className="w-64 mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-destructive',
    info: 'bg-primary',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg ${bgColors[type]} text-white shadow-lg animate-in slide-in-from-bottom-5`}
    >
      {message}
    </div>
  );
};
