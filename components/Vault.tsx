import React from 'react';
import { GeneratedImage } from '../types';
import GlassCard from './GlassCard';

interface VaultProps {
  images: GeneratedImage[];
}

const Vault: React.FC<VaultProps> = ({ images }) => {
  const handleDownload = (imageUrl: string, id: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `tooncraft-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 italic">
        The vault is empty. Start creating!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((img) => (
        <GlassCard key={img.id} className="overflow-hidden group relative">
          <div className="aspect-square relative overflow-hidden bg-black/50">
            <img 
              src={img.imageUrl} 
              alt={img.prompt} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
              <p className="text-xs text-neonCyan font-bold mb-1 uppercase tracking-wider">{img.styleName}</p>
              <p className="text-sm text-white mb-4 line-clamp-3">{img.prompt}</p>
              <button 
                onClick={() => handleDownload(img.imageUrl, img.id)}
                className="bg-white text-midnight hover:bg-neonCyan hover:text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
              >
                Download PNG
              </button>
            </div>
          </div>
          <div className="p-3 border-t border-white/5 bg-midnight/30">
            <p className="text-xs text-gray-400 truncate font-mono">
              {new Date(img.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default Vault;