"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Target,
  BarChart3,
  ChevronRight,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Lead } from '@/app/hooks/useLeads';

interface LeadStatusTrackerProps {
  leads: Lead[];
}

// Define status type
type StatusType = 'new' | 'contacted' | 'interview' | 'accepted' | 'rejected';

// Status configuration with proper typing
const STATUS_CONFIG: Record<StatusType, {
  bg: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  new: { 
    bg: 'bg-blue-500', 
    text: 'text-blue-400', 
    icon: Clock 
  },
  contacted: { 
    bg: 'bg-purple-500', 
    text: 'text-purple-400', 
    icon: Users 
  },
  interview: { 
    bg: 'bg-amber-500', 
    text: 'text-amber-400', 
    icon: Target 
  },
  accepted: { 
    bg: 'bg-green-500', 
    text: 'text-green-400', 
    icon: CheckCircle 
  },
  rejected: { 
    bg: 'bg-red-500', 
    text: 'text-red-400', 
    icon: XCircle 
  },
};

const STATUS_ORDER: StatusType[] = ['new', 'contacted', 'interview', 'accepted', 'rejected'];

export default function LeadStatusTracker({ leads }: LeadStatusTrackerProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeStatus, setActiveStatus] = useState<StatusType | null>(null);
  const [conversionRate, setConversionRate] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [trendData, setTrendData] = useState<number[]>([0, 0, 0, 0, 0]);

  // Calculate lead statistics
  useEffect(() => {
    const now = new Date();
    const filteredLeads = leads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      const daysDiff = (now.getTime() - leadDate.getTime()) / (1000 * 3600 * 24);
      
      switch (timeRange) {
        case '7d': return daysDiff <= 7;
        case '30d': return daysDiff <= 30;
        case '90d': return daysDiff <= 90;
        default: return true;
      }
    });

    // Calculate status counts
    const statusCounts: Record<StatusType, number> = {
      new: 0,
      contacted: 0,
      interview: 0,
      accepted: 0,
      rejected: 0
    };
    
    const statusDurations: Record<StatusType, number[]> = {
      new: [],
      contacted: [],
      interview: [],
      accepted: [],
      rejected: []
    };

    filteredLeads.forEach(lead => {
      const status = lead.status as StatusType;
      statusCounts[status]++;
      
      // Calculate time to move to next status
      if (lead.updated_at !== lead.created_at) {
        const created = new Date(lead.created_at);
        const updated = new Date(lead.updated_at);
        const duration = (updated.getTime() - created.getTime()) / (1000 * 3600 * 24);
        statusDurations[status].push(duration);
      }
    });

    // Calculate conversion rate (new → contacted → interview → accepted)
    const newLeads = statusCounts.new || 0;
    const contactedLeads = statusCounts.contacted || 0;
    const interviewLeads = statusCounts.interview || 0;
    const acceptedLeads = statusCounts.accepted || 0;

    const totalProgression = contactedLeads + interviewLeads + acceptedLeads;
    const totalLeads = filteredLeads.length;
    
    setConversionRate(totalLeads > 0 ? Math.round((acceptedLeads / totalLeads) * 100) : 0);

    // Calculate average response time
    const contactedDurations = statusDurations.contacted || [];
    const avgDuration = contactedDurations.length > 0
      ? contactedDurations.reduce((a, b) => a + b, 0) / contactedDurations.length
      : 0;
    setAvgResponseTime(Math.round(avgDuration * 10) / 10);

    // Prepare trend data
    const trend = STATUS_ORDER.map(status => {
      const count = statusCounts[status] || 0;
      return totalLeads > 0 ? (count / totalLeads) * 100 : 0;
    });
    setTrendData(trend);

  }, [leads, timeRange]);

  // Get status counts
  const getStatusCounts = () => {
    const counts: Record<StatusType, number> = {
      new: 0,
      contacted: 0,
      interview: 0,
      accepted: 0,
      rejected: 0
    };
    
    STATUS_ORDER.forEach(status => {
      counts[status] = leads.filter(lead => lead.status === status).length;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();
  const totalLeads = leads.length;

  // Get performance metrics
  const getPerformanceMetrics = () => {
    const contacted = statusCounts.contacted || 0;
    const interviews = statusCounts.interview || 0;
    const newLeads = statusCounts.new || 0;

    return {
      contactRate: newLeads > 0 ? Math.round((contacted / newLeads) * 100) : 0,
      interviewRate: contacted > 0 ? Math.round((interviews / contacted) * 100) : 0,
      successRate: conversionRate,
      avgTime: avgResponseTime
    };
  };

  const metrics = getPerformanceMetrics();

  // Export data
  const handleExport = () => {
    const csv = [
      ['Status', 'Count', 'Percentage'],
      ...STATUS_ORDER.map(status => [
        status.charAt(0).toUpperCase() + status.slice(1),
        statusCounts[status],
        totalLeads > 0 ? `${Math.round((statusCounts[status] / totalLeads) * 100)}%` : '0%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-status-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Helper function to get status config safely
  const getStatusConfig = (status: string) => {
    const validStatus = status as StatusType;
    return STATUS_CONFIG[validStatus] || STATUS_CONFIG.new;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Lead Status Tracker</h3>
          </div>
          <p className="text-gray-400">
            Track your application progress in real-time
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {STATUS_ORDER.map((status: StatusType, index) => {
          const statusConfig = getStatusConfig(status);
          const Icon = statusConfig.icon;
          const count = statusCounts[status] || 0;
          const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
          const isActive = activeStatus === status || (!activeStatus && index === 0);

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveStatus(isActive ? null : status)}
              className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700'
                  : 'bg-gray-800/30 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${statusConfig.bg} bg-opacity-20 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${statusConfig.text}`} />
                </div>
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  {status}
                </span>
              </div>

              <div className="mb-2">
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-sm text-gray-400">
                  {Math.round(percentage)}% of total
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className={`h-full rounded-full ${statusConfig.bg}`}
                />
              </div>

              {/* Trend indicator */}
              {index > 0 && (
                <div className="absolute top-4 right-4">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress Pipeline */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Application Pipeline</h4>
          <div className="text-sm text-gray-400">
            Total: <span className="text-white font-bold">{totalLeads}</span> leads
          </div>
        </div>

        <div className="relative">
          {/* Connection lines */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -translate-y-1/2 z-0" />
          
          <div className="relative flex justify-between z-10">
            {STATUS_ORDER.map((status, index) => {
              const count = statusCounts[status] || 0;
              const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              const statusConfig = getStatusConfig(status);
              const Icon = statusConfig.icon;

              return (
                <div key={status} className="flex flex-col items-center">
                  <div className="relative">
                    {/* Connection dot */}
                    <div
                      className={`w-3 h-3 ${statusConfig.bg} rounded-full absolute -top-1.5 left-1/2 transform -translate-x-1/2`}
                    />
                    
                    {/* Status circle */}
                    <div
                      className={`w-12 h-12 ${statusConfig.bg} bg-opacity-20 border-2 ${statusConfig.bg.replace('bg-', 'border-')} rounded-full flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${statusConfig.text}`} />
                    </div>
                  </div>
                  
                  <div className="mt-3 text-center">
                    <div className="text-lg font-bold text-white">{count}</div>
                    <div className="text-xs text-gray-400 capitalize">{status}</div>
                    <div className="text-xs text-gray-500">{Math.round(percentage)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-gray-800/30 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Contact Rate</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.contactRate}%</div>
          <div className="text-xs text-gray-500 mt-1">
            From new to contacted
          </div>
        </div>

        <div className="p-4 bg-gray-800/30 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Interview Rate</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.interviewRate}%</div>
          <div className="text-xs text-gray-500 mt-1">
            From contacted to interview
          </div>
        </div>

        <div className="p-4 bg-gray-800/30 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Success Rate</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.successRate}%</div>
          <div className="text-xs text-gray-500 mt-1">
            From new to accepted
          </div>
        </div>

        <div className="p-4 bg-gray-800/30 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Avg Response Time</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{metrics.avgTime}d</div>
          <div className="text-xs text-gray-500 mt-1">
            Days to get response
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="p-4 bg-gray-800/30 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-white">Status Distribution Trend</h4>
            <p className="text-sm text-gray-400">Last {timeRange}</p>
          </div>
          <Filter className="w-5 h-5 text-gray-400" />
        </div>

        <div className="h-32 flex items-end space-x-2">
          {trendData.map((value, index) => {
            const status = STATUS_ORDER[index];
            const statusConfig = getStatusConfig(status);
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`w-full ${statusConfig.bg} rounded-t-lg max-h-full`}
                  style={{ height: `${Math.min(value, 100)}%` }}
                />
                <div className="text-xs text-gray-500 mt-2 capitalize">
                  {status.slice(0, 3)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-6">
          {STATUS_ORDER.map((status) => {
            const statusConfig = getStatusConfig(status);
            
            return (
              <div key={status} className="flex items-center space-x-2">
                <div className={`w-3 h-3 ${statusConfig.bg} rounded-full`} />
                <span className="text-sm text-gray-400 capitalize">{status}</span>
                <span className="text-sm text-white font-medium">
                  {statusCounts[status] || 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {activeStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl"
        >
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-white mb-2">
                Recommendations for {activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1)} Leads
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {activeStatus === 'new' && (
                  <>
                    <li>• Follow up within 24 hours for best results</li>
                    <li>• Personalize your initial message with company research</li>
                    <li>• Use AI Pitch Generator for optimized outreach</li>
                  </>
                )}
                {activeStatus === 'contacted' && (
                  <>
                    <li>• Send a follow-up email after 3-5 days</li>
                    <li>• Connect with hiring managers on LinkedIn</li>
                    <li>• Prepare specific questions about the role</li>
                  </>
                )}
                {activeStatus === 'interview' && (
                  <>
                    <li>• Research the company's recent news and projects</li>
                    <li>• Prepare STAR method answers for behavioral questions</li>
                    <li>• Send thank you email within 24 hours</li>
                  </>
                )}
                {activeStatus === 'accepted' && (
                  <>
                    <li>• Negotiate salary and benefits package</li>
                    <li>• Review offer letter carefully</li>
                    <li>• Send professional acceptance email</li>
                  </>
                )}
                {activeStatus === 'rejected' && (
                  <>
                    <li>• Ask for feedback to improve future applications</li>
                    <li>• Keep connections warm for future opportunities</li>
                    <li>• Update your portfolio based on feedback</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
