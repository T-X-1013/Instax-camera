export interface PhotoData {
  id: string;
  url: string;
  timestamp: number;
  x: number; // Initial X position
  y: number; // Initial Y position
  rotation: number; // Random rotation
  isDeveloping: boolean;
}

export interface CameraProps {
  onTakePhoto: (dataUrl: string) => void;
}

export interface PolaroidProps {
  photo: PhotoData;
  onDelete: (id: string) => void;
  onDownload: (id: string, url: string) => void;
  zIndex: number;
  onDragStart: () => void;
}
