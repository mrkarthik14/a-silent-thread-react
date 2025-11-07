import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Calendar, Search, Sparkles, Sun, Moon, X, ZoomIn } from "lucide-react";
import { useNavigate } from "react-router";
import { LoadingLogo } from "@/components/LoadingLogo";
import { ThreadLine } from "@/components/ThreadLine";
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
  };

  const handleImageZoom = (imageSrc: string) => {
    setZoomedImage(imageSrc);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const features = [
    {
      icon: MessageCircle,
      title: "Thread Connections",
      description: "Connect with others through beautiful, flowing conversations",
      color: "from-pink-200 to-pink-300",
      textColor: "text-pink-900"
    },
    {
      icon: Search,
      title: "Discover Services",
      description: "Find and offer services in your community",
      color: "from-yellow-200 to-yellow-300",
      textColor: "text-yellow-900"
    },
    {
      icon: Calendar,
      title: "Easy Bookings",
      description: "Seamless booking experience with visual connections",
      color: "from-emerald-200 to-emerald-300",
      textColor: "text-emerald-900"
    },
    {
      icon: Sparkles,
      title: "Beautiful Design",
      description: "Soft, minimal interface that feels alive",
      color: "from-purple-200 to-purple-300",
      textColor: "text-purple-900"
    }
  ];

  useEffect(() => {
    const canvas = document.getElementById("cursor-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }> = [];

    const colors = darkMode
      ? ["#ff6b6b", "#ff8787", "#ffa07a", "#ff9999"]
      : ["#f8a5a5", "#f5b5b5", "#e8b4f1", "#b4d7f1"];

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      for (let i = 0; i < 3; i++) {
        particles.push({
          x: mouseX,
          y: mouseY,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 0.02;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 transition-colors duration-300">

      {/* Header */}
      <nav className="px-6 py-6 relative z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12">
              <LoadingLogo size="sm" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">A Silent Thread</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDarkModeToggle}
              className={`rounded-full p-2.5 font-semibold transition-all duration-500 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 ${
                darkMode
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 border border-indigo-500"
                  : "bg-gradient-to-r from-yellow-300 to-amber-300 text-amber-950 hover:from-yellow-400 hover:to-amber-400 border border-yellow-400"
              }`}
            >
              {darkMode ? (
                <Moon className="h-6 w-6 transition-transform duration-500 rotate-0" strokeWidth={1.5} />
              ) : (
                <Sun className="h-6 w-6 transition-transform duration-500 rotate-0" strokeWidth={1.5} />
              )}
            </Button>
            
            <Button
              onClick={() => navigate(isAuthenticated ? "/feed" : "/auth")}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 shadow-sm dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {isAuthenticated ? "Go to Feed" : "Get Started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-8">
            <LoadingLogo size="lg" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 dark:text-slate-100 mb-6 tracking-tight">
            A Silent Thread
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            Where connections flow like gentle threads
          </p>
          
          <p className="text-base text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            A modern renting platform that visualizes your connections, services, and conversations as beautiful, flowing threads. Experience community in a whole new way.
          </p>
          
          <Button
            size="lg"
            onClick={() => navigate(isAuthenticated ? "/feed" : "/auth")}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 py-6 text-lg shadow-lg dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {isAuthenticated ? "Go to Feed" : "Get Started"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Feature Cards with Thread Connections */}
      <div className="max-w-6xl mx-auto px-6 pb-20 relative z-10">
        <div className="relative">
          {/* Grid with connecting threads */}
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                className="relative"
              >
                {/* Thread connecting to center */}
                {index > 0 && (
                  <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-gradient-to-b from-purple-300 to-transparent" />
                )}
                
                <div className={`bg-gradient-to-br ${feature.color} dark:from-slate-700 dark:to-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow h-full`}>
                  <div className="mb-4">
                    <feature.icon className={`h-10 w-10 ${feature.textColor} dark:text-slate-200`} strokeWidth={1.5} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${feature.textColor} dark:text-slate-100`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${feature.textColor} dark:text-slate-300 opacity-80`}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Central connecting thread animation */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              className="w-96 h-1 bg-gradient-to-r from-rose-300 via-pink-300 to-purple-300 rounded-full blur-sm"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="max-w-6xl mx-auto px-6 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-gradient-to-br from-blue-200 to-cyan-300 dark:from-blue-900 dark:to-cyan-900 rounded-3xl p-12 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Calendar className="h-16 w-16 text-blue-900 dark:text-blue-200" strokeWidth={1.5} />
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-3">
            Plan Your Rentals
          </h2>
          <p className="text-blue-800 dark:text-blue-200 max-w-2xl mx-auto mb-6">
            Schedule your bookings with ease. Our intuitive calendar makes it simple to find available dates and manage your rental timeline.
          </p>
          <Button
            onClick={() => navigate(isAuthenticated ? "/bookings" : "/auth")}
            className="bg-blue-900 hover:bg-blue-800 text-white rounded-xl px-8 py-3 font-semibold active:scale-95 transition-all duration-150 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            View Calendar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Image Zoom Modal */}
      <Dialog open={zoomedImage !== null} onOpenChange={(open) => !open && setZoomedImage(null)}>
        <DialogContent className="rounded-2xl max-w-4xl p-0 border-0 bg-black/95">
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-50 hover:bg-white/20"
              onClick={() => setZoomedImage(null)}
            >
              <X className="h-6 w-6 text-white" strokeWidth={1.5} />
            </Button>

            {zoomedImage && (
              <div className="flex-1 flex items-center justify-center overflow-auto max-h-[80vh] w-full">
                <motion.img
                  src={zoomedImage}
                  alt="Zoomed view"
                  className="object-contain cursor-zoom-out"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transition: "transform 0.2s ease-out"
                  }}
                  onClick={() => handleZoomIn()}
                />
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black/60 px-4 py-3 rounded-xl">
              <Button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold"
              >
                −
              </Button>
              <span className="text-white text-sm font-semibold px-3 py-1 bg-white/10 rounded-lg">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold"
              >
                +
              </Button>
              <Button
                onClick={handleResetZoom}
                disabled={zoomLevel === 1}
                className="rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-semibold"
              >
                Reset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <canvas id="cursor-canvas" className="fixed inset-0 pointer-events-none" />
    </div>
  );
}