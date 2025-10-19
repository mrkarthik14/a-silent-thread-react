import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Package, Shield, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50">
      <nav className="border-b border-pink-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-300 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🧵</span>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">A Silent Thread</h1>
            </div>
          </div>
          
          <Button
            onClick={() => navigate(isAuthenticated ? "/feed" : "/auth")}
            className="rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
          >
            {isAuthenticated ? "Dashboard" : "Get Started"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-300 to-purple-300 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-4xl">🧵</span>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            A Silent Thread
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect, share, and rent in a beautifully designed platform where every interaction is a thread that brings people together.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/feed" : "/auth")}
              className="rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-lg px-8"
            >
              {isAuthenticated ? "Go to Dashboard" : "Start Your Journey"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-20"
        >
          {[
            {
              icon: Package,
              title: "Rent Anything",
              description: "From cameras to cars, find what you need from trusted community members",
              color: "from-green-300 to-blue-300"
            },
            {
              icon: MessageSquare,
              title: "Stay Connected",
              description: "Thread-based messaging keeps conversations flowing naturally",
              color: "from-pink-300 to-purple-300"
            },
            {
              icon: Shield,
              title: "Safe & Secure",
              description: "Built-in protection and verified users ensure peace of mind",
              color: "from-yellow-300 to-orange-300"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-12 text-center"
        >
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every connection is a thread. Every rental is a story. Be part of something beautiful.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-lg px-8"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      <footer className="border-t border-pink-100 bg-white/50 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 A Silent Thread. Built with care and connection.</p>
        </div>
      </footer>
    </div>
  );
}