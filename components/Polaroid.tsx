import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Download } from 'lucide-react';
import { PhotoData } from '../types';

interface PolaroidProps {
  photo: PhotoData;
  onDelete: (id: string) => void;
  onDownload: (id: string, url: string) => void;
  zIndex: number;
  onFocus: () => void;
}

export const Polaroid: React.FC<PolaroidProps> = ({ 
  photo, 
  onDelete, 
  onDownload,
  zIndex,
  onFocus
}) => {
  const [developed, setDeveloped] = useState(false);

  useEffect(() => {
    if (photo.isDeveloping) {
      const timer = setTimeout(() => {
        setDeveloped(true);
      }, 100); 
      return () => clearTimeout(timer);
    } else {
      setDeveloped(true);
    }
  }, [photo.isDeveloping]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onPointerDown={onFocus}
      initial={{ 
        x: photo.x, 
        y: photo.y, 
        scale: 0.9, 
        opacity: 0,
        rotate: 0
      }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        rotate: photo.rotation
      }}
      transition={{ 
        type: "spring", 
        damping: 20, 
        stiffness: 100,
        delay: 0.5 
      }}
      style={{ zIndex }}
      // Instax Mini size roughly 54mm x 86mm. Aspect ratio approx 0.62.
      // We map this to pixels, e.g., w-52 (208px) approx.
      className="absolute w-56 pb-10 pt-3 px-3 bg-white shadow-xl cursor-grab active:cursor-grabbing group rounded-sm"
    >
      {/* The Photo Area - Instax Mini Image is 46x62mm */}
      <div className="relative w-full aspect-[46/62] bg-[#111] overflow-hidden border border-gray-100">
        
        {/* The Actual Image */}
        <img 
          src={photo.url} 
          alt="Memory" 
          className="w-full h-full object-cover transition-all duration-[8000ms] ease-out"
          style={{
            filter: developed 
              ? 'blur(0px) grayscale(0%) brightness(1) contrast(1) sepia(0.2)' 
              : 'blur(10px) grayscale(100%) brightness(0.1) contrast(1.5) sepia(0)',
          }}
          draggable={false}
        />

        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none z-10" />
      </div>

      {/* Handwritten Date */}
      <div className={`absolute bottom-3 left-0 right-0 text-center font-hand text-gray-500 text-xs transition-opacity duration-1000 ${developed ? 'opacity-70' : 'opacity-0'}`}>
        {new Date(photo.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </div>

      {/* Hover Controls */}
      <div className="absolute -top-3 -right-8 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button 
          onClick={(e) => { e.stopPropagation(); onDownload(photo.id, photo.url); }}
          className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 text-blue-600 transition-colors"
          title="Download"
        >
          <Download size={14} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
          className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};