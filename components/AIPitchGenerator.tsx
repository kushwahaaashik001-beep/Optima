'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Copy, 
  Send, 
  RefreshCw, 
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Wand2,
  Clock,
  Zap,
  Brain,
  Lock,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface AIPitchGeneratorProps {
  isOpen: boolean
  onClose: () => void
  lead: any
  isPro: boolean
}

const toneOptions = [
  { id: 'professional', name: 'Professional', icon: '👔', color: 'from-blue-500 to-cyan-500' },
  { id: 'friendly', name: 'Friendly', icon: '🤝', color: 'from-green-500 to-emerald-500' },
  { id: 'direct', name: 'Direct', icon: '🎯', color: 'from-red-500 to-orange-500' },
  { id: 'creative', name: 'Creative', icon: '🎨', color: 'from-purple-500 to-pink-500' },
  { id: 'persuasive', name: 'Persuasive', icon: '💫', color: 'from-yellow-500 to-amber-500' },
]

const lengthOptions = [
  { id: 'short', name: 'Short (2-3 lines)', time: '5s' },
  { id: 'medium', name: 'Medium (Paragraph)', time: '10s' },
  { id: 'detailed', name: 'Detailed (Full pitch)', time: '15s' },
]

export default function AIPitchGenerator({ isOpen, onClose, lead, isPro }: AIPitchGeneratorProps) {
  const [pitch, setPitch] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTone, setSelectedTone] = useState('professional')
  const [selectedLength, setSelectedLength] = useState('medium')
  const [includeExamples, setIncludeExamples] = useState(true)
  const [includePortfolio, setIncludePortfolio] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null)

  useEffect(() => {
    if (isOpen && lead && isPro) {
      // Auto-generate pitch on open for Pro users
      setTimeout(() => {
        generateSamplePitch()
      }, 500)
    }
  }, [isOpen, lead, isPro])

  const generateSamplePitch = () => {
    setIsGenerating(true)
    
    // Simulate AI generation
    setTimeout(() => {
      const samplePitches = {
        professional: `Dear Hiring Manager,

I came across your ${lead?.title} opportunity and was impressed by the project scope. With ${lead?.skills?.length || 5} years of experience in ${lead?.skills?.[0] || 'video editing'}, I have successfully delivered similar projects for clients in ${lead?.location || 'various locations'}.

Key strengths that align with your requirements:
• Expertise in ${lead?.skills?.join(', ') || 'relevant skills'}
• Proven track record with budgets up to $${lead?.budget ? lead.budget * 1.5 : '5000'}
• Quick turnaround time (${Math.floor(Math.random() * 7) + 3}-day delivery)
• Professional communication throughout

I have attached my portfolio showcasing similar work. Looking forward to discussing how I can contribute to your project.

Best regards,
[Your Name]`,

        friendly: `Hey there! 👋

Just saw your ${lead?.title} post and got really excited about it! I've been doing ${lead?.skills?.[0] || 'this kind of work'} for a while now and absolutely love projects like yours.

Quick about me:
• ${Math.floor(Math.random() * 10) + 3} years of ${lead?.skills?.[0] || 'experience'}
• Worked with clients from ${lead?.location || 'around the globe'}
• Super responsive and easy to work with
• Really passionate about ${lead?.skills?.[0] || 'the craft'}

Would be awesome to chat more about your vision! I'm available for a quick call anytime this week.

Cheers!`,

        direct: `Subject: Ready to start on your ${lead?.title}

I can deliver your ${lead?.title} project within ${Math.floor(Math.random() * 7) + 3} days for $${lead?.budget || 'your budget'}.

Why me:
- Specialized in ${lead?.skills?.join(', ') || 'required skills'}
- ${Math.floor(Math.random() * 50) + 20}+ successful projects
- Available to start immediately
- Money-back guarantee if not satisfied

Let me know if you'd like to proceed. I'll send over a detailed proposal.

Best,
[Your Name]`
      }

      setPitch(samplePitches[selectedTone as keyof typeof samplePitches] || samplePitches.professional)
      setIsGenerating(false)
      toast.success('AI Pitch Generated Successfully!')
    }, 1500)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pitch)
    setIsCopied(true)
    toast.success('Pitch copied to clipboard!')
    
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleSend = () => {
    toast.success('Pitch sent successfully!')
    onClose()
  }

  const handleRegenerate = () => {
    generateSamplePitch()
  }

  const handleFeedback = (type: 'liked' | 'disliked') => {
    setFeedback(type)
    toast.success(`Feedback recorded! ${type === 'liked' ? '👍' : '👎'}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30"></div>
                <div className="relative bg-black p-3 rounded-lg">
                  <Brain className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI Pitch Generator
                </h2>
                <p className="text-gray-400">Generate personalized pitches for {lead?.title || 'this lead'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(90vh-80px)]">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 p-6 border-r border-gray-800 space-y-6">
            {/* Lead Info */}
            <div className="bg-gray-900/50 rounded-xl p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Lead Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Title:</span>
                  <span className="font-medium">{lead?.title || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Budget:</span>
                  <span className="font-medium text-green-400">${lead?.budget?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="font-medium">{lead?.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Skills:</span>
                  <span className="font-medium">{lead?.skills?.join(', ') || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-purple-400" />
                Tone & Style
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {toneOptions.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedTone === tone.id
                        ? `bg-gradient-to-r ${tone.color} text-white`
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{tone.icon}</div>
                    <div className="text-sm font-medium">{tone.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Length Options */}
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-400" />
                Length
              </h3>
              <div className="space-y-2">
                {lengthOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedLength(option.id)}
                    className={`w-full p-3 rounded-xl flex justify-between items-center ${
                      selectedLength === option.id
                        ? 'bg-purple-600/20 border border-purple-500/50'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <span>{option.name}</span>
                    <span className="text-sm text-gray-400">{option.time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  <span>Include Examples</span>
                </div>
                <div className={`w-10 h-6 rounded-full ${includeExamples ? 'bg-green-500' : 'bg-gray-700'} relative`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${includeExamples ? 'left-5' : 'left-1'}`} />
                </div>
                <input
                  type="checkbox"
                  checked={includeExamples}
                  onChange={(e) => setIncludeExamples(e.target.checked)}
                  className="hidden"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <span>Include Portfolio Link</span>
                </div>
                <div className={`w-10 h-6 rounded-full ${includePortfolio ? 'bg-green-500' : 'bg-gray-700'} relative`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${includePortfolio ? 'left-5' : 'left-1'}`} />
                </div>
                <input
                  type="checkbox"
                  checked={includePortfolio}
                  onChange={(e) => setIncludePortfolio(e.target.checked)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Right Panel - Preview & Actions */}
          <div className="lg:col-span-2 flex flex-col p-6">
            {/* Pitch Preview */}
            <div className="flex-1 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Generated Pitch</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Sparkles className="h-4 w-4" />
                  <span>Powered by Gemini AI</span>
                </div>
              </div>

              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-pink-900/10 rounded-xl"></div>
                <div className="relative h-full">
                  <textarea
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    placeholder={isGenerating ? "AI is generating your pitch..." : "Click 'Generate Pitch' to create an AI-powered pitch..."}
                    className="w-full h-full min-h-[300px] bg-gray-900/50 border border-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    disabled={isGenerating}
                  />
                  
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-xl">
                      <div className="text-center">
                        <div className="relative inline-block mb-4">
                          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-30"></div>
                          <RefreshCw className="relative h-8 w-8 text-purple-400 animate-spin" />
                        </div>
                        <p className="text-gray-300">AI is crafting your perfect pitch...</p>
                        <p className="text-sm text-gray-500 mt-2">Using advanced NLP to match client's requirements</p>
                      </div>
                    </div>
                  )}

                  {!pitch && !isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-500">No pitch generated yet</p>
                        <p className="text-sm text-gray-600 mt-2">Configure settings and click Generate</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Main Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating || !isPro}
                  className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
                    isPro
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
                      : 'bg-gray-800 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {pitch ? 'Regenerate Pitch' : 'Generate Pitch'}
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopy}
                  disabled={!pitch || isCopied}
                  className={`px-6 rounded-xl font-medium flex items-center gap-2 ${
                    isCopied
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>

                <button
                  onClick={handleSend}
                  disabled={!pitch}
                  className="px-6 bg-green-600 hover:bg-green-700 rounded-xl font-medium flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </div>

              {/* Feedback & Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Credits used:</span>
                    <span className="font-medium text-purple-400">5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Time saved:</span>
                    <span className="font-medium text-green-400">~15min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Success rate:</span>
                    <span className="font-medium text-yellow-400">92%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Help us improve:</span>
                  <button
                    onClick={() => handleFeedback('liked')}
                    className={`p-1 rounded ${feedback === 'liked' ? 'bg-green-500/20 text-green-400' : 'hover:bg-gray-800'}`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleFeedback('disliked')}
                    className={`p-1 rounded ${feedback === 'disliked' ? 'bg-red-500/20 text-red-400' : 'hover:bg-gray-800'}`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Pro Feature Notice */}
              {!isPro && (
                <div className="p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="font-medium text-yellow-300">PRO Feature Unlocked</p>
                      <p className="text-sm text-yellow-400/80">
                        Upgrade to PRO for unlimited AI pitch generation and advanced customization
                      </p>
                    </div>
                    <button className="ml-auto px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-medium hover:opacity-90">
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
