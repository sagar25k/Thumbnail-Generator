import React, { useState } from 'react';
import GlassCard from './GlassCard';
import NeonButton from './NeonButton';
import { FeedbackData } from '../types';

const Sidebar: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackData>({ rating: null, request: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (rating: FeedbackData['rating']) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send to backend.
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback({ rating: null, request: '' });
    }, 3000);
  };

  return (
    <GlassCard className="h-full p-6 flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-display font-bold mb-4 text-neonCyan">App Settings</h2>
        <div className="text-sm text-gray-400">
          <p className="mb-2">Engine: <span className="text-white font-mono">v2.5-Flash</span></p>
          <p>Region: <span className="text-white font-mono">us-central1</span></p>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-display font-bold mb-4 text-neonCyan">Vibe Check</h2>
        
        {submitted ? (
          <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-xl text-center animate-pulse">
            <p className="font-bold text-green-200">Thanks for keeping it real! 🍌</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex justify-between gap-2">
              <button 
                type="button"
                onClick={() => handleRating('FIRE')}
                className={`flex-1 py-2 rounded-lg border transition-colors ${feedback.rating === 'FIRE' ? 'bg-orange-500/50 border-orange-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                🔥
              </button>
              <button 
                type="button"
                onClick={() => handleRating('MID')}
                className={`flex-1 py-2 rounded-lg border transition-colors ${feedback.rating === 'MID' ? 'bg-yellow-500/50 border-yellow-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                😐
              </button>
              <button 
                type="button"
                onClick={() => handleRating('DEAD')}
                className={`flex-1 py-2 rounded-lg border transition-colors ${feedback.rating === 'DEAD' ? 'bg-red-500/50 border-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                💀
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300">Feature Requests</label>
              <textarea 
                value={feedback.request}
                onChange={(e) => setFeedback(prev => ({...prev, request: e.target.value}))}
                className="w-full bg-midnight/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-neonPurple focus:ring-1 focus:ring-neonPurple resize-none h-32"
                placeholder="What should we build next?"
              />
            </div>

            <NeonButton type="submit" className="w-full text-sm py-2">
              Send Feedback
            </NeonButton>
          </form>
        )}
      </div>
      
      <div className="text-xs text-center text-gray-500 font-mono">
        v1.0.0 • ToonCraft Studio
      </div>
    </GlassCard>
  );
};

export default Sidebar;