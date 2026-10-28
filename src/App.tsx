import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  BookOpen,
  Music,
  HelpCircle,
  Play,
  Pause,
  X,
  Lock,
  Stamp,
} from 'lucide-react';
import { MANUSCRIPT_DOORS, SPECIAL_SECTIONS } from './manuscriptData';

// Generative calm meditative piano soundscape using Web Audio API
class AmbientSoundscape {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private timer: number | null = null;

  start() {
    if (this.isRunning) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.28, this.ctx.currentTime + 2.0);
      this.masterGain.connect(this.ctx.destination);
      this.isRunning = true;
      this.playChords();
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  private playTone(freq: number, time: number, duration: number, vol = 0.12) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, time);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(vol, time + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playChords() {
    if (!this.isRunning || !this.ctx) return;
    const chords = [
      [155.56, 185.0, 233.08, 277.18, 370.0],
      [138.59, 185.0, 220.0, 277.18, 329.63],
      [146.83, 185.0, 220.0, 293.66, 370.0],
      [164.81, 196.0, 246.94, 293.66, 392.0],
    ];

    let chordIdx = 0;
    const step = () => {
      if (!this.isRunning || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = chords[chordIdx % chords.length];
      chord.forEach((freq, i) => {
        this.playTone(freq, now + i * 0.45, 5.5, 0.11);
      });
      chordIdx++;
      this.timer = window.setTimeout(step, 4200);
    };
    step();
  }

  stop() {
    if (!this.isRunning || !this.ctx || !this.masterGain) return;
    try {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
      if (this.timer) clearTimeout(this.timer);
      setTimeout(() => {
        if (this.ctx && this.ctx.state !== 'closed') {
          this.ctx.close();
        }
        this.ctx = null;
        this.masterGain = null;
        this.isRunning = false;
      }, 1300);
    } catch {
      this.isRunning = false;
    }
  }
}

interface AudioVinylCardProps {
  interludeBadge: string;
  trackTitle: string;
  artist: string;
  songQuote?: string;
  youtubeId: string;
}

function AudioVinylCard({
  interludeBadge,
  trackTitle,
  artist,
  youtubeId,
}: AudioVinylCardProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <aside className="interlude-vinyl-card border-[1.8px] border-[#410407] bg-[#F6ECE8] shadow-[6px_6px_0px_#410407] rounded-[28px] p-5 sm:p-7 my-8 relative overflow-hidden transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-[#410407]/20">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          {/* Animated Vinyl Disc */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A1817] border-2 border-[#410407] flex items-center justify-center relative shadow-md shrink-0 ${
              isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
            }`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-neutral-700/60 flex items-center justify-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#851A26] border border-[#FAF6F0] flex items-center justify-center shadow-inner">
                <div className="w-2 h-2 rounded-full bg-[#410407]" />
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#851A26] text-[#FAF6F0] text-[11px] sm:text-xs font-bold mb-1 shadow-sm">
              {interludeBadge}
            </span>
            <h4 className="text-lg sm:text-2xl font-bold text-[#410407] font-['Scheherazade_New',serif] m-0">
              {trackTitle}
            </h4>
            <span className="text-xs sm:text-sm font-semibold text-[#851A26]">{artist}</span>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-[#851A26] hover:bg-[#68141F] text-[#FAF6F0] border-[1.5px] border-[#410407] text-xs sm:text-sm font-bold px-4 py-2 rounded-full cursor-pointer transition-all duration-200 shadow-[3px_3px_0px_#410407] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-2 outline-none shrink-0"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>إيقاف المشغل</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>استمع إلى الأغنية</span>
            </>
          )}
        </button>
      </div>

      {/* Embedded YouTube Audio Player */}
      {isPlaying && (
        <div className="my-3.5 rounded-xl overflow-hidden border-[1.5px] border-[#410407] shadow-inner bg-black">
          <iframe
            className="w-full h-[180px] sm:h-[220px]"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1`}
            title={trackTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </aside>
  );
}

interface EnvelopeCardProps {
  letterTitle: string;
  letterContent: string;
}

function EnvelopeCard({ letterTitle, letterContent }: EnvelopeCardProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (cardRef.current) observer.unobserve(cardRef.current);
        }
      },
      { threshold: 0.15 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      className={`envelope-card bg-[#FFFDF9] border-[1.5px] border-dashed border-[#851A26]/50 rounded-[24px] p-6 sm:p-8 my-6 relative shadow-[4px_4px_0px_#410407] overflow-hidden transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Top Envelope Flap Accent & Heritage Postage Stamp Header */}
      <div className="flex items-start justify-between pb-3 mb-4 border-b border-[#410407]/15 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F6ECE8] text-[#851A26] border border-[#AE9189]/40 flex items-center gap-1.5 shadow-xs">
            <span>✉</span>
            <span>رسالة خاصة</span>
          </span>
          <h4 className="text-lg sm:text-xl font-bold text-[#410407] font-['Scheherazade_New',serif] m-0">
            {letterTitle}
          </h4>
        </div>

        {/* Vintage Heritage Postage Stamp & Wavy Cancellation Postmark (ختم وطابع بريدي تراثي مميز) */}
        <div className="flex items-center gap-2.5 shrink-0 select-none">
          {/* Vintage Circular Postmark Stamp (ختم بريدي دائري مزخرف) */}
          <div className="relative w-12 h-12 rounded-full border-2 border-dashed border-[#851A26] bg-[#F6ECE8] flex flex-col items-center justify-center rotate-[-12deg] shadow-xs shrink-0">
            <div className="w-10 h-10 rounded-full border border-dotted border-[#851A26]/60 flex flex-col items-center justify-center leading-none">
              <span className="text-[7px] font-bold text-[#851A26] uppercase tracking-tighter">POSTAL</span>
              <span className="text-[10px] font-bold text-[#410407] font-serif my-0.5">04.11</span>
              <span className="text-[7px] text-[#851A26] opacity-80">✦ · ✦</span>
            </div>
            {/* Wavy Postmark Cancellation Lines */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-[#851A26]/40 font-mono text-[9px] tracking-tighter pointer-events-none">
              ≈≈≈
            </div>
          </div>

          {/* Postage Stamp Badge (طابع بريد رسمي مع أيقونة الختم) */}
          <div className="rotate-[3deg] border-2 border-dashed border-[#851A26] bg-[#FAF6F0] px-3 py-1.5 rounded-lg shadow-xs flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#851A26] tracking-wider flex items-center gap-1">
              <Stamp className="w-3.5 h-3.5 text-[#851A26]" />
              <span>طابع بريد</span>
            </span>
            <span className="text-xs font-bold text-[#410407] font-serif">✦ ٤ نوفمبر ✦</span>
          </div>
        </div>
      </div>

      {/* Letter Body */}
      <p className="m-0 text-[#2F1216] text-base sm:text-lg leading-[2.3] italic text-justify font-['Scheherazade_New',serif]">
        «{letterContent}»
      </p>
    </article>
  );
}

// Door Content Renderer Component for Unabridged Prose
function DoorContent({ id }: { id: string }) {
  const door = MANUSCRIPT_DOORS[id];
  if (!door) return null;

  return (
    <div id={id} className="door-prose-container my-8 pt-6 border-t border-[#410407]/15 scroll-mt-24">
      <h4 className="text-xl md:text-2xl font-bold text-[#410407] mb-4 font-['Scheherazade_New',serif]">
        {door.title}
      </h4>
      <div className="space-y-4 text-justify">
        {door.paragraphs.map((p, idx) => {
          // Detect quotes or highlighted dialogue
          const isQuote = p.startsWith('«') || (p.startsWith('(') && p.endsWith(')'));
          const isHighlight = p.includes('المعنى الكامل للصورة') || p.includes('لَمْ أَكُنْ عَابِراً') || p.includes('ثلاثةٍ وعشرين عاماً');

          if (isQuote) {
            return (
              <blockquote key={idx} className="my-4 p-4 bg-[#1A1817] border-r-4 border-[#851A26] text-[#EDE7DF] italic font-medium leading-relaxed rounded-l-xl shadow-sm">
                {p}
              </blockquote>
            );
          }

          if (isHighlight) {
            return (
              <p key={idx} className="p-4 rounded-xl bg-[#F6ECE8] border border-[#851A26]/20 font-bold text-[#410407] leading-relaxed">
                {p}
              </p>
            );
          }

          return (
            <p key={idx} className="leading-[2.2] text-[#2F1216]">
              {p}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// Tactile Interactive Accordion Card Component
interface AccordionCardProps {
  id: string;
  title: string;
  badge?: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionCard({
  id,
  title,
  badge,
  subtitle,
  isOpen,
  onToggle,
  children,
}: AccordionCardProps) {
  return (
    <div
      id={id}
      className="monograph-card bg-[#FFFDF9] border-[1.8px] border-[#410407] shadow-[6px_6px_0px_#410407] rounded-[28px] mb-8 overflow-hidden transition-all duration-300"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-6 sm:p-8 flex items-center justify-between gap-4 text-right cursor-pointer bg-[#FFFDF9] hover:bg-[#F6ECE8]/60 transition-colors border-none outline-none select-none"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col items-start text-right gap-1.5 flex-1 min-w-0">
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#851A26] text-[#FAF6F0] text-xs font-bold shadow-sm">
              <span>✦</span>
              <span>{badge}</span>
            </span>
          )}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#410407] font-['Scheherazade_New',serif] leading-snug m-0">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm sm:text-base text-[#851A26] font-semibold m-0">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`p-2.5 rounded-full border border-[#410407]/30 transition-all duration-300 shrink-0 ${
            isOpen
              ? 'bg-[#851A26] text-[#FAF6F0] border-[#410407]'
              : 'bg-[#FAF6F0] text-[#851A26] hover:bg-[#E6D6C5]'
          }`}
        >
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-6 sm:px-10 pb-8 pt-4 border-t border-[#410407]/15 animate-[fadeIn_0.35s_ease-out]">
          {children}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('sanctuary_unlocked') === 'true';
  });
  const [showGate, setShowGate] = useState<boolean>(false);
  const [passphrase, setPassphrase] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [isUnlockingAnimation, setIsUnlockingAnimation] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('monograph_font_size');
    return saved ? parseInt(saved, 10) : 21;
  });

  // Accordion state management (all collapsed by default)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const handleReturnToGate = () => {
    localStorage.removeItem('sanctuary_unlocked');
    setUnlocked(false);
    setShowGate(false);
    setPassphrase('');
    setExpandedSections({});
    if (isAudioPlaying) {
      soundscapeRef.current?.stop();
      setIsAudioPlaying(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const expandAllSections = () => {
    const allIds: Record<string, boolean> = {
      'sec-inner-cover': true,
      'sec-dedication': true,
      'sec-introduction': true,
      'chapter-1': true,
      'chapter-2': true,
      'chapter-3': true,
      'chapter-4': true,
      'chapter-5': true,
      'chapter-6': true,
      'sec-conclusion': true,
    };
    setExpandedSections(allIds);
  };

  const collapseAllSections = () => {
    setExpandedSections({});
  };

  const handleIncreaseFont = () => {
    setFontSize((prev) => {
      const next = Math.min(26, prev + 1);
      localStorage.setItem('monograph_font_size', next.toString());
      return next;
    });
  };

  const handleDecreaseFont = () => {
    setFontSize((prev) => {
      const next = Math.max(18, prev - 1);
      localStorage.setItem('monograph_font_size', next.toString());
      return next;
    });
  };

  // Ambient soundscape audio state
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(true);
  const soundscapeRef = useRef<AmbientSoundscape | null>(null);

  useEffect(() => {
    soundscapeRef.current = new AmbientSoundscape();
    return () => {
      soundscapeRef.current?.stop();
    };
  }, []);

  const toggleAudio = () => {
    if (isAudioPlaying) {
      soundscapeRef.current?.stop();
      setIsAudioPlaying(false);
    } else {
      soundscapeRef.current?.start();
      setIsAudioPlaying(true);
    }
  };

  // Restore scroll position on unlock
  useEffect(() => {
    if (unlocked) {
      const savedPos = localStorage.getItem('last_read_position');
      if (savedPos) {
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedPos, 10),
            behavior: 'smooth',
          });
        }, 300);
      }
    }
  }, [unlocked]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }

      if (unlocked) {
        localStorage.setItem('last_read_position', Math.round(window.scrollY).toString());
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [unlocked]);

  const handleGateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPass = passphrase.trim();
    if (cleanPass === 'خذني بحضنك' || cleanPass.includes('خذني بحضنك')) {
      setIsUnlockingAnimation(true);
      setErrorMsg(false);
      setShake(false);
      if (!isAudioPlaying) {
        setIsAudioPlaying(true);
        soundscapeRef.current?.start();
      }
      setTimeout(() => {
        localStorage.setItem('sanctuary_unlocked', 'true');
        setUnlocked(true);
        setIsUnlockingAnimation(false);
      }, 750);
    } else {
      setShake(true);
      setErrorMsg(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const doorToChapterMap: Record<string, string> = {
    'sec-inner-cover': 'sec-inner-cover',
    'sec-covenant': 'sec-inner-cover',
    'sec-dedication': 'sec-dedication',
    'intro-door-1': 'sec-introduction',
    'intro-door-2': 'sec-introduction',
    'intro-door-3': 'sec-introduction',
    'ch1-door-1': 'chapter-1',
    'ch1-door-2': 'chapter-1',
    'ch1-door-3': 'chapter-1',
    'ch2-door-1': 'chapter-2',
    'ch2-door-2': 'chapter-2',
    'ch2-door-3': 'chapter-2',
    'ch2-door-4': 'chapter-2',
    'ch2-door-5': 'chapter-2',
    'ch2-door-6': 'chapter-2',
    'ch2-door-7': 'chapter-2',
    'ch2-door-8': 'chapter-2',
    'ch2-door-9': 'chapter-2',
    'ch2-door-10': 'chapter-2',
    'ch2-door-11': 'chapter-2',
    'ch2-door-12': 'chapter-2',
    'ch3-door-1': 'chapter-3',
    'ch3-door-2': 'chapter-3',
    'ch3-door-3': 'chapter-3',
    'ch3-door-4': 'chapter-3',
    'ch3-door-5': 'chapter-3',
    'ch3-door-6': 'chapter-3',
    'ch3-door-7': 'chapter-3',
    'ch3-door-8': 'chapter-3',
    'ch3-door-9': 'chapter-3',
    'ch3-door-10': 'chapter-3',
    'ch3-door-11': 'chapter-3',
    'ch3-door-12': 'chapter-3',
    'ch4-door-1': 'chapter-4',
    'ch4-door-2': 'chapter-4',
    'ch4-door-3': 'chapter-4',
    'ch4-door-4': 'chapter-4',
    'ch4-door-5': 'chapter-4',
    'ch4-door-6': 'chapter-4',
    'ch4-door-7': 'chapter-4',
    'ch4-door-8': 'chapter-4',
    'ch4-door-9': 'chapter-4',
    'ch4-door-10': 'chapter-4',
    'ch4-door-11': 'chapter-4',
    'ch4-door-12': 'chapter-4',
    'ch5-door-1': 'chapter-5',
    'ch5-door-2': 'chapter-5',
    'ch5-door-3': 'chapter-5',
    'ch5-door-4': 'chapter-5',
    'ch5-door-5': 'chapter-5',
    'ch5-door-6': 'chapter-5',
    'ch6-door-1': 'chapter-6',
    'ch6-door-2': 'chapter-6',
    'ch6-door-3': 'chapter-6',
    'ch6-door-4': 'chapter-6',
    'ch6-door-5': 'chapter-6',
    'ch6-door-6': 'chapter-6',
    'ch6-door-7': 'chapter-6',
    'ch6-door-8': 'chapter-6',
    'ch6-door-9': 'chapter-6',
    'ch6-door-10': 'chapter-6',
    'ch6-door-11': 'chapter-6',
    'ch6-door-12': 'chapter-6',
    'sec-conclusion': 'sec-conclusion',
  };

  const scrollToSection = (id: string) => {
    setDrawerOpen(false);
    const parentId = doorToChapterMap[id] || id;
    openSection(parentId);
    openSection(id);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.remove('section-focus-highlight');
        void element.offsetWidth;
        element.classList.add('section-focus-highlight');
        setTimeout(() => {
          element.classList.remove('section-focus-highlight');
        }, 1200);
      }
    }, 120);
  };

  // Chapter drawer items mapping
  const chaptersInDrawer = [
    {
      title: 'إلى لَمَاتي',
      id: 'sec-inner-cover',
      doors: [
        { id: 'sec-inner-cover', title: 'الافتتاحية' },
        { id: 'sec-covenant', title: 'الميثاق الرصين' },
      ],
    },
    {
      title: 'الإهداء: إلى التي لا تُختصر',
      id: 'sec-dedication',
      doors: [{ id: 'sec-dedication', title: 'الإهداء' }],
    },
    {
      title: 'المقدمة: في الرابع من نوفمبر',
      id: 'sec-introduction',
      doors: [
        { id: 'intro-door-1', title: MANUSCRIPT_DOORS['intro-door-1']?.title || 'الباب الأول' },
        { id: 'intro-door-2', title: MANUSCRIPT_DOORS['intro-door-2']?.title || 'الباب الثاني' },
        { id: 'intro-door-3', title: MANUSCRIPT_DOORS['intro-door-3']?.title || 'الباب الثالث' },
      ],
    },
    {
      title: 'الفصل الأول: ٩١١ يوماً.. البدايات واليقين',
      id: 'chapter-1',
      doors: [1, 2, 3].map((i) => ({
        id: `ch1-door-${i}`,
        title: MANUSCRIPT_DOORS[`ch1-door-${i}`]?.title || `الباب ${i}`,
      })),
    },
    {
      title: 'الفصل الثاني: لغتنا التي لا يفهمها أحد',
      id: 'chapter-2',
      doors: Array.from({ length: 12 }, (_, i) => ({
        id: `ch2-door-${i + 1}`,
        title: MANUSCRIPT_DOORS[`ch2-door-${i + 1}`]?.title || `الباب ${i + 1}`,
      })),
    },
    {
      title: 'الفصل الثالث: الأيام الصعبة والخوف',
      id: 'chapter-3',
      doors: Array.from({ length: 12 }, (_, i) => ({
        id: `ch3-door-${i + 1}`,
        title: MANUSCRIPT_DOORS[`ch3-door-${i + 1}`]?.title || `الباب ${i + 1}`,
      })),
    },
    {
      title: 'الفصل الرابع: الأيام الحلوة وضحكتك',
      id: 'chapter-4',
      doors: Array.from({ length: 12 }, (_, i) => ({
        id: `ch4-door-${i + 1}`,
        title: MANUSCRIPT_DOORS[`ch4-door-${i + 1}`]?.title || `الباب ${i + 1}`,
      })),
    },
    {
      title: 'الفصل الخامس: بعد التاسع من أكتوبر',
      id: 'chapter-5',
      doors: Array.from({ length: 6 }, (_, i) => ({
        id: `ch5-door-${i + 1}`,
        title: MANUSCRIPT_DOORS[`ch5-door-${i + 1}`]?.title || `الباب ${i + 1}`,
      })),
    },
    {
      title: 'الفصل السادس: ما يبقى بعد كل شيء',
      id: 'chapter-6',
      doors: Array.from({ length: 12 }, (_, i) => ({
        id: `ch6-door-${i + 1}`,
        title: MANUSCRIPT_DOORS[`ch6-door-${i + 1}`]?.title || `الباب ${i + 1}`,
      })),
    },
    {
      title: 'الخاتمة: دعاءٌ في الغياب',
      id: 'sec-conclusion',
      doors: [{ id: 'sec-conclusion', title: 'خِتَامُ الكِتَابِ' }],
    },
  ];

  return (
    <div
      className="min-h-screen relative selection:bg-[#851A26] selection:text-[#FAF6F0] dir-rtl bg-[#FAF6F0] text-[#2F1216]"
      style={{
        fontFamily: "'Scheherazade New', 'Amiri', serif",
        fontSize: '21px',
        lineHeight: 2.2,
      }}
    >
      {/* Top Reading Progress Bar */}
      <div
        id="distillation-line"
        className="fixed top-0 right-0 h-[3px] z-[5000] transition-all duration-100 ease-linear bg-[#851A26] shadow-[0_0_8px_#851A26]"
        style={{
          width: `${scrollProgress}%`,
        }}
        aria-hidden="true"
      />

      {/* Screen 1: The Threshold Gate */}
      {!unlocked && !showGate && (
        <aside
          id="gateway-threshold"
          className="fixed inset-0 bg-[#FAF6F0] text-[#410407] z-[9999] flex flex-col justify-center items-center text-center p-3 sm:p-6 relative overflow-hidden"
          aria-label="العتبة الأولى"
        >
          <div className="fixed inset-2 sm:inset-5 border-2 border-[#410407] rounded-[32px] sm:rounded-[36px] pointer-events-none z-20 opacity-80" />
          <div className="fixed inset-3.5 sm:inset-7 border border-[#AE9189] rounded-[28px] sm:rounded-[32px] pointer-events-none z-20 opacity-60" />

          {/* Majestic Arched Portal */}
          <div style={{ marginTop: '20px' }} className="arch-portal w-[325px] max-w-[92vw] min-h-[85vh] sm:min-h-[80vh] flex flex-col justify-between items-center text-center relative z-10 my-auto border-2 border-[#410407] bg-[#FFFDF9] shadow-[8px_8px_0px_#410407] rounded-[180px_180px_36px_36px] sm:rounded-[220px_220px_40px_40px] py-10 sm:py-14 px-6 sm:px-10 box-border">
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-3xl text-[#851A26] tracking-widest font-serif opacity-90 mb-2 select-none">
                ✦ · ❖ · ✦
              </div>

              <div className="px-4 py-1.5 rounded-full border border-[#410407]/30 bg-[#FAF6F0] text-[#851A26] text-xs font-bold tracking-widest uppercase mb-3">
                طبعة خاصة — ٤ نوفمبر
              </div>
            </div>

            <div className="my-auto py-4 sm:py-6 flex flex-col items-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide leading-relaxed text-[#410407] font-['Scheherazade_New',serif]">
                .. لَـمْ أَكُـــــنْ عَـابِراً<br />
                ... وَلَــنْ تَـكُـونِـي
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowGate(true);
                if (!isAudioPlaying) {
                  setIsAudioPlaying(true);
                  soundscapeRef.current?.start();
                }
              }}
              className="bg-[#851A26] hover:bg-[#68141F] text-[#FAF6F0] border-[1.5px] border-[#410407] text-base sm:text-lg cursor-pointer px-9 py-3.5 rounded-full transition-all duration-300 flex items-center gap-2.5 outline-none shadow-[3px_3px_0px_#410407] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold"
            >
              <span>افتحي الكتاب</span>
              <span className="text-sm opacity-90">↓</span>
            </button>
          </div>

          {/* Background Ambient Soundtrack (زحمة حكي) */}
          {isAudioPlaying && (
            <iframe
              width="1"
              height="1"
              src="https://www.youtube.com/embed/5g-s5WvLLek?autoplay=1&loop=1&playlist=5g-s5WvLLek&enablejsapi=1"
              title="Background Ambient Music - زحمة حكي"
              allow="autoplay; encrypted-media"
              className="hidden pointer-events-none opacity-0 fixed bottom-0 left-0"
            />
          )}
        </aside>
      )}

      {/* Screen 2: The Secret Passphrase Chamber */}
      {!unlocked && showGate && (
        <aside
          id="intimate-gate"
          className="fixed inset-0 bg-[#FAF6F0] text-[#2F1216] z-[9990] flex flex-col justify-center items-center p-3 sm:p-6 relative overflow-hidden"
          aria-label="بوابة الدخول"
        >
          {isUnlockingAnimation && (
            <div className="absolute inset-0 bg-radial from-[#F6ECE8]/90 via-[#851A26]/30 to-transparent z-[10000] animate-[lightBloom_0.75s_ease-out_forwards] pointer-events-none" />
          )}

          <div className="fixed inset-2 sm:inset-5 border-2 border-[#410407] rounded-[32px] sm:rounded-[36px] pointer-events-none z-20 opacity-80" />
          <div className="fixed inset-3.5 sm:inset-7 border border-[#AE9189] rounded-[28px] sm:rounded-[32px] pointer-events-none z-20 opacity-60" />

          <form
            onSubmit={handleGateSubmit}
            style={{ width: '330px', marginTop: '20px' }}
            className="bg-[#FFFDF9] border-2 border-[#410407] rounded-[36px] p-8 sm:p-12 min-h-[75vh] sm:min-h-[70vh] flex flex-col justify-center items-center text-center shadow-[8px_8px_0px_#410407] relative z-10 box-border"
          >
            <div className="w-full max-w-sm flex flex-col items-center">
              <div className="text-xl sm:text-2xl text-[#851A26] tracking-widest font-serif opacity-90 mb-2 select-none">
                ✦ · ❖ · ✦
              </div>

              <span className="text-xs uppercase tracking-widest text-[#AE9189] font-bold mb-1">
                ✦ The Private Archive ✦
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#410407] mb-1 font-['Scheherazade_New',serif]">
                بوابة كتاب الميلاد
              </h2>
              <p className="text-sm sm:text-base text-[#851A26] mb-6 font-medium">
                اكتبي العبارة للدخول إلى الكتاب
              </p>

              <div className="w-full flex flex-col items-center gap-3 mb-5">
                <input
                  type="text"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className={`w-full bg-[#FAF6F0] border-[1.8px] border-[#410407] rounded-full px-6 py-3.5 text-[#2F1216] text-center text-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-[#851A26]/30 ${
                    shake
                      ? 'animate-[gentleShake_0.45s_ease-in-out] border-[#851A26] ring-2 ring-[#851A26]/40'
                      : ''
                  }`}
                  placeholder="كلمة السر"
                  autoFocus
                  spellCheck={false}
                  aria-label="كلمة السر"
                />

                {/* Interactive Hint Button & Sliding Card */}
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="mt-1 text-xs sm:text-sm font-bold text-[#851A26] hover:text-[#410407] transition-colors flex items-center gap-1.5 underline cursor-pointer outline-none"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>تلميح</span>
                </button>

                {showHint && (
                  <div className="px-5 py-2.5 rounded-full bg-[#F6ECE8] border border-[#AE9189] text-[#851A26] text-base font-bold italic animate-[fadeIn_0.3s_ease-out]">
                    العبارة هي: «خذني بحضنك»
                  </div>
                )}
              </div>

              <div className={`min-h-[1.6rem] text-sm text-[#851A26] transition-opacity duration-300 mb-4 -mt-2 ${errorMsg ? 'opacity-100 font-bold' : 'opacity-0'}`}>
                حاولي مرة أخرى..
              </div>

              <button
                type="submit"
                className="w-full bg-[#851A26] hover:bg-[#68141F] text-[#FAF6F0] border-[1.5px] border-[#410407] font-bold px-8 py-3.5 text-base sm:text-lg rounded-full cursor-pointer transition-all duration-300 shadow-[3px_3px_0px_#410407] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none outline-none tracking-wide"
              >
                ادخلي
              </button>
            </div>
          </form>
        </aside>
      )}

      {/* Screen 3: The Reading Sanctuary (Accordion Windows Architecture) */}
      <main
        id="sanctuary-container"
        style={{ fontSize: `${fontSize}px`, lineHeight: 2.2 }}
        className={`max-w-[780px] mx-auto px-4 sm:px-6 py-12 md:py-20 pb-36 transition-all duration-300 ${
          unlocked ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Accordion Global Controls Bar */}
        <div className="flex items-center justify-between gap-3 mb-8 px-2">
          <div className="text-sm font-bold text-[#851A26]">
            ✦ الأبواب المفتوحة القابلة للطي ✦
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAllSections}
              className="px-3.5 py-1.5 rounded-full bg-[#851A26] text-[#FAF6F0] border border-[#410407] text-xs font-bold shadow-sm hover:bg-[#68141F] cursor-pointer outline-none transition-colors"
            >
              افتحي كل الأبواب
            </button>
            <button
              type="button"
              onClick={collapseAllSections}
              className="px-3.5 py-1.5 rounded-full bg-[#FAF6F0] text-[#851A26] border border-[#410407] text-xs font-bold shadow-sm hover:bg-[#E6D6C5] cursor-pointer outline-none transition-colors"
            >
              اطوي كل الأبواب
            </button>
          </div>
        </div>

        {/* 1. إلى لَمَاتي */}
        <AccordionCard
          id="sec-inner-cover"
          badge="الافتتاحية"
          title="إلى لَمَاتي"
          isOpen={!!expandedSections['sec-inner-cover']}
          onToggle={() => toggleSection('sec-inner-cover')}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center text-[#75222B] mb-2 leading-snug font-['Scheherazade_New',serif]">
            لَمْ أَكُنْ عَابِراً.. وَلَنْ تَكُونِي
          </h1>
          <p className="text-lg text-center text-[#851A26] mb-8 font-medium">
            (إصدار خاص — 4 نوفمبر)
          </p>

          <div className="space-y-4 text-justify">
            {SPECIAL_SECTIONS.cover?.paragraphs.map((p, idx) => (
              <p key={idx} className="leading-[2.2] text-[#2F1216]">
                {p}
              </p>
            ))}
          </div>

          <div id="sec-covenant" className="my-8 pt-6 border-t border-[#410407]/20 scroll-mt-24">
            <div className="space-y-4 text-justify">
              {SPECIAL_SECTIONS.covenant?.paragraphs.map((p, idx) => (
                <p key={idx} className="leading-[2.2] text-[#2F1216]">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </AccordionCard>

        {/* 2. الإهداء: إلى التي لا تُختصر */}
        <AccordionCard
          id="sec-dedication"
          badge="الإهداء"
          title="الإهداء: إلى التي لا تُختصر"
          subtitle="من أغسطس 2024 حتى مايو 2026"
          isOpen={!!expandedSections['sec-dedication']}
          onToggle={() => toggleSection('sec-dedication')}
        >
          <div className="space-y-4 text-justify">
            {SPECIAL_SECTIONS.dedication?.paragraphs.map((p, idx) => (
              <p key={idx} className="leading-[2.2] text-[#2F1216]">
                {p}
              </p>
            ))}
          </div>
        </AccordionCard>

        {/* 3. المقدمة: في الرابع من نوفمبر */}
        <AccordionCard
          id="sec-introduction"
          badge="المقدمة"
          title="المقدمة: في الرابع من نوفمبر"
          subtitle="٣ أبواب في إعادة حساب العمر"
          isOpen={!!expandedSections['sec-introduction']}
          onToggle={() => toggleSection('sec-introduction')}
        >
          <div className="space-y-4 text-justify mb-6">
            {SPECIAL_SECTIONS.introMain?.paragraphs.map((p, idx) => (
              <p key={idx} className="leading-[2.2] text-[#2F1216]">
                {p}
              </p>
            ))}
          </div>

          <DoorContent id="intro-door-1" />
          <DoorContent id="intro-door-2" />
          <DoorContent id="intro-door-3" />
        </AccordionCard>

        {/* 4. الفصل الأول */}
        <AccordionCard
          id="chapter-1"
          badge="الفصل الأول"
          title="الفصل الأول: ٩١١ يوماً.. البدايات واليقين"
          subtitle="٣ أبواب في الجذور والذاكرة"
          isOpen={!!expandedSections['chapter-1']}
          onToggle={() => toggleSection('chapter-1')}
        >
          <DoorContent id="ch1-door-1" />
          <DoorContent id="ch1-door-2" />
          <DoorContent id="ch1-door-3" />
        </AccordionCard>

        {/* فاصل غنائي (١) ورسالة خاصة */}
        <AudioVinylCard
          artist="عبد المجيد عبد الله"
          interludeBadge="فاصل غنائي (١)"
          trackTitle="أحبك ليه"
          youtubeId="2HOc--v3YD0"
        />
        <EnvelopeCard
          letterTitle="ذاكرة الساعة"
          letterContent="بطلنا نعرف أخبار بعض، بس لليوم كل ما أطلع على الساعة بتذكر بالضبط شو كنتِ تعملي بهالوقت. بعرف متى كنتِ تصحي ومتى تنامي ومتى تكوني مشغولة ومتى كنتِ تفضي عشان نحكي.. غريب كيف ممكن نطلع من روتين بعض بس تضل تفاصيلنا عايشة بذاكرة بعض، والأغرب إني بطلت أعرف كيف بيمر يومك بس لسه بتذكر كل تفاصيله كأنك إمبارح حكيتيه لي."
        />

        {/* 5. الفصل الثاني */}
        <AccordionCard
          id="chapter-2"
          badge="الفصل الثاني"
          title="الفصل الثاني: لغتنا التي لا يفهمها أحد"
          subtitle="١٢ باباً في الشفرات والخصوصية"
          isOpen={!!expandedSections['chapter-2']}
          onToggle={() => toggleSection('chapter-2')}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <DoorContent key={i} id={`ch2-door-${i + 1}`} />
          ))}
        </AccordionCard>

        {/* فاصل غنائي (٢) ورسالة خاصة */}
        <AudioVinylCard
          artist="محمد عبده (جلسة عود)"
          interludeBadge="فاصل غنائي (٢)"
          trackTitle="مهما يقولون"
          youtubeId="nViPujMLNPM"
        />
        <EnvelopeCard
          letterTitle="قبل أن أشبع منكِ"
          letterContent="مشيتي قبل ما أشبع منك، قبل ما أشبع من صوتك، من ضحكتك، ومن وجودك بحياتي.. كان لسه عندي حكي كثير أحكيلك إياه، ولحظات كثير نفسي نعيشها، بس انتِ مشيتي قبل ما تكملي حكايتنا، وتركتيني أعيش على شوق ما أخذ كفايته منك."
        />

        {/* 6. الفصل الثالث */}
        <AccordionCard
          id="chapter-3"
          badge="الفصل الثالث"
          title="الفصل الثالث: الأيام الصعبة والخوف"
          subtitle="١٢ باباً في المراجعات والنضج"
          isOpen={!!expandedSections['chapter-3']}
          onToggle={() => toggleSection('chapter-3')}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <DoorContent key={i} id={`ch3-door-${i + 1}`} />
          ))}
        </AccordionCard>

        {/* فاصل غنائي (٣) ورسالة خاصة */}
        <AudioVinylCard
          artist="عبد المجيد عبد الله (جلسة عود)"
          interludeBadge="فاصل غنائي (٣)"
          trackTitle="ليه دايم أحتاج أسألك"
          youtubeId="vSh-8dF_Afw"
        />
        <EnvelopeCard
          letterTitle="لسنا نهاية ولا كسر"
          letterContent="أنا ما كتبت هذا عشان أرجّع اللوم ولا أعدّ الغلطات، كتبته لأني زعلان ومتألم لكني بعد متمسك فينا ومؤمن إن اللي بينا يتصلّح بالهدوء وبالكلام الصادق، مو بالصراخ ولا بالإرجاع ولا بالانسحاب.. وفي النهاية ما أبي من كل هالكلام شي غير إنك تحسي إنك مسموعة ومفهومة، وإن اللي صار مو نهاية ولا كسر، كان لحظة تعب نقدر نعديها إذا مسكنا يد بعض بهدوء. خذي وقتك وراحتك، وأنا موجود بنفس المكان اللي كنت فيه دايماً إنسانة تهمني ومشاعرها تفرق معي، واللي بينا يستاهل نهدى عشانه مو نوجع بعض بسببه.. ومتى ما حسيتي إنك جاهزة نحكي ونصلح بدون ما نخسر شي حلو جمعنا، لأن وجودك بحياتي مو لحظة ولا ظرف، هو شي ثابت وأتمنى يبقى بهالشكل."
        />

        {/* 7. الفصل الرابع */}
        <AccordionCard
          id="chapter-4"
          badge="الفصل الرابع"
          title="الفصل الرابع: الأيام الحلوة وضحكتك"
          subtitle="١٢ باباً في البهاء والفرح"
          isOpen={!!expandedSections['chapter-4']}
          onToggle={() => toggleSection('chapter-4')}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <DoorContent key={i} id={`ch4-door-${i + 1}`} />
          ))}
        </AccordionCard>

        {/* فاصل غنائي (٤) ورسالة خاصة */}
        <AudioVinylCard
          artist="محمد عبده (جلسة عود)"
          interludeBadge="فاصل غنائي (٤)"
          trackTitle="من يقول الزين"
          youtubeId="iukkrKjI_yE"
        />
        <EnvelopeCard
          letterTitle="اشتقتُ لذاك الهدوء"
          letterContent="بتذكري كيف كنا نضحك من قلبنا؟ بتذكر كيف كانت الأيام خفيفة والوقت يمر بدون ما نحس فيه؟.. اشتقت لهداك الهدوء، اشتقت للأمان اللي كان يملأ صدري بس لمجرد إني أسمع نبرة صوتك مبسوطة.. غريب كيف كنا نقدر نخلّي الدنيا كلها تسكت عشان نحكي، وكيف صارت كل ضحكة عشناها زمان توجع اليوم لأنها باقية لحالها بالذاكرة."
        />

        {/* 8. الفصل الخامس */}
        <AccordionCard
          id="chapter-5"
          badge="الفصل الخامس"
          title="الفصل الخامس: بعد التاسع من أكتوبر"
          subtitle="٦ أبواب في الثبات والصمت الوقور"
          isOpen={!!expandedSections['chapter-5']}
          onToggle={() => toggleSection('chapter-5')}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <DoorContent key={i} id={`ch5-door-${i + 1}`} />
          ))}
        </AccordionCard>

        {/* فاصل غنائي (٥) ورسالة خاصة */}
        <AudioVinylCard
          artist="محمد عبده (جلسة عود)"
          interludeBadge="فاصل غنائي (٥)"
          trackTitle="ما عاد بدري"
          youtubeId="gqoJ_1Loz1w"
        />
        <EnvelopeCard
          letterTitle="رسالة آخر الليل"
          letterContent="في آخر الليل كتب لها رسالة قبل ما ينام وقال لها: أنا أسف على كل مرة زعلتك فيها، وعلى كل كلمة حكيتها من غير ما أفكر بشعورك، وأسف على كل مرة كنت فيها سبب بدمعتك بدل ما أكون أنا الشخص اللي بيمسحها. يمكن ما كنت أقصد أوجعك بس بعرف إنه الوجع ما بفرق معه إذا كان بقصد أو بدون قصد، ويمكن اعتذاري ما بغير اللي صار بس صدقيني لو يرجع فيّ الزمن كنت راح أختار كلماتي ألف مرة قبل ما أحكيهم."
        />

        {/* 9. الفصل السادس */}
        <AccordionCard
          id="chapter-6"
          badge="الفصل السادس"
          title="الفصل السادس: ما يبقى بعد كل شيء"
          subtitle="١٢ باباً في الخلود والأثر الأبدي"
          isOpen={!!expandedSections['chapter-6']}
          onToggle={() => toggleSection('chapter-6')}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <DoorContent key={i} id={`ch6-door-${i + 1}`} />
          ))}
        </AccordionCard>

        {/* فاصل غنائي (٦) ورسالة خاصة */}
        <AudioVinylCard
          artist="راشد الماجد"
          interludeBadge="فاصل غنائي (٦)"
          trackTitle="بترجعين"
          youtubeId="IhsjqzhkfTA"
        />
        <EnvelopeCard
          letterTitle="الصدق لا يموت"
          letterContent="تعرفي شو اللي يخليني مطمئن وأنا ساكت؟ إني بعرف إن الصدق ما بيموت، وإن الأثر الحقيقي ما بتمحيه قسوة ولا بتبدله مسافات.. أنا ما تركتك عشان أنساكِ، ولا وقفت مكاني عشان أبيكِ؛ بس وقفت لأني بعرف إن اللي بينا أكبر من لعبة شد حبال.. كنت، ولساتني، بشوفك أطهر مرحلة بحياتي.. غبتِ أو بقيتِ، مكانك هون بالعمق، بالقرارات، وبالطريقة اللي صرت أشوف فيها الدنيا.. واللي بكون هيك، مستحيل يكون عابر، ومستحيل بيوم يقدر يحكي إنه نسي."
        />

        {/* 10. الخاتمة: دعاءٌ في الغياب */}
        <AccordionCard
          id="sec-conclusion"
          badge="الخاتمة"
          title="الخاتمة: دعاءٌ في الغياب"
          subtitle="خِتَامُ الكِتَابِ.. وَاسْتِمْرَارُ الحِكَايَةِ"
          isOpen={!!expandedSections['sec-conclusion']}
          onToggle={() => toggleSection('sec-conclusion')}
        >
          <div className="space-y-4 text-justify">
            {SPECIAL_SECTIONS.conclusion?.paragraphs.map((p, idx) => {
              const isPrayer = p.includes('الله يوفقكِ وين ما تروحي') || p.includes('الدُّعَاءُ الصَّافِي');
              if (isPrayer) {
                return (
                  <div key={idx} className="bg-[#F6ECE8] p-6 md:p-10 my-8 rounded-[24px] border border-[#75222B]/30 shadow-sm text-justify leading-[2.3]">
                    <p className="m-0 text-[#2A1810] font-medium">
                      {p}
                    </p>
                  </div>
                );
              }
              return (
                <p key={idx} className="leading-[2.2] text-[#2F1216]">
                  {p}
                </p>
              );
            })}
          </div>
        </AccordionCard>
      </main>

      {/* Embedded Background YouTube Ambient Player */}
      {isAudioPlaying && (
        <div className="sr-only" aria-hidden="true">
          <iframe
            width="1"
            height="1"
            src="https://www.youtube.com/embed/NIAiTDb6fug?autoplay=1&loop=1&playlist=NIAiTDb6fug&enablejsapi=1"
            title="Ambient Piano Background Track"
            allow="autoplay"
          />
        </div>
      )}

      {/* Floating Bottom Navigation & Controls Dock (Responsive Mobile-First) */}
      {unlocked && (
        <aside
          id="floating-sanctuary-controls"
          aria-label="أدوات القراءة والملاذ"
          className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-[5000] flex items-center justify-between gap-1 sm:gap-2.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-full backdrop-blur-md shadow-[4px_4px_0px_#410407] border-[1.5px] border-[#410407] bg-[#FAF6F0]/95 text-[#2F1216] max-w-[95vw] w-auto box-border"
        >
          {/* Chapter Index Button */}
          <button
            type="button"
            id="nav-drawer-toggle"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 bg-[#851A26] text-[#FAF6F0] border border-[#410407] shadow-[2px_2px_0px_#410407] hover:bg-[#68141F] active:translate-x-0.5 active:translate-y-0.5 outline-none cursor-pointer shrink-0"
            aria-label="فتح فهرس الكتاب"
            title="فهرس الكتاب"
          >
            <BookOpen className="w-3.5 h-3.5"/>
            <span className="whitespace-nowrap">فهرس الكتاب</span>
          </button>

          <span className="w-[1px] h-3.5 sm:h-4 bg-[#410407]/30 shrink-0" />

          {/* Ambient Music Toggle */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all outline-none cursor-pointer shrink-0 border border-[#410407] ${
              isAudioPlaying
                ? 'bg-[#851A26] text-[#FAF6F0] shadow-[2px_2px_0px_#410407]'
                : 'bg-[#FAF6F0] text-[#851A26] hover:bg-[#E6D6C5]/50'
            }`}
            aria-label={isAudioPlaying ? 'إيقاف المعزوفة' : 'تشغيل المعزوفة'}
            title="المعزوفة الموسيقية"
          >
            <Music className="w-3.5 h-3.5"/>
            <span className="whitespace-nowrap">المعزوفة</span>
          </button>

          <span className="w-[1px] h-3.5 sm:h-4 bg-[#410407]/30 shrink-0" />

          {/* Font Resizing Pill Group */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#FFFDF9] border border-[#410407] rounded-full px-1.5 py-0.5 shadow-[2px_2px_0px_#410407] shrink-0">
            <button
              type="button"
              onClick={handleDecreaseFont}
              disabled={fontSize <= 18}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-[#410407] hover:bg-[#851A26] hover:text-[#FAF6F0] transition-colors disabled:opacity-30 cursor-pointer outline-none select-none"
              title="تصغير الخط"
            >
              أ-
            </button>
            <span className="text-[10px] sm:text-xs font-bold text-[#851A26] px-0.5 tabular-nums select-none">
              {fontSize}
            </span>
            <button
              type="button"
              onClick={handleIncreaseFont}
              disabled={fontSize >= 26}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-[#410407] hover:bg-[#851A26] hover:text-[#FAF6F0] transition-colors disabled:opacity-30 cursor-pointer outline-none select-none"
              title="تكبير الخط"
            >
              أ+
            </button>
          </div>

          <span className="w-[1px] h-3.5 sm:h-4 bg-[#410407]/30 shrink-0" />

          {/* Return to Gate / Lock Button */}
          <button
            type="button"
            onClick={handleReturnToGate}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 bg-[#FAF6F0] text-[#851A26] border border-[#410407] hover:bg-[#851A26] hover:text-[#FAF6F0] outline-none cursor-pointer shrink-0"
            aria-label="العودة إلى بوابة الدخول"
            title="إغلاق والعودة للبوابة"
          >
            <Lock className="w-3 h-3"/>
            <span className="whitespace-nowrap hidden xs:inline sm:inline">البوابة</span>
          </button>

          <span className="w-[1px] h-3.5 sm:h-4 bg-[#410407]/30 shrink-0" />

          {/* Reading Progress Counter */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-[#410407] text-[#FAF6F0] border border-[#410407] px-1.5 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold tabular-nums hover:bg-[#2F1216] transition-colors cursor-pointer shrink-0 shadow-[2px_2px_0px_#AE9189]"
            title="نسبة القراءة — انقري للعودة للأعلى"
          >
            {Math.round(scrollProgress)}%
          </button>
        </aside>
      )}

      {/* Floating Navigation Modal / Chapter Drawer */}
      {unlocked && (
        <>
          <div
            id="nav-modal-backdrop"
            onClick={() => setDrawerOpen(false)}
            className={`fixed inset-0 bg-black/70 backdrop-blur-md z-[6000] transition-opacity duration-300 ${
              drawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
            }`}
          />
          <div
            id="nav-drawer"
            className={`fixed bottom-0 left-0 right-0 max-h-[85vh] rounded-t-[36px] z-[6001] flex flex-col transition-all duration-500 ease-out shadow-[0_-12px_50px_rgba(65,4,7,0.3)] border-t-2 border-x-2 border-[#410407] bg-[#FFFDF9] text-[#2F1216] ${
              drawerOpen ? 'translate-y-0 opacity-100 drawer-open' : 'translate-y-full opacity-0 pointer-events-none'
            }`}
          >
            <div className="p-5 border-b border-[#410407]/20 flex justify-between items-center bg-[#FAF6F0] rounded-t-[34px]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#851A26]" />
                <h3 className="text-xl font-bold m-0 text-[#410407] font-['Scheherazade_New',serif]">
                  فهرس الكتاب
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-[#E6D6C5] text-[#410407] transition-colors border border-[#410407]/30 cursor-pointer outline-none"
                aria-label="إغلاق الفهرس"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
              {chaptersInDrawer.map((chapter) => (
                <div key={chapter.id} className="border-b border-[#410407]/10 pb-4">
                  <button
                    type="button"
                    onClick={() => scrollToSection(chapter.id)}
                    className="text-lg font-bold text-[#410407] hover:text-[#851A26] transition-colors mb-2 text-right w-full flex items-center gap-2 cursor-pointer outline-none"
                  >
                    <span className="text-[#851A26]">✦</span>
                    <span>{chapter.title}</span>
                  </button>
                  <div className="pr-4 space-y-1.5 border-r-2 border-[#851A26]/30 mr-2">
                    {chapter.doors.map((door) => (
                      <button
                        key={door.id}
                        type="button"
                        onClick={() => scrollToSection(door.id)}
                        className="block text-sm font-semibold text-[#2F1216]/80 hover:text-[#851A26] transition-colors text-right w-full py-1 cursor-pointer outline-none"
                      >
                        • {door.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
