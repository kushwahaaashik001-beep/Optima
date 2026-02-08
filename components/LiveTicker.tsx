'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Zap,
  Globe
} from 'lucide-react'

interface TickerItem {
  id: string
  type: 'lead' | 'hire' | 'revenue' | 'alert'
  message: string
  location: string
  amount?: number
  skill?: string
  time: string
}

const mockTickerData: TickerItem[] = [
  { id: '1', type: 'lead', message: 'Video Editing project found', location: 'New York', amount: 2500, skill: 'video-editing', time: '10s ago' },
  { id: '2', type: 'hire', message: 'Web Developer hired', location: 'London', amount: 5000, skill: 'web-dev', time: '2m ago' },
  { id: '3', type: 'revenue', message: 'Contract signed', location: 'San Francisco', amount: 3200, skill: 'ui-ux', time: '5m ago' },
  { id: '4', type: 'lead', message: 'Content Writer needed', location: 'Berlin', amount: 1800, skill: 'content', time: '8m ago' },
  { id: '5', type: 'alert', message: 'High budget lead detected', location: 'Dubai', amount: 7500, skill: 'video-editing', time: '12m ago' },
  { id: '6', type: 'hire', message: 'Ghostwriting project completed', location: 'Toronto', amount: 2200, skill: 'writing', time: '15m ago' },
]

export default function LiveTicker({ isPro = false }: { isPro?: boolean }) {
  const [items, setItems] = useState<TickerItem[]>(mockTickerData)
  const [isPaused, setIsPaused] = useState(false)

  // Simulate live updates
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      const newItem: TickerItem = {
        id: Date.now().toString(),
        type: 'lead',
        message: 'New lead detected',
        location: ['Tokyo', 'Sydney', 'Paris', 'Mumbai'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 5000) + 1000,
        skill: ['video-editing', 'web-dev', 'ui-ux', 'content'][Math.floor(Math.random() * 4)],
        time: 'Just now'
      }
      
      setItems(prev => [newItem, ...prev.slice(0, 5)])
    }, 15000) // Every 15 seconds

    return () => clearInterval(interval)
  }, [isPaused])

  const getTypeIcon = (type: TickerItem['type']) => {
    switch (type) {
      case 'lead': return <Zap className="h-3 w-3 text-green-400" />
      case 'hire': return <TrendingUp className="h-3 w-3 text-blue-400" />
      case 'revenue': return <DollarSign className="h-3 w-3 text-yellow-400" />
      case 'alert': return <Clock className="h-3 w-3 text-red-400" />
      default: return <Globe className="h-3 w-3 text-gray-400" />
    }
  }

  const getTypeColor = (type: TickerItem['type']) => {
    switch (type) {
      case 'lead': return 'bg-green-500/20 text-green-400'
      case 'hire': return 'bg-blue-500/20 text-blue-400'
      case 'revenue': return 'bg-yellow-500/20 text-yellow-400'
      case 'alert': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-800 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute -inset-1 bg-green-500/20 rounded-full blur"></div>
            <div className="relative bg-green-500/10 p-1 rounded-full">
              <Globe className="h-3 w-3 text-green-400" />
            </div>
          </div>
          <span className="text-sm font-medium">Global Live Feed</span>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">LIVE</span>
          </div>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-xs text-gray-400 hover:text-white"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Ticker Container */}
      <div className="relative h-10 overflow-hidden">
        <motion.div
          className="flex"
          animate={{
            x: isPaused ? '0%' : ['0%', '-100%']
          }}
          transition={{
            duration: 40,
            repeat: isPaused ? 0 : Infinity,
            ease: "linear"
          }}
        >
          {[...items, ...items].map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex items-center gap-3 px-4 py-2 whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                {getTypeIcon(item.type)}
                <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(item.type)}`}>
                  {item.type.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-sm text-gray-300">{item.location}</span>
              </div>
              
              <span className="text-sm">{item.message}</span>
              
              {item.amount && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-300">
                    ${item.amount.toLocaleString()}
                  </span>
                </div>
              )}
              
              {item.skill && (
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                  {item.skill}
                </span>
              )}
              
              <span className="text-xs text-gray-500">{item.time}</span>

              {isPro && index % 2 === 0 && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded text-xs font-medium">
                  PRO
                </span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-gray-900/50 to-transparent"></div>
        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gray-900/50 to-transparent"></div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800 bg-black/30">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-green-400" />
            <span className="text-gray-400">Leads:</span>
            <span className="font-medium">{items.filter(i => i.type === 'lead').length}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-blue-400" />
            <span className="text-gray-400">Hires:</span>
            <span className="font-medium">{items.filter(i => i.type === 'hire').length}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-yellow-400" />
            <span className="text-gray-400">Revenue:</span>
            <span className="font-medium text-yellow-300">
              ${items.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          Updated: Just now
        </div>
      </div>
    </div>
  )
}
