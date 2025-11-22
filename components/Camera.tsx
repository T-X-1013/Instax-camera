import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraProps {
  onTakePhoto: (dataUrl: string, rect: DOMRect) => void;
}

export const Camera: React.FC<CameraProps> = ({ onTakePhoto }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraBodyRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [ejectingPhoto, setEjectingPhoto] = useState<string | null>(null);

  // Initialize Webcam
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 720 },
            height: { ideal: 720 },
            aspectRatio: 0.75 // Portrait aspect ratio for Instax Mini
          }, 
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setPermissionError(true);
      }
    }
    setupCamera();
  }, []);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraBodyRef.current) return;

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      // Instax Mini ratio is roughly 3:4 (46mm x 62mm image)
      const width = 460;
      const height = 620;
      
      canvas.width = width;
      canvas.height = height;

      // Draw image (mirrored horizontally for natural feel)
      context.translate(width, 0);
      context.scale(-1, 1);
      
      // Center crop logic for portrait video
      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = width / height;
      
      let sourceWidth, sourceHeight, sourceX, sourceY;

      if (videoRatio > targetRatio) {
        sourceHeight = video.videoHeight;
        sourceWidth = sourceHeight * targetRatio;
        sourceX = (video.videoWidth - sourceWidth) / 2;
        sourceY = 0;
      } else {
        sourceWidth = video.videoWidth;
        sourceHeight = sourceWidth / targetRatio;
        sourceX = 0;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      }
      
      context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Trigger ejection animation inside camera
      setEjectingPhoto(dataUrl);

      // Get camera position to spawn the photo in the right place on the wall
      const rect = cameraBodyRef.current.getBoundingClientRect();
      
      // Delay the actual "creation" on the wall to match the ejection animation
      setTimeout(() => {
        onTakePhoto(dataUrl, rect);
        setEjectingPhoto(null);
      }, 600);
    }
  }, [onTakePhoto]);

  return (
    <div className="fixed bottom-10 left-10 z-50 select-none">
      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Flash Overlay (Screen-wide) */}
      {isFlashing && <div className="fixed inset-0 bg-white z-[100] animate-flash pointer-events-none mix-blend-screen" />}

      {/* CAMERA BODY - Instax Mini 90 Style */}
      {/* The body is silver with black leather texture inserts */}
      <div ref={cameraBodyRef} className="relative w-[340px] h-[300px] bg-gradient-to-b from-gray-200 to-gray-300 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center group transition-transform duration-200">
        
        {/* Top Ejection Slot */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-40 h-3 bg-gray-800 rounded-full z-10 shadow-inner border-b border-white/20"></div>

        {/* Ejecting Photo Animation */}
        <AnimatePresence>
            {ejectingPhoto && (
                <motion.div 
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -180, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute top-0 w-[180px] h-[220px] bg-white shadow-lg p-2 pb-8 z-0 left-1/2 -translate-x-1/2"
                >
                   <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                       <div className="w-full h-full bg-black opacity-90"></div>
                   </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Main Leather Texture Area */}
        <div className="absolute inset-x-4 inset-y-3 bg-[#1a1a1a] bg-leather-texture rounded-[2rem] shadow-inner overflow-hidden">
            
            {/* Brand Logo */}
            <div className="absolute top-6 right-6 flex flex-col items-end">
                <span className="text-gray-200 font-sans font-bold text-lg tracking-tighter italic">instax</span>
                <span className="text-gray-400 font-sans text-xs tracking-widest -mt-1">mini 90</span>
            </div>

            {/* Flash (Top Left relative to camera front) */}
            <div className="absolute top-5 left-5 w-10 h-16 bg-gradient-to-br from-white/30 to-white/5 border border-white/20 rounded shadow-inner backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden">
                 <div className="w-full h-full bg-[radial-gradient(circle,_rgba(255,255,255,0.8)_1px,_transparent_1px)] bg-[length:4px_4px]"></div>
            </div>

             {/* Viewfinder Window (Next to flash) */}
             <div className="absolute top-8 left-20 w-6 h-6 bg-black rounded border-2 border-gray-600 shadow-[inset_0_0_4px_rgba(255,255,255,0.2)]"></div>
             
             {/* Decorative sensors */}
             <div className="absolute top-16 left-20 flex gap-2">
                 <div className="w-2 h-2 bg-gray-800 rounded-full border border-gray-600"></div>
                 <div className="w-2 h-2 bg-gray-800 rounded-full border border-gray-600"></div>
             </div>
        </div>

        {/* LENS ASSEMBLY (Center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-56 h-56 z-20">
            
            {/* Outer Ring (Silver) */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-200 via-gray-400 to-gray-300 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.5)] border border-gray-400"></div>
            
            {/* Inner Black Ring (Text area) */}
            <div className="absolute inset-3 rounded-full bg-black shadow-inner border border-gray-700 flex items-center justify-center">
                 {/* Lens Text */}
                 <div className="absolute inset-0 w-full h-full rounded-full animate-spin-slow" style={{ animationDuration: '20s' }}>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <path id="curve" d="M 15, 50 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
                        <text width="500" className="fill-gray-400 text-[4px] font-sans tracking-[0.2em] uppercase font-bold">
                            <textPath xlinkHref="#curve" startOffset="15%">
                                Focus Range 0.3m - ∞   •   Lens 60mm
                            </textPath>
                        </text>
                    </svg>
                 </div>
            </div>

            {/* The Actual Lens / Video Feed */}
            <div className="absolute inset-14 rounded-full bg-black overflow-hidden border-8 border-[#111] shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                {/* Webcam Feed */}
                {permissionError ? (
                     <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-[10px] text-center p-2">
                        Camera OFF
                    </div>
                ) : (
                    <video 
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1] opacity-90" 
                    />
                )}
                
                {/* Lens Glare/Reflection */}
                <div className="absolute -top-10 -left-10 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-xl pointer-events-none mix-blend-overlay"></div>
                <div className="absolute top-4 left-4 w-8 h-4 bg-white opacity-20 rounded-full -rotate-45 blur-[2px] pointer-events-none"></div>
            </div>
        </div>

        {/* SHUTTER BUTTON (Front Silver Circle) */}
        {/* In the Mini 90, the power switch is a ring around the shutter button on the front */}
        <div className="absolute top-20 right-8 z-30 w-14 h-14">
             {/* Power Ring Lever */}
             <div className="absolute inset-0 rounded-full bg-gray-800 border-2 border-gray-500 shadow-lg flex items-center justify-center transform -rotate-45">
                <div className="absolute -top-2 w-4 h-4 bg-gray-800 rounded-t-sm"></div>
             </div>
             
             {/* The Shutter Button Itself */}
             <button 
                onClick={handleCapture}
                className="absolute inset-2 rounded-full bg-gradient-to-b from-gray-100 to-gray-300 border border-gray-400 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] active:translate-y-[1px] active:shadow-inner flex items-center justify-center group-hover:ring-2 ring-white/50 transition-all"
                title="Take Photo"
             >
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-transparent to-gray-400 opacity-20"></div>
             </button>
        </div>

        {/* Bottom strap lugs */}
        <div className="absolute bottom-8 left-0 w-2 h-6 bg-gray-400 rounded-r"></div>
        <div className="absolute bottom-8 right-0 w-2 h-6 bg-gray-400 rounded-l"></div>
      </div>
    </div>
  );
};