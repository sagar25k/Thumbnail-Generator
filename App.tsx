import React, { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import GlassCard from './components/GlassCard';
import NeonButton from './components/NeonButton';
import Vault from './components/Vault';
import ImageEditor from './components/ImageEditor';
import { APP_NAME, ENGINE_NAME, STYLE_PRESETS, ASPECT_RATIOS } from './constants';
import { AppMode, GeneratedImage, StylePreset } from './types';
import { generateImageFromText, transformImageStyle, editImageWithPrompt } from './services/geminiService';

function App() {
  const [mode, setMode] = useState<AppMode>('DREAM');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>(STYLE_PRESETS[0]);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New state for editing
  const [editingImage, setEditingImage] = useState<{ url: string; prompt: string; styleName: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg("Please upload a valid image file (PNG/JPG).");
        return;
      }
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrorMsg(null);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      let imageUrl = '';
      let finalPrompt = '';

      if (mode === 'DREAM') {
        if (!prompt.trim()) {
          throw new Error("Please enter a prompt!");
        }
        finalPrompt = prompt;
        imageUrl = await generateImageFromText(prompt, selectedStyle.description, aspectRatio);
      } else if (mode === 'STYLE') {
        // Style Mode
        if (!uploadedFile || !uploadPreview) {
          throw new Error("Please upload an image first!");
        }
        finalPrompt = `Restyled upload: ${uploadedFile.name}`;
        // Extract base64 part for service
        imageUrl = await transformImageStyle(uploadPreview, uploadedFile.type, selectedStyle.description, aspectRatio);
      } else if (mode === 'EDIT') {
        // Edit Mode (Image + Text)
        if (!uploadedFile || !uploadPreview) {
          throw new Error("Please upload an image to edit!");
        }
        if (!prompt.trim()) {
          throw new Error("Please enter instructions for the edit!");
        }
        finalPrompt = `Edit: ${prompt}`;
        // Combine prompt with style for flavor
        const fullInstruction = `${prompt}. Maintain visual coherence but apply elements of style: ${selectedStyle.description}`;
        imageUrl = await editImageWithPrompt(uploadPreview, uploadedFile.type, fullInstruction, aspectRatio);
      }

      // Instead of saving directly, we enter "Edit Mode"
      setEditingImage({
        url: imageUrl,
        prompt: finalPrompt,
        styleName: selectedStyle.name
      });

    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = (processedImageUrl: string) => {
    if (!editingImage) return;

    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      imageUrl: processedImageUrl,
      prompt: editingImage.prompt,
      styleName: editingImage.styleName,
      timestamp: Date.now(),
    };

    setHistory(prev => [newImage, ...prev]);
    setEditingImage(null); // Close editor
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-4 md:p-8 gap-6 max-w-[1600px] mx-auto">
      
      {/* EDITOR OVERLAY */}
      {editingImage && (
        <ImageEditor 
          imageSrc={editingImage.url} 
          onSave={handleSaveEdit} 
          onCancel={() => setEditingImage(null)} 
        />
      )}

      {/* LEFT COLUMN - MAIN INTERFACE */}
      <div className="flex-1 flex flex-col gap-8">
        
        {/* HEADER */}
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {APP_NAME}
          </h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
              {ENGINE_NAME}
            </span>
          </div>
        </header>

        {/* INPUT STATION */}
        <GlassCard className="p-1">
          {/* TABS */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setMode('DREAM')}
              className={`flex-1 py-4 text-center font-bold tracking-wider transition-all duration-300 ${mode === 'DREAM' ? 'bg-white/10 text-neonCyan shadow-[inset_0_-2px_0_#FF0080]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              DREAM IT
            </button>
            <button
              onClick={() => setMode('STYLE')}
              className={`flex-1 py-4 text-center font-bold tracking-wider transition-all duration-300 ${mode === 'STYLE' ? 'bg-white/10 text-neonPurple shadow-[inset_0_-2px_0_#7928CA]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              STYLE IT
            </button>
            <button
              onClick={() => setMode('EDIT')}
              className={`flex-1 py-4 text-center font-bold tracking-wider transition-all duration-300 ${mode === 'EDIT' ? 'bg-white/10 text-yellow-400 shadow-[inset_0_-2px_0_#FACC15]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              EDIT IT
            </button>
          </div>

          <div className="p-6 flex flex-col gap-6">
            
            {/* DYNAMIC INPUT AREA */}
            <div className="min-h-[150px] flex flex-col gap-6">
              
              {/* UPLOADER - Show for STYLE or EDIT */}
              {(mode === 'STYLE' || mode === 'EDIT') && (
                <div className="flex flex-col gap-2 animate-fadeIn">
                   <label className={`text-sm font-bold uppercase tracking-widest ${mode === 'EDIT' ? 'text-yellow-400' : 'text-neonPurple'}`}>
                     Source Material
                   </label>
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed border-white/20 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden ${mode === 'EDIT' ? 'hover:border-yellow-400' : 'hover:border-neonPurple'}`}
                   >
                     {uploadPreview ? (
                       <>
                        <img src={uploadPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                        <span className="relative z-10 font-bold text-white drop-shadow-md">Change Image</span>
                       </>
                     ) : (
                       <>
                         <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📂</span>
                         <span className="text-gray-400 text-sm">Click to upload JPG/PNG</span>
                       </>
                     )}
                     <input 
                       ref={fileInputRef}
                       type="file" 
                       accept="image/png, image/jpeg" 
                       onChange={handleFileUpload} 
                       className="hidden" 
                     />
                   </div>
                </div>
              )}

              {/* TEXT AREA - Show for DREAM or EDIT */}
              {(mode === 'DREAM' || mode === 'EDIT') && (
                <div className="flex flex-col gap-2 animate-fadeIn">
                  <label className={`text-sm font-bold uppercase tracking-widest ${mode === 'EDIT' ? 'text-yellow-400' : 'text-neonCyan'}`}>
                    {mode === 'EDIT' ? 'Instructions' : 'Your Vision'}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={mode === 'EDIT' ? "Add a neon sign that says 'OPEN'..." : "A cyberpunk cat hacker eating ramen in a rainy neo-tokyo alleyway..."}
                    className={`w-full h-32 bg-midnight/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${mode === 'EDIT' ? 'focus:border-yellow-400 focus:ring-yellow-400' : 'focus:border-neonCyan focus:ring-neonCyan'}`}
                  />
                </div>
              )}

            </div>

            {/* SETTINGS ROW: VIBE & ASPECT RATIO */}
            <div className="flex flex-col md:flex-row gap-4">
              
              {/* VIBE SELECTOR */}
              <div className="flex-[2] flex flex-col gap-2">
                <label className="text-sm text-white/80 font-bold uppercase tracking-widest">Select Vibe</label>
                <select
                  value={selectedStyle.id}
                  onChange={(e) => setSelectedStyle(STYLE_PRESETS.find(s => s.id === e.target.value) || STYLE_PRESETS[0])}
                  className="w-full bg-midnight/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                >
                  {STYLE_PRESETS.map(style => (
                    <option key={style.id} value={style.id}>{style.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 italic px-1 h-4">{selectedStyle.description}</p>
              </div>

              {/* ASPECT RATIO */}
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm text-white/80 font-bold uppercase tracking-widest">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-midnight/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                >
                  {ASPECT_RATIOS.map(ratio => (
                    <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* ERROR MESSAGE */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            {/* ACTION BUTTON */}
            <NeonButton 
              onClick={handleGenerate} 
              isLoading={isGenerating}
              className="w-full text-lg shadow-lg"
            >
              {mode === 'DREAM' ? 'Materialize Vision' : mode === 'EDIT' ? 'Execute Edit' : 'Transmute Reality'}
            </NeonButton>

          </div>
        </GlassCard>

        {/* THE VAULT (HISTORY) */}
        <div>
          <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
            The Vault <span className="text-sm font-mono font-normal text-gray-500 self-center">({history.length})</span>
          </h2>
          <Vault images={history} />
        </div>

      </div>

      {/* RIGHT COLUMN - SIDEBAR */}
      <div className="w-full md:w-80 flex-shrink-0">
        <Sidebar />
      </div>

    </div>
  );
}

export default App;