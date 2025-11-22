import React, { useState, useCallback } from 'react';
import { Camera } from './components/Camera';
import { Polaroid } from './components/Polaroid';
import { PhotoData } from './types';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [topZIndex, setTopZIndex] = useState(10);

  const handleTakePhoto = useCallback((dataUrl: string, cameraRect: DOMRect) => {
    const newPhoto: PhotoData = {
      id: crypto.randomUUID(),
      url: dataUrl,
      timestamp: Date.now(),
      // Initial position: Ejected from top of camera
      // We position it relative to the camera body then let users drag it
      x: cameraRect.left + (cameraRect.width / 2) - 100, // Center horizontally relative to camera
      y: cameraRect.top - 300, // Just above the camera
      rotation: (Math.random() * 6) - 3, // Subtle random rotation
      isDeveloping: true,
    };

    setPhotos(prev => [...prev, newPhoto]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleDownload = useCallback((id: string, url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `instax-${id.slice(0, 8)}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleBringToFront = useCallback((id: string) => {
    setTopZIndex(prev => prev + 1);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Hazy Background Layer */}
      <div className="hazy-bg pointer-events-none"></div>

      <div className="absolute top-4 left-4 text-pink-900/50 text-sm font-sans select-none">
        <p>Drag photos to arrange.</p>
      </div>

      {/* The Photo Wall */}
      {photos.map((photo, index) => (
        <Polaroid
          key={photo.id}
          photo={photo}
          onDelete={handleDelete}
          onDownload={handleDownload}
          zIndex={index + 10}
          onFocus={() => handleBringToFront(photo.id)}
        />
      ))}

      {/* The Camera */}
      <Camera onTakePhoto={handleTakePhoto} />
    </div>
  );
};

export default App;