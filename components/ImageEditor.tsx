import React, { useState, useRef, useEffect } from 'react';
import GlassCard from './GlassCard';
import NeonButton from './NeonButton';
import { getProcessedImage, ImageAdjustments, CropState } from '../utils/imageProcessing';

interface ImageEditorProps {
  imageSrc: string;
  onSave: (newImageSrc: string) => void;
  onCancel: () => void;
}

const FILTERS = [
  { name: 'Normal', config: {} },
  { name: 'Noir', config: { grayscale: 100, contrast: 120 } },
  { name: 'Vivid', config: { saturate: 150, contrast: 110 } },
  { name: 'Warm', config: { sepia: 50, brightness: 105 } },
  { name: 'Cyber', config: { saturate: 200, contrast: 120, brightness: 110 } },
  { name: 'Fade', config: { brightness: 110, contrast: 90, saturate: 80 } },
];

const ASPECT_RATIOS = [
  { name: 'Original', value: null },
  { name: 'Square (1:1)', value: 1 },
  { name: 'Portrait (4:5)', value: 4/5 },
  { name: 'Landscape (16:9)', value: 16/9 },
];

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onCancel }) => {
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
  });

  const [crop, setCrop] = useState<CropState>({
    x: 0, 
    panX: 0,
    panY: 0,
    zoom: 1,
    aspectRatio: null
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset panning when aspect changes
  useEffect(() => {
    setCrop(prev => ({ ...prev, panX: 0, panY: 0, zoom: 1 }));
  }, [crop.aspectRatio]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return;
    e.preventDefault();
    
    // Calculate delta
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // We map screen pixels roughly to source pixels for the processor logic
    // Just accumulation for now
    // Sensitivity factor
    const sensitivity = 1.5 / crop.zoom; 

    setCrop(prev => ({
      ...prev,
      panX: prev.panX + (dx * sensitivity),
      panY: prev.panY + (dy * sensitivity)
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const result = await getProcessedImage(
        imageSrc, 
        crop, 
        adjustments, 
        containerRef.current?.clientWidth || 500,
        containerRef.current?.clientHeight || 500
      );
      onSave(result);
    } catch (e) {
      console.error(e);
      alert("Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper for sliders
  const Slider = ({ label, value, min, max, onChange }: any) => (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neonCyan hover:[&::-webkit-slider-thumb]:bg-neonPurple transition-colors"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <GlassCard className="w-full max-w-5xl h-[90vh] flex flex-col md:flex-row overflow-hidden">
        
        {/* PREVIEW AREA */}
        <div className="flex-1 bg-black/50 relative overflow-hidden flex items-center justify-center p-8 select-none">
          <div 
            className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', 
              backgroundSize: '20px 20px' 
            }}
          />
          
          <div 
            ref={containerRef}
            className="relative overflow-hidden shadow-2xl border-2 border-white/10 cursor-move"
            style={{
              aspectRatio: crop.aspectRatio ? `${crop.aspectRatio}` : 'auto',
              maxHeight: '100%',
              maxWidth: '100%',
              width: crop.aspectRatio ? 'auto' : '100%', // Fallback
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
             <img
                ref={imageRef}
                src={imageSrc}
                alt="Editing"
                className="max-w-none origin-center"
                style={{
                   transform: `translate(${crop.panX}px, ${crop.panY}px) scale(${crop.zoom})`,
                   filter: `
                     brightness(${adjustments.brightness}%) 
                     contrast(${adjustments.contrast}%) 
                     saturate(${adjustments.saturate}%) 
                     grayscale(${adjustments.grayscale}%) 
                     sepia(${adjustments.sepia}%)
                   `,
                   // If no aspect ratio fixed, ensure image fits naturally initially
                   width: crop.aspectRatio ? '100%' : 'auto', 
                   height: crop.aspectRatio ? '100%' : 'auto',
                   objectFit: 'cover'
                }}
                draggable={false}
             />
             
             {/* Grid Overlay for Crop */}
             <div className="absolute inset-0 pointer-events-none border border-white/30 grid grid-cols-3 grid-rows-3 opacity-50">
                {[...Array(9)].map((_, i) => <div key={i} className="border border-white/10"></div>)}
             </div>
          </div>

          <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/50 pointer-events-none">
            Drag to Pan • Pinch/Slider to Zoom
          </div>
        </div>

        {/* CONTROLS AREA */}
        <div className="w-full md:w-80 flex flex-col bg-midnight/80 border-l border-white/10 p-6 gap-6 overflow-y-auto">
          
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-display font-bold text-neonCyan">Studio Editor</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-white">✕</button>
          </div>

          {/* CROP TOOLS */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Crop & Zoom</h4>
            <div className="grid grid-cols-2 gap-2">
               {ASPECT_RATIOS.map(ratio => (
                 <button
                   key={ratio.name}
                   onClick={() => setCrop(c => ({ ...c, aspectRatio: ratio.value }))}
                   className={`text-xs py-2 rounded border ${crop.aspectRatio === ratio.value ? 'bg-neonPurple/20 border-neonPurple text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                 >
                   {ratio.name}
                 </button>
               ))}
            </div>
            <Slider 
               label="Zoom" 
               value={crop.zoom} 
               min={1} 
               max={3} 
               onChange={(v: number) => setCrop(c => ({ ...c, zoom: v }))} 
            />
          </div>

          {/* FILTERS */}
          <div className="space-y-3">
             <h4 className="text-sm font-bold text-white uppercase tracking-widest">Filters</h4>
             <div className="grid grid-cols-3 gap-2">
               {FILTERS.map(f => (
                 <button
                   key={f.name}
                   onClick={() => setAdjustments(prev => ({ 
                      ...prev, 
                      brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, // Reset
                      ...f.config // Apply
                   }))}
                   className="text-xs py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-300 transition-colors"
                 >
                   {f.name}
                 </button>
               ))}
             </div>
          </div>

          {/* FINE TUNE */}
          <div className="space-y-4 flex-1">
             <h4 className="text-sm font-bold text-white uppercase tracking-widest">Adjustments</h4>
             <Slider 
               label="Brightness" 
               value={adjustments.brightness} 
               min={0} max={200} 
               onChange={(v: number) => setAdjustments(p => ({ ...p, brightness: v }))} 
             />
             <Slider 
               label="Contrast" 
               value={adjustments.contrast} 
               min={0} max={200} 
               onChange={(v: number) => setAdjustments(p => ({ ...p, contrast: v }))} 
             />
             <Slider 
               label="Saturation" 
               value={adjustments.saturate} 
               min={0} max={200} 
               onChange={(v: number) => setAdjustments(p => ({ ...p, saturate: v }))} 
             />
             <Slider 
               label="Grayscale" 
               value={adjustments.grayscale} 
               min={0} max={100} 
               onChange={(v: number) => setAdjustments(p => ({ ...p, grayscale: v }))} 
             />
             <Slider 
               label="Sepia" 
               value={adjustments.sepia} 
               min={0} max={100} 
               onChange={(v: number) => setAdjustments(p => ({ ...p, sepia: v }))} 
             />
          </div>

          {/* ACTIONS */}
          <div className="pt-4 border-t border-white/10 flex gap-3">
            <NeonButton variant="secondary" onClick={onCancel} className="flex-1 py-2 text-sm">
              Discard
            </NeonButton>
            <NeonButton 
              onClick={handleSave} 
              isLoading={isProcessing} 
              className="flex-1 py-2 text-sm shadow-none"
            >
              Save to Vault
            </NeonButton>
          </div>

        </div>
      </GlassCard>
    </div>
  );
};

export default ImageEditor;