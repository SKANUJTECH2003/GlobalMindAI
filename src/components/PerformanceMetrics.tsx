import React, { useEffect, useState } from 'react';
import { logger } from '../services/logger';
import './PerformanceMetrics.css';

interface MetricsData {
  avgResponseTime: number;
  totalTokensGenerated: number;
  avgTokensPerSecond: number;
  sessionsCount: number;
  messagesCount: number;
  chatDuration: number;
  memoryUsage: number;
  uptime: number;
}

// Global metrics storage
let globalMetrics = {
  responseTimes: [] as number[],
  totalTokens: 0,
  startTime: Date.now(),
  sessionStartTime: Date.now(),
};

/**
 * Track API response time
 */
export function trackResponseTime(timeMs: number) {
  globalMetrics.responseTimes.push(timeMs);
  // Keep only last 100 measurements
  if (globalMetrics.responseTimes.length > 100) {
    globalMetrics.responseTimes.shift();
  }
  logger.debug('Response tracked', { timeMs });
}

/**
 * Track tokens generated
 */
export function trackTokensGenerated(count: number) {
  globalMetrics.totalTokens += count;
  logger.debug('Tokens tracked', { count, total: globalMetrics.totalTokens });
}

/**
 * Reset metrics
 */
export function resetMetrics() {
  globalMetrics = {
    responseTimes: [],
    totalTokens: 0,
    startTime: Date.now(),
    sessionStartTime: Date.now(),
  };
}

/**
 * Get current metrics
 */
export function getMetrics(): MetricsData {
  const avgResponseTime =
    globalMetrics.responseTimes.length > 0
      ? globalMetrics.responseTimes.reduce((a, b) => a + b, 0) /
        globalMetrics.responseTimes.length
      : 0;

  const totalResponseTime = globalMetrics.responseTimes.reduce(
    (a, b) => a + b,
    0
  );
  const avgTokensPerSecond =
    totalResponseTime > 0 ? (globalMetrics.totalTokens / totalResponseTime) * 1000 : 0;

  const uptime = Date.now() - globalMetrics.startTime;
  const chatDuration = Date.now() - globalMetrics.sessionStartTime;

  // Get session data from localStorage
  let sessionsCount = 0;
  let messagesCount = 0;
  try {
    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    sessionsCount = sessions.length;
    messagesCount = sessions.reduce(
      (total: number, session: any) => total + (session.messages?.length || 0),
      0
    );
  } catch (error) {
    logger.debug('Could not read session data for metrics');
  }

  // Get memory usage (with fallback for browsers without memory API)
  let memoryUsage = 0;
  try {
    const perf = performance as any;
    if (perf.memory?.usedJSHeapSize) {
      memoryUsage = perf.memory.usedJSHeapSize / 1024 / 1024; // in MB
    }
  } catch (error) {
    logger.debug('Memory API not available');
  }

  return {
    avgResponseTime,
    totalTokensGenerated: globalMetrics.totalTokens,
    avgTokensPerSecond,
    sessionsCount,
    messagesCount,
    chatDuration,
    memoryUsage,
    uptime,
  };
}

/**
 * Performance Metrics Dashboard Component
 */
export const PerformanceMetrics: React.FC<{ isOpen?: boolean }> = ({
  isOpen = true,
}) => {
  const [metrics, setMetrics] = useState<MetricsData>(getMetrics());
  const [isExpanded, setIsExpanded] = useState(isOpen);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.round(num).toString();
  };

  if (!isExpanded) {
    return (
      <div className="metrics-collapsed">
        <button
          className="metrics-toggle"
          onClick={() => setIsExpanded(true)}
          title="Show performance metrics"
        >
          📊
        </button>
      </div>
    );
  }

  return (
    <div className="performance-metrics">
      <div className="metrics-header">
        <h4>📊 Performance Metrics</h4>
        <button
          className="metrics-close"
          onClick={() => setIsExpanded(false)}
          title="Hide metrics"
        >
          ✕
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">⚡ Avg Response</span>
          <span className="metric-value">
            {formatTime(metrics.avgResponseTime)}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">🔤 Total Tokens</span>
          <span className="metric-value">
            {formatNumber(metrics.totalTokensGenerated)}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">⚙️ Tokens/Sec</span>
          <span className="metric-value">
            {metrics.avgTokensPerSecond.toFixed(1)}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">💬 Messages</span>
          <span className="metric-value">{metrics.messagesCount}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">📁 Sessions</span>
          <span className="metric-value">{metrics.sessionsCount}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">⏱️ Session Time</span>
          <span className="metric-value">{formatTime(metrics.chatDuration)}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">💾 Memory</span>
          <span className="metric-value">{metrics.memoryUsage.toFixed(1)}MB</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">🕐 Uptime</span>
          <span className="metric-value">{formatTime(metrics.uptime)}</span>
        </div>
      </div>

      <div className="metrics-footer">
        <button
          className="metrics-reset"
          onClick={() => {
            resetMetrics();
            setMetrics(getMetrics());
          }}
        >
          Reset Stats
        </button>
      </div>
    </div>
  );
};
