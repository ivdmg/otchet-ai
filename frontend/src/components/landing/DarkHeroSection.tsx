import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  FileText, 
  ChevronDown 
} from "lucide-react";

interface DarkHeroSectionProps {
  onStartClick: () => void;
  onPreviewDocxClick?: () => void;
  videoSrc?: string;
}

export const DarkHeroSection: React.FC<DarkHeroSectionProps> = ({
  onStartClick,
  onPreviewDocxClick,
  videoSrc = "/hero_section_video.mp4"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // Autoplay on mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
          });
      }
    }
  }, []);

  // Show frosted card after 4.5 seconds of playback
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && !showCard) {
      timer = setTimeout(() => {
        setShowCard(true);
      }, 4500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, showCard]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 4.5 && !showCard) {
      setShowCard(true);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setShowCard(true);
    if (videoRef.current) {
      // Ensure the video stays paused on the last frame
      videoRef.current.pause();
    }
  };

  const scrollToNextSection = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      id="top" 
      className="relative w-full h-screen min-h-[100vh] overflow-hidden flex flex-col justify-between items-center bg-black select-none"
    >
      {/* Background Video (Fullscreen, plays 1 time, pauses on last frame) */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onLoadedData={() => setVideoLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700"
        style={{ opacity: videoLoaded ? 1 : 0.8 }}
      />

      {/* Subtle Ambient Vignette & Bottom Gradient for Smooth Section Transition */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-[#09090b] via-black/10 to-black/30" />
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]" />

      {/* Top Spacer for Fixed Header */}
      <div className="relative z-20 pt-20 sm:pt-24 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />

      {/* Center Frosted Glass Card (Appears smoothly after 4.5 seconds with exact Header Glass effect) */}
      <div className="relative z-30 w-full max-w-3xl sm:max-w-[820px] mx-auto px-4 sm:px-6 my-auto flex items-center justify-center">
        <AnimatePresence>
          {showCard && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-7 sm:p-11 text-center space-y-6"
            >
              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-md">
                  Курсовая и ВКР по ГОСТу <br className="hidden sm:inline" />
                  <span className="text-zinc-300 font-medium">без ручных правок в Word</span>
                </h1>

                <p className="text-sm sm:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed drop-shadow">
                  Генерация глубокого исследования со 100% соблюдением отступов, формул, таблиц и списка литературы.
                </p>
              </div>

              {/* 2 CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                <button
                  onClick={onStartClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-sm sm:text-base transition-all shadow-xl hover:shadow-white/20 cursor-pointer active:scale-95"
                >
                  <span>Сгенерировать работу</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onPreviewDocxClick || scrollToNextSection}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-zinc-200 hover:text-white font-medium text-sm sm:text-base backdrop-blur-md transition-all cursor-pointer active:scale-95"
                >
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>Посмотреть пример .docx</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Scroll Prompt (Bouncing Chevron Only) */}
      <div className="relative z-20 pb-8 text-center">
        <button
          onClick={scrollToNextSection}
          aria-label="Листать вниз"
          className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ChevronDown className="w-6 h-6 animate-bounce text-zinc-400 group-hover:text-white transition-colors" />
        </button>
      </div>
    </section>
  );
};

export default DarkHeroSection;
