'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Globe, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  Search,
  Users,
  DollarSign,
  TrendingUp,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface MapPoint {
  id: string
  lat: number
  lng: number
  city: string
  country: string
  leads: number
  revenue: number
  topSkill: string
  density: 'low' | 'medium' | 'high'
}

const mockMapPoints: MapPoint[] = [
  { id: '1', lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA', leads: 42, revenue: 125000, topSkill: 'video-editing', density: 'high' },
  { id: '2', lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK', leads: 38, revenue: 98000, topSkill: 'web-dev', density: 'high' },
  { id: '3', lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA', leads: 35, revenue: 145000, topSkill: 'ui-ux', density: 'high' },
  { id: '4', lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany', leads: 28, revenue: 75000, topSkill: 'content', density: 'medium' },
  { id: '5', lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan', leads: 25, revenue: 68000, topSkill: 'graphic-design', density: 'medium' },
  { id: '6', lat: 43.6532, lng: -79.3832, city: 'Toronto', country: 'Canada', leads: 22, revenue: 55000, topSkill: 'video-editing', density: 'medium' },
  { id: '7', lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia', leads: 18, revenue: 45000, topSkill: 'web-dev', density: 'low' },
  { id: '8', lat: 19.4326, lng: -99.1332, city: 'Mexico City', country: 'Mexico', leads: 15, revenue: 35000, topSkill: 'content', density: 'low' },
  { id: '9', lat: -23.5505, lng: -46.6333, city: 'São Paulo', country: 'Brazil', leads: 12, revenue: 28000, topSkill: 'graphic-design', density: 'low' },
  { id: '10', lat: 25.2048, lng: 55.2708, city: 'Dubai', country: 'UAE', leads: 8, revenue: 65000, topSkill: 'video-editing', density: 'low' },
]

interface GlobalMapProps {
  leads?: any[]
}

export default function GlobalMap({ leads }: GlobalMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null)
  const [zoom, setZoom] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState('all')
  const [selectedDensity, setSelectedDensity] = useState('all')
  const [mapStats, setMapStats] = useState({
    totalLeads: 0,
    totalRevenue: 0,
    activeCities: 0,
    avgBudget: 0
  })

  const skills = ['all', 'video-editing', 'web-dev', 'ui-ux', 'content', 'graphic-design']
  const densities = ['all', 'high', 'medium', 'low']

  useEffect(() => {
    // Calculate stats from map points
    const stats = {
      totalLeads: mockMapPoints.reduce((sum, point) => sum + point.leads, 0),
      totalRevenue: mockMapPoints.reduce((sum, point) => sum + point.revenue, 0),
      activeCities: mockMapPoints.length,
      avgBudget: Math.round(mockMapPoints.reduce((sum, point) => sum + point.revenue, 0) / mockMapPoints.reduce((sum, point) => sum + point.leads, 1))
    }
    setMapStats(stats)
  }, [])

  const filteredPoints = mockMapPoints.filter(point => {
    if (searchQuery && !point.city.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !point.country.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedSkill !== 'all' && point.topSkill !== selectedSkill) {
      return false
    }
    if (selectedDensity !== 'all' && point.density !== selectedDensity) {
      return false
    }
    return true
  })

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'high': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getDensitySize = (density: string) => {
    switch (density) {
      case 'high': return 'w-8 h-8'
      case 'medium': return 'w-6 h-6'
      case 'low': return 'w-4 h-4'
      default: return 'w-5 h-5'
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))

  const handlePointClick = (point: MapPoint) => {
    setSelectedPoint(selectedPoint?.id === point.id ? null : point)
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900/50 to-black/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur"></div>
              <div className="relative bg-blue-500/10 p-2 rounded-full">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold">Global Lead Heatmap</h2>
              <p className="text-sm text-gray-400">Real-time lead distribution worldwide</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                showFilters ? 'bg-purple-600/20 text-purple-400' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Active Cities</span>
            </div>
            <div className="text-2xl font-bold mt-1">{mapStats.activeCities}</div>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">Total Leads</span>
            </div>
            <div className="text-2xl font-bold mt-1">{mapStats.totalLeads}</div>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Revenue</span>
            </div>
            <div className="text-2xl font-bold mt-1">${mapStats.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Avg. Budget</span>
            </div>
            <div className="text-2xl font-bold mt-1">${mapStats.avgBudget}</div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-b border-gray-800 bg-gray-900/30 p-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search Location</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search city or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Skill Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Skill</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {skills.map(skill => (
                  <option key={skill} value={skill}>
                    {skill === 'all' ? 'All Skills' : skill}
                  </option>
                ))}
              </select>
            </div>

            {/* Density Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Lead Density</label>
              <div className="flex gap-2">
                {densities.map(density => (
                  <button
                    key={density}
                    onClick={() => setSelectedDensity(density)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      selectedDensity === density
                        ? density === 'high' ? 'bg-green-600 text-white' :
                          density === 'medium' ? 'bg-yellow-600 text-white' :
                          density === 'low' ? 'bg-red-600 text-white' :
                          'bg-gray-700 text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {density === 'all' ? 'All' : density}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Map Container */}
      <div className="relative p-4">
        {/* Zoom Controls */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-lg hover:bg-gray-800"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-lg hover:bg-gray-800"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 z-10 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2">Density Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs">High (30+ leads)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs">Medium (15-30 leads)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs">Low (1-15 leads)</span>
            </div>
          </div>
        </div>

        {/* Map Visualization */}
        <div className="relative h-[400px] bg-gradient-to-br from-gray-950 to-black rounded-xl border border-gray-800 overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #4f46e5 1px, transparent 1px),
                linear-gradient(to bottom, #4f46e5 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Map Points */}
          {filteredPoints.map((point) => (
            <motion.button
              key={point.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
              onClick={() => handlePointClick(point)}
              className={`absolute rounded-full ${getDensityColor(point.density)} ${getDensitySize(point.density)} flex items-center justify-center transition-all ${
                selectedPoint?.id === point.id ? 'ring-4 ring-offset-2 ring-offset-gray-900 ring-white' : ''
              }`}
              style={{
                left: `${((point.lng + 180) / 360) * 100}%`,
                top: `${((90 - point.lat) / 180) * 100}%`,
                transform: `scale(${zoom})`,
              }}
            >
              <MapPin className="h-3 w-3 text-white" />
              
              {/* Pulse Animation for High Density */}
              {point.density === 'high' && (
                <div className="absolute inset-0 rounded-full bg-current animate-ping opacity-20"></div>
              )}
            </motion.button>
          ))}

          {/* Selected Point Details */}
          {selectedPoint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 right-6 z-20 bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-xl p-4 max-w-xs"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{selectedPoint.city}</h3>
                  <p className="text-gray-400">{selectedPoint.country}</p>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Leads</span>
                  <span className="font-bold text-green-400">{selectedPoint.leads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Revenue Generated</span>
                  <span className="font-bold text-yellow-400">${selectedPoint.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Top Skill</span>
                  <span className="font-bold text-purple-400">{selectedPoint.topSkill}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Lead Density</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedPoint.density === 'high' ? 'bg-green-500/20 text-green-400' :
                    selectedPoint.density === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedPoint.density.toUpperCase()}
                  </span>
                </div>
              </div>

              <button className="w-full mt-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 rounded-lg font-medium">
                View Leads from {selectedPoint.city}
              </button>
            </motion.div>
          )}

          {/* No Results */}
          {filteredPoints.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-500">No locations match your filters</p>
                <p className="text-sm text-gray-600 mt-2">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>

        {/* Points List */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {filteredPoints.slice(0, 5).map(point => (
            <div
              key={point.id}
              onClick={() => handlePointClick(point)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedPoint?.id === point.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-800 bg-gray-900/50 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="font-medium">{point.city}</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${getDensityColor(point.density)}`}></div>
              </div>
              <div className="mt-2 text-sm text-gray-400">{point.country}</div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">{point.leads} leads</div>
                <div className="text-xs font-medium text-yellow-400">
                  ${point.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
