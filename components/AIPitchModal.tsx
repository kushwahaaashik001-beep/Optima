"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  Zap, 
  Target, 
  Briefcase, 
  MapPin, 
  Clock, 
  Download,
  Share2,
  Edit,
  RefreshCw,
  Volume2,
  Eye,
  EyeOff,
  Save,
  History,
  TrendingUp,
  Users,
  Award,
  MessageSquare,
  ThumbsUp,
  Send,
  Star
} from 'lucide-react';
import { Lead } from '@/app/hooks/useLeads';
import { useUser } from '@/context/UserContext';
import { toast } from 'react-hot-toast';

interface AIPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitch: string;
  lead: Lead;
  onRegenerate?: () => Promise<string>;
  onSave?: (pitch: string) => Promise<void>;
}

interface PitchVersion {
  id: number;
  content: string;
  timestamp: string;
  rating?: number;
}

const PITCH_TONES = [
  { id: 'professional', name: 'Professional', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'casual', name: 'Casual', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'enthusiastic', name: 'Enthusiastic', icon: <Zap className="w-4 h-4" /> },
  { id: 'concise', name: 'Concise', icon: <Target className="w-4 h-4" /> },
];

const PITCH_LENGTHS = [
  { id: 'short', name: 'Short (100 words)', duration: '30s read' },
  { id: 'medium', name: 'Medium (200 words)', duration: '1min read' },
  { id: 'long', name: 'Long (300 words)', duration: '2min read' },
];

export default function AIPitchModal({ 
  isOpen, 
  onClose, 
  pitch, 
  lead, 
  onRegenerate,
  onSave 
}: AIPitchModalProps) {
  const { isPro } = useUser();
  const [currentPitch, setCurrentPitch] = useState(pitch);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [showHistory, setShowHistory] = useState(false);
  const [pitchVersions, setPitchVersions] = useState<PitchVersion[]>([
    { id: 1, content: pitch, timestamp: new Date().toLocaleTimeString(), rating: 4.5 },
  ]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [rating, setRating] = useState<number>(0);

  // Initialize with provided pitch
  useEffect(() => {
    if (pitch && pitchVersions.length === 1) {
      setCurrentPitch(pitch);
      setPitchVersions([{ 
        id: 1, 
        content: pitch, 
        timestamp: new Date().toLocaleTimeString(),
        rating: 4.5
      }]);
    }
  }, [pitch]);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(currentPitch);
    setCopied(true);
    toast.success('Pitch copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle download as text file
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([currentPitch], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `pitch-${lead.company}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Pitch downloaded!');
  };

  // Handle regenerate pitch
  const handleRegenerate = async () => {
    if (!isPro) {
      toast.error('Upgrade to Pro to regenerate pitches');
      return;
    }

    setIsGenerating(true);
    try {
      if (onRegenerate) {
        const newPitch = await onRegenerate();
        const newVersion: PitchVersion = {
          id: pitchVersions.length + 1,
          content: newPitch,
          timestamp: new Date().toLocaleTimeString(),
        };
        setCurrentPitch(newPitch);
        setPitchVersions(prev => [newVersion, ...prev]);
        toast.success('Pitch regenerated successfully!');
      }
    } catch (error) {
      toast.error('Failed to regenerate pitch');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle save pitch
  const handleSave = async () => {
    if (onSave) {
      await onSave(currentPitch);
      toast.success('Pitch saved to your collection!');
    }
  };

  // Handle share pitch
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pitch for ${lead.company}`,
          text: `Check out this AI-generated pitch for ${lead.title} position`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Handle text-to-speech
  const handleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(currentPitch);
      speech.rate = 1;
      speech.pitch = 1;
      speech.volume = 1;
      speechSynthesis.speak(speech);
      toast.success('Reading pitch out loud...');
    } else {
      toast.error('Text-to-speech not supported in this browser');
    }
  };

  // Handle rating
  const handleRate = (stars: number) => {
    setRating(stars);
    toast.success(`Rated ${stars} stars!`);
    
    // Update the rating in the current version
    setPitchVersions(prev => prev.map((version, index) => 
      index === 0 ? { ...version, rating: stars } : version
    ));
  };

  // Calculate pitch stats
  const calculateStats = (text: string) => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length - 1;
    const readingTime = Math.ceil(words / 200); // 200 words per minute
    const keywords = ['experienced', 'passionate', 'skilled', 'proven', 'expert'].filter(word => 
      text.toLowerCase().includes(word)
    ).length;

    return { words, sentences, readingTime, keywords };
  };

  const stats = calculateStats(currentPitch);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">AI Pitch Generator</h2>
                      <p className="text-gray-400">
                        Personalized pitch for <span className="text-purple-400">{lead.title}</span> at {lead.company}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {isPro && (
                      <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                        <Zap className="w-4 h-4 text-white mr-2" />
                        <span className="text-sm font-semibold text-white">PRO</span>
                      </div>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex h-[600px]">
                {/* Left Panel - Controls */}
                <div className="w-80 border-r border-gray-800 bg-gray-900/50 p-6 overflow-y-auto">
                  {/* Lead Info Card */}
                  <div className="mb-6 p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
                        {lead.company_logo ? (
                          <img src={lead.company_logo} alt={lead.company} className="w-full h-full object-cover" />
                        ) : (
                          <Briefcase className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{lead.company}</h4>
                        <p className="text-sm text-gray-400">{lead.title}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        {lead.location}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        Posted {new Date(lead.posted_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Target className="w-4 h-4 mr-2 text-gray-500" />
                        {lead.match_score}% match score
                      </div>
                    </div>
                  </div>

                  {/* Tone Selection */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Pitch Tone
                    </h3>
                    <div className="space-y-2">
                      {PITCH_TONES.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => setSelectedTone(tone.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                            selectedTone === tone.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {tone.icon}
                            <span>{tone.name}</span>
                          </div>
                          {selectedTone === tone.id && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Length Selection */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Pitch Length
                    </h3>
                    <div className="space-y-2">
                      {PITCH_LENGTHS.map((length) => (
                        <button
                          key={length.id}
                          onClick={() => setSelectedLength(length.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                            selectedLength === length.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <div>
                            <div className="text-left">{length.name}</div>
                            <div className="text-xs text-gray-400">{length.duration}</div>
                          </div>
                          {selectedLength === length.id && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Instructions */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Custom Instructions
                    </h3>
                    <textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="Add specific points to include..."
                      className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  {/* Pitch Stats */}
                  <div className="p-4 bg-gray-800/30 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Pitch Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Words</span>
                        <span className="text-white font-semibold">{stats.words}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Sentences</span>
                        <span className="text-white font-semibold">{stats.sentences}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Reading Time</span>
                        <span className="text-white font-semibold">{stats.readingTime} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Keywords Matched</span>
                        <span className="text-white font-semibold">{stats.keywords}/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content - Pitch */}
                <div className="flex-1 flex flex-col">
                  {/* Pitch Header */}
                  <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Generated Pitch</h3>
                        <p className="text-sm text-gray-400">
                          Optimized for {selectedTone} tone • {PITCH_LENGTHS.find(l => l.id === selectedLength)?.name}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowHistory(!showHistory)}
                          className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <History className="w-4 h-4" />
                          <span className="text-sm">History</span>
                        </button>
                        <button
                          onClick={handleRegenerate}
                          disabled={isGenerating}
                          className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                          <span className="text-sm">Regenerate</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pitch Content */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    {showHistory ? (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-white mb-4">Previous Versions</h4>
                        {pitchVersions.map((version) => (
                          <div
                            key={version.id}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              version.id === 1
                                ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30'
                                : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                            }`}
                            onClick={() => setCurrentPitch(version.content)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-white">
                                Version {version.id}
                              </span>
                              <span className="text-xs text-gray-500">{version.timestamp}</span>
                            </div>
                            <p className="text-gray-300 text-sm line-clamp-3">
                              {version.content}
                            </p>
                            {version.rating && (
                              <div className="flex items-center mt-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(version.rating!)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-600'
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-400 ml-2">{version.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="relative">
                        {isEditing ? (
                          <textarea
                            value={currentPitch}
                            onChange={(e) => setCurrentPitch(e.target.value)}
                            className="w-full h-96 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none"
                          />
                        ) : (
                          <div className="prose prose-invert max-w-none">
                            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700">
                              <div className="text-lg text-gray-200 whitespace-pre-wrap leading-relaxed">
                                {currentPitch}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Edit Toggle */}
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          {isEditing ? (
                            <>
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">Preview</span>
                            </>
                          ) : (
                            <>
                              <Edit className="w-4 h-4" />
                              <span className="text-sm">Edit</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="p-6 border-t border-gray-800">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        {/* Text-to-Speech */}
                        <button
                          onClick={handleTextToSpeech}
                          className="flex items-center space-x-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span className="text-sm">Listen</span>
                        </button>

                        {/* Rate Pitch */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">Rate:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRate(star)}
                                className="p-1 hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Save */}
                        <button
                          onClick={handleSave}
                          className="flex items-center space-x-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span className="text-sm">Save</span>
                        </button>

                        {/* Share */}
                        <button
                          onClick={handleShare}
                          className="flex items-center space-x-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm">Share</span>
                        </button>

                        {/* Download */}
                        <button
                          onClick={handleDownload}
                          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">Download</span>
                        </button>

                        {/* Copy */}
                        <button
                          onClick={handleCopy}
                          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span className="text-sm">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span className="text-sm">Copy Pitch</span>
                            </>
                          )}
                        </button>

                        {/* Send Application */}
                        <button
                          onClick={() => {
                            window.open(lead.application_url, '_blank');
                            toast.success('Opening application page...');
                          }}
                          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                          <Send className="w-4 h-4" />
                          <span className="text-sm">Apply Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Tips */}
              <div className="p-4 border-t border-gray-800 bg-gradient-to-r from-green-900/10 to-emerald-900/10">
                <div className="flex items-center space-x-3">
                  <ThumbsUp className="w-5 h-5 text-green-400" />
                  <div className="text-sm">
                    <span className="text-green-300 font-semibold">Pro Tip:</span>
                    <span className="text-green-400/70 ml-2">
                      Personalize the pitch with your specific achievements for better results
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
