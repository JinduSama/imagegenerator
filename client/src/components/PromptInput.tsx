import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Clock, X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { useStore } from '@/store/store';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { promptHistory, addToHistory } = useStore();
  const historyRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      addToHistory(prompt.trim());
      onGenerate(prompt.trim());
      setPrompt('');
    }
  }, [prompt, isGenerating, onGenerate, addToHistory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleHistoryClick = (historyPrompt: string) => {
    setPrompt(historyPrompt);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Label htmlFor="prompt" className="sr-only">Enter your prompt</Label>
        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            id="prompt"
            type="text"
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => promptHistory.length > 0 && setShowHistory(true)}
            className="pr-12 py-6 text-lg bg-card/50 border-2 focus:border-primary/50 transition-colors"
            disabled={isGenerating}
          />
          <div className="absolute right-2 flex items-center gap-1">
            {prompt && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setPrompt('')}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="submit"
              size="icon"
              disabled={!prompt.trim() || isGenerating}
              className="h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground">Enter</kbd>
            <span>to generate</span>
          </div>
          {promptHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Clock className="h-3 w-3" />
              <span>History</span>
            </button>
          )}
        </div>
      </form>

      {/* History Dropdown */}
      {showHistory && promptHistory.length > 0 && (
        <div
          ref={historyRef}
          className="absolute z-50 w-full mt-2 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto scrollbar-thin"
        >
          {promptHistory.map((historyPrompt, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleHistoryClick(historyPrompt)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors truncate"
            >
              {historyPrompt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptInput;
