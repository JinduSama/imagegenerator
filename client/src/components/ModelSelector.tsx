import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select';
import { Label } from './Label';
import { Settings2 } from 'lucide-react';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const MODELS = [
  { value: 'flux2-pro', label: 'FLUX.2 Pro', description: 'Frontier-level quality' },
  { value: 'gemini', label: 'Google Gemini 2.5 Flash Image', description: 'Advanced image generation' },
];

interface SizeSelectorProps {
  width: number;
  height: number;
  onChange: (width: number, height: number) => void;
}

const PRESETS = [
  { value: '1024x1024', label: 'Square (1:1)', width: 1024, height: 1024 },
  { value: '1280x720', label: 'Landscape (16:9)', width: 1280, height: 720 },
  { value: '720x1280', label: 'Portrait (9:16)', width: 720, height: 1280 },
  { value: '1024x768', label: 'Standard (4:3)', width: 1024, height: 768 },
  { value: '768x1024', label: 'Portrait (3:4)', width: 768, height: 1024 },
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label>AI Model</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {MODELS.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              <div className="flex flex-col">
                <span className="font-medium">{model.label}</span>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const SizeSelector: React.FC<SizeSelectorProps> = ({ width, height, onChange }) => {
  const currentPreset = PRESETS.find(
    (p) => p.width === width && p.height === height
  );

  const handlePresetChange = (presetValue: string) => {
    const preset = PRESETS.find((p) => p.value === presetValue);
    if (preset) {
      onChange(preset.width, preset.height);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Aspect Ratio</Label>
      <Select
        value={currentPreset?.value || `${width}x${height}`}
        onValueChange={handlePresetChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select size" />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface ParameterControlsProps {
  model: string;
  width: number;
  height: number;
  numImages: number;
  onModelChange: (model: string) => void;
  onSizeChange: (width: number, height: number) => void;
  onNumImagesChange: (num: number) => void;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  model,
  width,
  height,
  numImages,
  onModelChange,
  onSizeChange,
  onNumImagesChange,
}) => {
  return (
    <div className="bg-card/50 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Settings2 className="h-4 w-4" />
        <span>Parameters</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ModelSelector value={model} onChange={onModelChange} />
        <SizeSelector width={width} height={height} onChange={onSizeChange} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Number of Images: {numImages}</Label>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onNumImagesChange(num)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                numImages === num
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
