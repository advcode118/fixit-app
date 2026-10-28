'use client';

import React from 'react';

interface PreviewCompareProps {
  beforeHtml: string;
  afterHtml: string;
  highlightSelector?: string;
  beforeColor: string;
  afterColor: string;
  frameClassName: string;
  chromeClassName: string;
  handleClassName: string;
  height?: number;
}

interface PreviewCompareState {
  position: number;
  dragging: boolean;
  width: number;
}

export class PreviewCompare extends React.Component<PreviewCompareProps, PreviewCompareState> {
  private frameRef = React.createRef<HTMLDivElement>();
  private observer: ResizeObserver | null = null;

  constructor(props: PreviewCompareProps) {
    super(props);
    this.state = { position: 52, dragging: false, width: 720 };
  }

  componentDidMount() {
    this.measure();
    if (this.frameRef.current && typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(() => this.measure());
      this.observer.observe(this.frameRef.current);
    }
  }

  componentWillUnmount() {
    this.observer?.disconnect();
  }

  measure() {
    const width = this.frameRef.current?.clientWidth ?? 720;
    if (width !== this.state.width) this.setState({ width });
  }

  setFromClientX(clientX: number) {
    const rect = this.frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    this.setState({ position: Math.max(8, Math.min(92, next)) });
  }

  onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    this.setState({ dragging: true });
    this.setFromClientX(event.clientX);
  };

  onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!this.state.dragging) return;
    this.setFromClientX(event.clientX);
  };

  onPointerUp = () => {
    this.setState({ dragging: false });
  };

  onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft') {
      this.setState((state) => ({ position: Math.max(8, state.position - 4) }));
    }
    if (event.key === 'ArrowRight') {
      this.setState((state) => ({ position: Math.min(92, state.position + 4) }));
    }
  };

  srcDoc(html: string, outline: string): string {
    const selector = (this.props.highlightSelector || '').replace(/[<>]/g, '');
    const style = selector
      ? `<style>${selector}{outline:3px solid ${outline} !important;outline-offset:2px !important;}</style>`
      : '';
    if (/<html[\s>]/i.test(html)) {
      if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${style}</head>`);
      return html.replace(/<html[^>]*>/i, (match) => `${match}<head>${style}</head>`);
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;font-family:Georgia,serif;}</style>${style}</head><body>${html}</body></html>`;
  }

  render() {
    const { beforeHtml, afterHtml, beforeColor, afterColor, frameClassName, chromeClassName, handleClassName } = this.props;
    const height = this.props.height ?? 420;
    const { position, dragging, width } = this.state;

    return (
      <div className={frameClassName}>
        <div className={`flex items-center justify-between gap-3 px-3 py-2 text-xs ${chromeClassName}`}>
          <span style={{ color: beforeColor }}>Before</span>
          <span>Drag the bar</span>
          <span style={{ color: afterColor }}>After</span>
        </div>
        <div ref={this.frameRef} className="relative overflow-hidden bg-white" style={{ height }}>
          <iframe
            title="Page after fixes"
            sandbox="allow-same-origin"
            srcDoc={this.srcDoc(afterHtml, afterColor)}
            className="absolute inset-0 h-full border-0"
            style={{ width: '100%', pointerEvents: dragging ? 'none' : 'auto' }}
          />
          <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${position}%` }}>
            <iframe
              title="Page before fixes"
              sandbox="allow-same-origin"
              srcDoc={this.srcDoc(beforeHtml, beforeColor)}
              className="absolute inset-y-0 left-0 h-full max-w-none border-0"
              style={{ width, pointerEvents: dragging ? 'none' : 'auto' }}
            />
          </div>
          <button
            type="button"
            aria-label="Before and after"
            role="slider"
            aria-valuemin={8}
            aria-valuemax={92}
            aria-valuenow={Math.round(position)}
            className={`absolute inset-y-0 z-10 w-8 -translate-x-1/2 cursor-col-resize border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 ${handleClassName}`}
            style={{ left: `${position}%` }}
            onPointerDown={this.onPointerDown}
            onPointerMove={this.onPointerMove}
            onPointerUp={this.onPointerUp}
            onKeyDown={this.onKeyDown}
          >
            <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2" style={{ background: afterColor }} />
            <span
              className="absolute top-1/2 left-1/2 h-10 w-6 -translate-x-1/2 -translate-y-1/2"
              style={{ background: afterColor }}
            />
          </button>
        </div>
      </div>
    );
  }
}
