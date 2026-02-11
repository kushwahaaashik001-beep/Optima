"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Sahi raasta: useUser ko ek hi baar import karo
import { useUser } from '../app/context/UserContext'; 
import { supabase } from '../lib/supabase'; 
import { toast } from 'react-hot-toast';
import { 
  Sparkles, 
  Send, 
  Copy, 
  RefreshCw,
  Zap, 
  Target, 
  Edit, 
  TrendingUp,
  Clock,
  BookOpen,
  MessageSquare,
  Check,
  AlertCircle
} from 'lucide-react';
interface AIPitchGeneratorProps {
  leadId?: string;
  onPitchGenerated?: (pitch: string) => void;
}

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'enthusiastic', label: 'Enthusiastic', icon: <Zap className="w-4 h-4" /> },
  { id: 'casual', label: 'Casual', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'concise', label: 'Concise', icon: <Target className="w-4 h-4" /> },
];

const LENGTH_OPTIONS = [
  { id: 'short', label: 'Short', description: '100 words • 30s read' },
  { id: 'medium', label: 'Medium', description: '200 words • 1min read' },
  { id: 'long', label: 'Long', description: '300 words • 2min read' },
];

const SAMPLE_PITCHES = [
  {
    title: 'Conversion Optimized',
    description: 'High-performing pitch with 68% response rate',
    stats: { responses: 45, interviews: 12 }
  },
  {
    title: 'Tech-Focused',
    description: 'Highlights technical expertise and projects',
    stats: { responses: 38, interviews: 9 }
  },
  {
    title: 'Creative Approach',
    description: 'Unique angle that stands out from competition',
    stats: { responses: 52, interviews: 15 }
  }
];

export default function AIPitchGenerator({ leadId, onPitchGenerated }: AIPitchGeneratorProps) {
  const { isPro } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pitch, setPitch] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [copied, setCopied] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<any[]>([]);
  const [showTips, setShowTips] = useState(true);

  // Load generation history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('/api/pitch-history');
        if (response.ok) {
          const data = await response.json();
          setGenerationHistory(data.history || []);
        }
      } catch (error) {
        console.error('Failed to load pitch history:', error);
      }
    };
    
    if (isPro) {
      loadHistory();
    }
  }, [isPro]);

  const handleGeneratePitch = async () => {
    if (!isPro) {
      toast.error('Upgrade to Pro to generate AI pitches');
      return;
    }

    if (!leadId) {
      toast.error('Please select a lead first');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          customInstructions,
          tone: selectedTone,
          length: selectedLength
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate pitch');
      }

      const generatedPitch = data.pitch;
      setPitch(generatedPitch);
      
      // Add to history
      setGenerationHistory(prev => [{
        id: Date.now(),
        pitch: generatedPitch,
        tone: selectedTone,
        length: selectedLength,
        timestamp: new Date().toISOString(),
      }, ...prev]);

      if (onPitchGenerated) {
        onPitchGenerated(generatedPitch);
      }

      toast.success('AI Pitch generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate pitch');
      console.error('Pitch generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPitch = () => {
    if (!pitch) {
      toast.error('No pitch to copy');
      return;
    }

    navigator.clipboard.writeText(pitch);
    setCopied(true);
    toast.success('Pitch copied to clipboard!');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleRegenerate = () => {
    setPitch('');
    handleGeneratePitch();
  };

  const handleUseSample = (sample: any) => {
    setSelectedTone('professional');
    setSelectedLength('medium');
    setCustomInstructions(sample.description);
    
    if (leadId) {
      setTimeout(() => handleGeneratePitch(), 100);
    }
  };

  if (!isPro) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
        <div className="text-center">
          <div className="inline-flex p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">AI Pitch Generator</h3>
          <p className="text-gray-400 mb-6">
            Upgrade to Pro to generate personalized pitches using advanced AI
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <h4 className="font-semibold text-white">Pro Benefits</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Unlimited AI pitch generation
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Multiple tone and length options
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Pitch history and analytics
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Higher response rate (68% average)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Pitch Generator</h3>
            <p className="text-sm text-gray-400">Create personalized pitches in seconds</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">PRO</span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Tone
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TONE_OPTIONS.map((tone) => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  selectedTone === tone.id
                    ? 'bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-purple-500/50'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="mb-2">{tone.icon}</div>
                <span className="text-xs font-medium text-white">{tone.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Length Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Pitch Length
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LENGTH_OPTIONS.map((length) => (
              <button
                key={length.id}
                onClick={() => setSelectedLength(length.id)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  selectedLength === length.id
                    ? 'bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border-blue-500/50'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="font-medium text-white mb-1">{length.label}</div>
                <div className="text-xs text-gray-400">{length.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Custom Instructions
            <span className="text-gray-500 text-xs ml-2">(Optional)</span>
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Add specific points to include, key achievements, or special requirements..."
            className="w-full h-24 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
            rows={3}
          />
        </div>

        {/* Sample Pitches */}
        {!pitch && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Sample Pitches
              </label>
              <button
                onClick={() => setShowTips(!showTips)}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                {showTips ? 'Hide tips' : 'Show tips'}
              </button>
            </div>
            
            {showTips && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SAMPLE_PITCHES.map((sample, index) => (
                  <motion.div
                    key={sample.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => handleUseSample(sample)}
                      className="w-full p-4 bg-gray-800/30 border border-gray-700 rounded-xl hover:border-purple-500/30 transition-colors text-left group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white group-hover:text-purple-300">
                          {sample.title}
                        </h4>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{sample.description}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-green-400">
                          {sample.stats.responses} responses
                        </span>
                        <span className="text-blue-400">
                          {sample.stats.interviews} interviews
                        </span>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generated Pitch */}
        {pitch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Generated Pitch
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white"
                >
                  <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700 rounded-xl">
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {pitch}
                </p>
              </div>
              
              {/* Copy Button */}
              <button
                onClick={handleCopyPitch}
                className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGeneratePitch}
            disabled={isGenerating || !leadId}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate AI Pitch</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => window.open('/ai-pitch', '_blank')}
            className="px-6 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 hover:text-white transition-colors"
          >
            <span>Advanced Editor</span>
          </button>
        </div>

        {/* Generation History */}
        {generationHistory.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Recent Pitches
              </label>
              <span className="text-xs text-gray-500">
                {generationHistory.length} generated
              </span>
            </div>
            
            <div className="space-y-2">
              {generationHistory.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-800/30 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => setPitch(item.pitch)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                        {item.tone}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                        {item.length}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {item.pitch.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">68%</div>
            <div className="text-xs text-gray-400">Response Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">2.1x</div>
            <div className="text-xs text-gray-400">More Effective</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">24s</div>
            <div className="text-xs text-gray-400">Avg Generation</div>
          </div>
        </div>
      </div>
    </div>
  );
}
