'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Eye, EyeOff, Maximize2, X } from 'lucide-react';

interface PreviewSliderProps {
  beforeHtml: string;
  afterHtml: string;
  highlightSelector?: string;
  onClose?: () => void;
}

interface PreviewSliderState {
  sliderPosition: number;
  isDragging: boolean;
  isFullscreen: boolean;
}

export class PreviewSlider extends React.Component<PreviewSliderProps, PreviewSliderState> {
  private containerRef: React.RefObject<HTMLDivElement | null>;

  constructor(props: PreviewSliderProps) {
    super(props);
    this.state = {
      sliderPosition: 50,
      isDragging: false,
      isFullscreen: false,
    };
    this.containerRef = React.createRef();
  }

  handleMouseDown = () => {
    this.setState({ isDragging: true });
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  };

  handleMouseMove = (e: MouseEvent) => {
    if (!this.state.isDragging || !this.containerRef.current) return;
    
    const rect = this.containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(10, Math.min(90, (x / rect.width) * 100));
    this.setState({ sliderPosition: percentage });
  };

  handleMouseUp = () => {
    this.setState({ isDragging: false });
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  createSrcDoc(html: string, isAfter: boolean): string {
    const { highlightSelector } = this.props;
    
    const highlightStyle = highlightSelector ? `
      <style>
        ${highlightSelector} {
          outline: 3px solid ${isAfter ? '#22c55e' : '#ef4444'} !important;
          outline-offset: 2px !important;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      </style>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { box-sizing: border-box; }
            body { 
              margin: 0; 
              padding: 16px;
              font-family: system-ui, -apple-system, sans-serif;
              background: #fff;
            }
          </style>
          ${highlightStyle}
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }

  render() {
    const { beforeHtml, afterHtml, onClose } = this.props;
    const { sliderPosition, isDragging, isFullscreen } = this.state;

    const content = (
      <div 
        ref={this.containerRef}
        className={`relative bg-white rounded-xl overflow-hidden ${
          isFullscreen ? 'fixed inset-4 z-50' : 'w-full'
        }`}
        style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : '400px' }}
      >
        <div className="absolute inset-0 flex items-center justify-between px-4 py-2 bg-zinc-900 z-10" style={{ height: '40px' }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-zinc-400">Before</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-zinc-400">After</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => this.setState(s => ({ isFullscreen: !s.isFullscreen }))}
              className="p-1.5 rounded hover:bg-zinc-800 transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-zinc-500" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            )}
          </div>
        </div>

        <div className="relative w-full h-full pt-10">
          <div className="absolute inset-0 top-10">
            <iframe
              srcDoc={this.createSrcDoc(beforeHtml, false)}
              className="w-full h-full border-0"
              title="Before preview"
              sandbox="allow-same-origin"
            />
          </div>

          <div 
            className="absolute inset-0 top-10 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <iframe
              srcDoc={this.createSrcDoc(afterHtml, true)}
              className="h-full border-0"
              style={{ width: `${100 / (sliderPosition / 100)}%` }}
              title="After preview"
              sandbox="allow-same-origin"
            />
          </div>

          <motion.div
            className={`absolute top-10 bottom-0 w-1 bg-blue-500 cursor-col-resize z-20 ${
              isDragging ? 'bg-blue-400' : ''
            }`}
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            onMouseDown={this.handleMouseDown}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <GripVertical className="w-4 h-4 text-white" />
            </div>

            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                Before
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">
                After
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    );

    if (isFullscreen) {
      return (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={() => this.setState({ isFullscreen: false })} />
          {content}
        </>
      );
    }

    return content;
  }
}

export default PreviewSlider;
