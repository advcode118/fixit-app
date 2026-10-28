'use client';

import React from 'react';

interface CountUpProps {
  value: number;
  className?: string;
  duration?: number;
}

interface CountUpState {
  display: number;
}

export class CountUp extends React.Component<CountUpProps, CountUpState> {
  private frame = 0;

  constructor(props: CountUpProps) {
    super(props);
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.state = { display: reduce ? props.value : 0 };
  }

  componentDidMount() {
    this.run();
  }

  componentDidUpdate(prev: CountUpProps) {
    if (prev.value !== this.props.value) this.run();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frame);
  }

  run() {
    cancelAnimationFrame(this.frame);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      this.setState({ display: this.props.value });
      return;
    }

    const from = 0;
    const to = this.props.value;
    const duration = this.props.duration ?? 1100;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      this.setState({ display: Math.round(from + (to - from) * eased) });
      if (t < 1) this.frame = requestAnimationFrame(tick);
    };

    this.frame = requestAnimationFrame(tick);
  }

  render() {
    return <span className={this.props.className}>{this.state.display}</span>;
  }
}

interface FeedScrollerProps {
  children: React.ReactNode;
  className?: string;
  watch: number;
}

export class FeedScroller extends React.Component<FeedScrollerProps> {
  private ref = React.createRef<HTMLDivElement>();

  componentDidUpdate(prev: FeedScrollerProps) {
    if (prev.watch !== this.props.watch && this.ref.current) {
      this.ref.current.scrollTop = this.ref.current.scrollHeight;
    }
  }

  render() {
    return (
      <div ref={this.ref} className={this.props.className} aria-live="polite">
        {this.props.children}
      </div>
    );
  }
}
