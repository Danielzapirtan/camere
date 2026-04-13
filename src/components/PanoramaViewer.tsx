import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface PanoramaViewerProps {
  imageUrl: string;
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({ imageUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 100, damping: 30 });
  const [isDragging, setIsDragging] = useState(false);

  // We want to simulate a 400 degree view. 
  // 360 degrees is one full rotation. 400 degrees means 1.11 rotations.
  // We'll repeat the image to allow "infinite" scrolling or at least a wrap-around feel.

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[400px] overflow-hidden bg-black rounded-xl cursor-grab active:cursor-grabbing border border-white/10"
    >
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        style={{ x: springX }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        className="flex h-full"
      >
        <img 
          src={imageUrl} 
          alt="Panorama View" 
          className="h-full w-auto max-w-none select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/70 uppercase tracking-widest pointer-events-none">
        Trage pentru a explora vederea de 400°
      </div>
    </div>
  );
};
