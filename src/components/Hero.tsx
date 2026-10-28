'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, GitBranch, Globe, ArrowRight, AlertCircle } from 'lucide-react';

interface HeroProps {
  url: string;
  repo: string;
  onUrlChange: (url: string) => void;
  onRepoChange: (repo: string) => void;
  onAudit: () => void;
  isLoading: boolean;
  demoMode: boolean;
  onDemoToggle: () => void;
}

interface HeroState {
  urlError: string | null;
  repoError: string | null;
}

export class Hero extends React.Component<HeroProps, HeroState> {
  constructor(props: HeroProps) {
    super(props);
    this.state = { urlError: null, repoError: null };
  }

  validateUrl(url: string): boolean {
    if (!url) {
      this.setState({ urlError: 'URL is required' });
      return false;
    }
    try {
      new URL(url);
      this.setState({ urlError: null });
      return true;
    } catch {
      this.setState({ urlError: 'Please enter a valid URL' });
      return false;
    }
  }

  validateRepo(repo: string): boolean {
    if (!repo) {
      this.setState({ repoError: 'Repository is required' });
      return false;
    }
    if (!repo.includes('/')) {
      this.setState({ repoError: 'Use format: owner/repo' });
      return false;
    }
    this.setState({ repoError: null });
    return true;
  }

  handleSubmit = () => {
    const { url, repo, onAudit, demoMode } = this.props;
    
    if (demoMode) {
      onAudit();
      return;
    }

    const urlValid = this.validateUrl(url);
    const repoValid = this.validateRepo(repo);
    
    if (urlValid && repoValid) {
      onAudit();
    }
  };

  loadExample = () => {
    const { onUrlChange, onRepoChange } = this.props;
    onUrlChange('https://advcode118.github.io/fixit-demo-target/');
    onRepoChange('advcode118/fixit-demo-target');
    this.setState({ urlError: null, repoError: null });
  };

  render() {
    const { url, repo, onUrlChange, onRepoChange, isLoading, demoMode, onDemoToggle } = this.props;
    const { urlError, repoError } = this.state;

    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700 mb-6"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-zinc-300">AI-Powered Accessibility Auditor</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Fix
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">It</span>
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Audit any website for accessibility and SEO issues. Get AI-powered fixes
              and open a pull request automatically.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={onDemoToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  demoMode
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <Zap className="w-4 h-4" />
                Demo Mode {demoMode ? 'On' : 'Off'}
              </button>
            </div>

            <div className="relative">
              <div className="flex flex-col md:flex-row gap-4 p-2 rounded-2xl bg-zinc-800/30 border border-zinc-700/50 backdrop-blur-sm">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Globe className="w-5 h-5 text-zinc-500" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      onUrlChange(e.target.value);
                      this.setState({ urlError: null });
                    }}
                    placeholder="https://example.com"
                    disabled={demoMode}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-900 border text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                      urlError 
                        ? 'border-red-500/50 focus:ring-red-500/30' 
                        : 'border-zinc-700 focus:ring-blue-500/30 focus:border-blue-500/50'
                    } ${demoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {urlError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-400 text-xs"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {urlError}
                    </motion.div>
                  )}
                </div>

                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <GitBranch className="w-5 h-5 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => {
                      onRepoChange(e.target.value);
                      this.setState({ repoError: null });
                    }}
                    placeholder="owner/repository"
                    disabled={demoMode}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-900 border text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                      repoError 
                        ? 'border-red-500/50 focus:ring-red-500/30' 
                        : 'border-zinc-700 focus:ring-blue-500/30 focus:border-blue-500/50'
                    } ${demoMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {repoError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-400 text-xs"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {repoError}
                    </motion.div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleSubmit}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Auditing...
                    </>
                  ) : (
                    <>
                      Start Audit
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 mt-8"
            >
              <span className="text-sm text-zinc-500">Try it with:</span>
              <button
                onClick={this.loadExample}
                disabled={demoMode}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors ${
                  demoMode ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="font-mono text-xs">advcode118/fixit-demo-target</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }
}

export default Hero;
