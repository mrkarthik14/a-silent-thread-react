import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Calendar, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { LoadingLogo } from "@/components/LoadingLogo";
import { ThreadLine } from "@/components/ThreadLine";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <nav className="px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12">
              <LoadingLogo size="sm" />
            </div>
            <span className="text-2xl font-bold text-slate-900">A Silent Thread</span>
          </div>
          
          <Button
            onClick={() => navigate(isAuthenticated ? "/feed" : "/auth")}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 shadow-sm"
          >
            {isAuthenticated ? "Go to Feed" : "Get Started"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-8">
            <LoadingLogo size="lg" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
            A Silent Thread
          </h1>
          
          <p className="text-xl text-slate-600 mb-4 max-w-2xl mx-auto leading-relaxed">
            Where connections flow like gentle threads
          </p>
          
          <p className="text-base text-slate-500 mb-10 max-w-2xl mx-auto">
            A modern renting platform that visualizes your connections, services, and conversations as beautiful, flowing threads. Experience community in a whole new way.
          </p>
          
          <Button
            size="lg"
            onClick={() => navigate(isAuthenticated ? "/feed" : "/auth")}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-10 py-6 text-lg shadow-lg"
          >
            {isAuthenticated ? "Go to Feed" : "Get Started"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Feature Cards with Thread Connections */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
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
                
                <div className={`bg-gradient-to-br ${feature.color} rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow h-full`}>
                  <div className="mb-4">
                    <feature.icon className={`h-10 w-10 ${feature.textColor}`} strokeWidth={1.5} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${feature.textColor}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${feature.textColor} opacity-80`}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Central connecting thread animation */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              className="w-96 h-1 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-full blur-sm"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}