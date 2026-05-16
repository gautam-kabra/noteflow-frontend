"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Lock, Search, Zap, Share2, Tags, Layers } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import Logo from '@/components/Logo';
import { HeroGeometric } from "@/components/ui/shape-landing-hero";

export default function Landing() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-black overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-white to-rose-500 z-[200] origin-left"
        style={{ scaleX }}
      />

      {/* Subtle Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex justify-center">
        <div className="absolute top-[-20%] w-[800px] h-[600px] bg-zinc-800/30 rounded-[100%] blur-[120px] opacity-50 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)', backgroundSize: '64px 64px', opacity: 0.1, maskImage: 'radial-gradient(ellipse 60% 60% at 50% 0%, #000 70%, transparent 100%)' }}></div>
      </div>

      {/* Navigation Bar (Glassmorphism) */}
      <nav className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between px-8 py-10 max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-3 font-bold text-2xl tracking-tight hover:opacity-80 transition-all text-white">
          <Logo className="w-8 h-8" />
          <span>NoteFlow</span>
        </Link>
        <div className="flex items-center gap-8 text-sm font-semibold">
          {isAuthenticated ? (
            <div className="flex items-center gap-8">
              <button
                onClick={logout}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                Log out
              </button>
              <Link href="/dashboard" className="bg-white text-zinc-950 px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-all shadow-2xl active:scale-95 flex items-center gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-white/40 hover:text-white transition-colors">
                Log in
              </Link>
              <Link href="/register" className="bg-white text-zinc-950 px-7 py-2.5 rounded-full hover:bg-zinc-200 transition-all shadow-2xl active:scale-95">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Geometric Hero Section (Background & Main Content) */}
      <HeroGeometric
        title1="Your thoughts,"
        title2="perfectly organized."
      >
        <div className="pt-12"> {/* Spacing to account for the fixed nav */}
          <p className="text-base sm:text-lg md:text-xl text-white/40 mb-12 leading-relaxed font-light tracking-wide px-4 max-w-2xl mx-auto">
            Experience a beautifully designed, secure vault for your ideas. NoteFlow combines advanced encryption with a high-performance workspace to keep your thoughts perfectly organized and always protected.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
            {isAuthenticated ? (
              <Link href="/dashboard" className="w-full sm:w-auto bg-white text-zinc-950 px-10 py-4 rounded-full hover:bg-zinc-200 transition-all font-bold text-lg flex items-center justify-center gap-3 active:scale-95 shadow-xl">
                Return to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="w-full sm:w-auto bg-white text-zinc-950 px-8 py-3.5 rounded-full hover:bg-zinc-200 transition-all font-bold text-base flex items-center justify-center gap-2 active:scale-95">
                  Start writing <ArrowRight className="w-4 h-4" />
                </Link>

              </>
            )}
          </div>
        </div>
      </HeroGeometric>

      {/* Bento Box Features Section */}
      <section className="relative z-10 py-24 px-6 w-full max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 mb-4">Engineered for excellence.</h2>
          <p className="text-zinc-500 max-w-2xl text-lg">Everything you need in a modern application, designed with extreme attention to detail.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]">

          {/* Feature 1 - Large Span */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800/80 rounded-[2rem] p-8 md:p-10 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-100 flex items-center justify-center mb-6 border border-zinc-700/50">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-3 tracking-tight">Blazing Fast Performance</h3>
              <p className="text-zinc-400 leading-relaxed max-w-md">Capture and find your thoughts instantly with zero lag. NoteFlow is built for speed, so you can stay in your flow.</p>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-8 flex flex-col justify-between group hover:bg-zinc-800/50 transition-colors"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-100 flex items-center justify-center mb-6 border border-zinc-700/50">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-3 tracking-tight">Bank-Level Security</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Your ideas are for your eyes only. We use state-of-the-art encryption to keep your personal vault private and secure.</p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-zinc-900 border border-zinc-800/80 rounded-[2rem] p-8 flex flex-col justify-between group hover:bg-zinc-800/50 transition-colors"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-100 flex items-center justify-center mb-6 border border-zinc-700/50">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-3 tracking-tight">Effortless Collaboration</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Share notes with colleagues in just one click. Grant access instantly and work together without boundaries.</p>
            </div>
          </motion.div>

          {/* Feature 4 - Large Span */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 bg-gradient-to-tr from-zinc-900 to-zinc-900/50 border border-zinc-800/80 rounded-[2rem] p-8 md:p-10 flex flex-col justify-between group overflow-hidden relative"
          >
            <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity translate-y-8">
              <Layers className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <div className="flex gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-100 flex items-center justify-center border border-zinc-700/50">
                  <Tags className="w-5 h-5" />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-100 flex items-center justify-center border border-zinc-700/50">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-3 tracking-tight">Total Organization</h3>
              <p className="text-zinc-400 leading-relaxed max-w-md">Keep everything in its place. Use labels, pin your most important notes, and find anything in seconds with our powerful search.</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Project Spotlight (Meet the Developer) */}
      <section className="relative z-10 py-24 px-6 w-full max-w-6xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-zinc-900/20 rounded-[3rem] p-12 backdrop-blur-sm border border-white/5 group hover:border-white/10 transition-all">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Project Spotlight</h2>
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">Lead Developer</span>
                <p className="text-2xl font-semibold text-zinc-100">Kabra Gautam</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-400">Featured Innovation</span>
                <p className="text-xl font-medium text-zinc-300">NoteFlow Vault</p>
                <p className="text-zinc-500 leading-relaxed mt-2 italic text-sm">
                  &ldquo;Provides secondary encryption for individual notes. Content is masked at the API level until verified with a specific password, ensuring sensitive data remains private even if a device is left logged in.&rdquo;
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-6 shrink-0">
            <a
              href="mailto:kabragautam007@gmail.com"
              className="bg-white text-zinc-950 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
            >
              Contact Developer
            </a>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Available for Collaboration
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900/50 py-12 bg-zinc-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white">
            <Logo className="w-6 h-6" /> NoteFlow
          </div>
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            <span className="hover:text-zinc-400 cursor-default transition-colors">FastAPI</span>
            <span className="hover:text-zinc-400 cursor-default transition-colors">Next.js 16</span>
            <span className="hover:text-zinc-400 cursor-default transition-colors">Secure JWT</span>
          </div>
          <p className="text-sm font-medium text-zinc-700">© 2026 NoteFlow. Engineered by Kabra Gautam.</p>
        </div>
      </footer>
    </div>
  );
}
