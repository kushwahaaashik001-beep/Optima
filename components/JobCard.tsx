'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Users,
  Calendar,
  ExternalLink,
  Heart,
  Share2,
  Bookmark,
  Eye,
  TrendingUp,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  Zap
} from 'lucide-react'

interface JobCardProps {
  job: any
  isPro: boolean
  onApply: (jobId: string) => void
  onSave: (jobId: string) => void
}

export default function JobCard({ job, isPro, onApply, onSave }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S': return 'from-yellow-500 to-amber-500'
      case 'A': return 'from-green-500 to-emerald-500'
      case 'B': return 'from-blue-500 to-cyan-500'
      case 'C': return 'from-gray-500 to-gray-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'S': return 'Premium'
      case 'A': return 'High Quality'
      case 'B': return 'Good'
      case 'C': return 'Standard'
      default: return 'Standard'
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave(job.id)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`bg-gradient-to-br from-gray-900 to-black border rounded-2xl overflow-hidden transition-all ${
        job.tier === 'S' ? 'border-yellow-500/30' :
        job.tier === 'A' ? 'border-green-500/30' :
        job.tier === 'B' ? 'border-blue-500/30' :
        'border-gray-800'
      }`}
    >
      {/* Card Header */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* Tier Badge */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(job.tier)} text-white text-xs font-bold`}>
                TIER {job.tier}
              </div>
              <span className="text-xs text-gray-400">{getTierLabel(job.tier)}</span>
              
              {/* Pro Badge */}
              {job.budget > 500 && (
                <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded text-xs font-medium">
                  PRO
                </span>
              )}
            </div>

            {/* Job Title */}
            <h3 className="text-xl font-bold mb-2">{job.title}</h3>
            
            {/* Job Description */}
            <p className="text-gray-400 mb-4 line-clamp-2">
              {job.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`p-2 rounded-lg ${isSaved ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              <Bookmark className="h-4 w-4" />
            </button>
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg ${isLiked ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills?.slice(0, 4).map((skill: string, index: number) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
          {job.skills?.length > 4 && (
            <span className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-xs">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">${job.budget?.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Budget</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{job.applicants || 0}</div>
            <div className="text-xs text-gray-400">Applicants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {job.success_rate || Math.floor(Math.random() * 30) + 20}%
            </div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {job.duration || '7d'}
            </div>
            <div className="text-xs text-gray-400">Duration</div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(job.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{job.experience || 'Intermediate'}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{job.views || Math.floor(Math.random() * 100) + 50} views</span>
          </div>
        </div>
      </div>

      {/* Card Footer - Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/30">
        <div className="flex gap-3">
          <button
            onClick={() => onApply(job.id)}
            disabled={!isPro && job.tier === 'S'}
            className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
              !isPro && job.tier === 'S'
                ? 'bg-gray-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90'
            }`}
          >
            <Zap className="h-4 w-4" />
            {!isPro && job.tier === 'S' ? 'PRO Required' : 'Apply Now'}
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-6 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium flex items-center gap-2"
          >
            {showDetails ? 'Less' : 'Details'}
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View
          </a>
        </div>

        {/* Pro Restriction Notice */}
        {!isPro && job.tier === 'S' && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <Lock className="h-4 w-4" />
              <span>Premium leads require PRO subscription</span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-6 py-4 border-t border-gray-800 bg-black/20"
        >
          <div className="grid grid-cols-2 gap-6">
            {/* Requirements */}
            <div>
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Requirements
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {job.requirements?.map((req: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Client Info */}
            <div>
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                Client Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < (job.client_rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                      />
                    ))}
                    <span className="ml-2">{job.client_rating || 4.5}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Jobs Posted:</span>
                  <span className="font-medium">{job.client_jobs || 12}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hire Rate:</span>
                  <span className="font-medium text-green-400">{job.client_hire_rate || 85}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since:</span>
                  <span className="font-medium">2022</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm">High Demand Skill</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">Active Communication</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span className="text-sm">Flexible Timeline</span>
                </div>
              </div>
              
              <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                <Share2 className="h-3 w-3" />
                Share Lead
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
