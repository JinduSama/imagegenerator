import React from 'react';
import { Image as ImageIcon, Download, Trash2, Maximize2 } from 'lucide-react';
import { Button } from './Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './Dialog';
import { useStore, ImageItem } from '@/store/store';

interface ImageGalleryProps {
  images: ImageItem[];
  onImageClick: (image: ImageItem) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImageClick }) => {
  const { setImages } = useStore();

  const handleDownload = async (image: ImageItem) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (image: ImageItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // Remove from local state (server file deletion would need API endpoint)
    setImages(images.filter((img) => img.filename !== image.filename));
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg">No images generated yet</p>
        <p className="text-sm">Your generated images will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <div
          key={image.filename}
          className="group relative aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer"
          onClick={() => onImageClick(image)}
        >
          <img
            src={image.url}
            alt={image.prompt}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-xs text-white line-clamp-2 mb-2">
                {image.prompt}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-white/20 hover:bg-white/40 text-white"
                  onClick={(e) => handleDownload(image, e)}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-white/20 hover:bg-white/40 text-white"
                  onClick={(e) => handleDelete(image, e)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-white/20 hover:bg-white/40 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageClick(image);
                  }}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
            {new Date(image.timestamp).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};

interface ImageViewerProps {
  image: ImageItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  image,
  isOpen,
  onClose,
}) => {
  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-lg pr-8">Generated Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <img
            src={image.url}
            alt={image.prompt}
            className="w-full max-h-[70vh] object-contain rounded-lg"
          />
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Prompt:</span> {image.prompt}
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Model: {image.model}</span>
              <span>Size: {image.width} x {image.height}</span>
              <span>
                Generated: {new Date(image.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGallery;
