'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Search, 
  Wrench, 
  FileCode,
  Sparkles
} from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'progress' | 'issue' | 'fix' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  isLoading?: boolean;
}

interface ActivityFeedState {
  expanded: boolean;
}

export class ActivityFeed extends React.Component<ActivityFeedProps, ActivityFeedState> {
  private containerRef: React.RefObject<HTMLDivElement | null>;

  constructor(props: ActivityFeedProps) {
    super(props);
    this.state = { expanded: false };
    this.containerRef = React.createRef();
  }

  componentDidUpdate(prevProps: ActivityFeedProps) {
    if (prevProps.items.length !== this.props.items.length && this.containerRef.current) {
      this.containerRef.current.scrollTop = this.containerRef.current.scrollHeight;
    }
  }

  getIcon(type: ActivityItem['type']) {
    switch (type) {
      case 'progress':
        return <Search className="w-4 h-4 text-blue-400" />;
      case 'issue':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'fix':
        return <Wrench className="w-4 h-4 text-emerald-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <FileCode className="w-4 h-4 text-zinc-400" />;
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  }

  render() {
    const { items, isLoading } = this.props;
    const displayItems = this.state.expanded ? items : items.slice(-8);

    return (
      <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-zinc-300">Agent Activity</span>
          </div>
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-4 h-4 text-blue-400" />
            </motion.div>
          )}
          {items.length > 8 && (
            <button
              onClick={() => this.setState(s => ({ expanded: !s.expanded }))}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {this.state.expanded ? 'Show less' : `Show all (${items.length})`}
            </button>
          )}
        </div>

        <div 
          ref={this.containerRef}
          className="p-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
        >
          <AnimatePresence mode="popLayout">
            {displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: index === displayItems.length - 1 ? 0 : 0,
                }}
                className="flex items-start gap-3 py-2 border-b border-zinc-800/50 last:border-0"
              >
                <div className="mt-0.5 flex-shrink-0">
                  {this.getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 truncate">{item.message}</p>
                </div>
                <span className="text-xs text-zinc-600 flex-shrink-0 font-mono">
                  {this.formatTime(item.timestamp)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && !isLoading && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              Waiting to start audit...
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ActivityFeed;
