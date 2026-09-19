import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Upload, Cpu, MessageSquare, Zap } from "lucide-react";
import LiquidEther from "@/components/LiquidEther";
import CustomScrollbar from "@/components/CustomScrollbar";
import { Logo } from "@/components/Logo";

const ragSteps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Documents",
    description: "Drop in PDFs, text files, markdown notes, or CSV data. Your files are stored securely in your personal knowledge base — accessible only to you.",
    accent: "#3b82f6",
    accentClass: "text-blue-400",
    borderClass: "border-blue-500/20",
    bgClass: "from-blue-500/8 to-transparent",
    glowClass: "shadow-blue-500/10",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Process & Embed",
    description: "Documents are parsed and their content is extracted automatically. The system prepares your knowledge base so every query gets the most relevant context.",
    accent: "#3b82f6",
    accentClass: "text-blue-400",
    borderClass: "border-blue-500/20",
    bgClass: "from-blue-500/8 to-transparent",
    glowClass: "shadow-blue-500/10",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Ask Questions",
    description: "Type any question in plain language. The RAG engine retrieves the most relevant passages from your documents in real time — no keyword matching required.",
    accent: "#3b82f6",
    accentClass: "text-blue-400",
    borderClass: "border-blue-500/20",
    bgClass: "from-blue-500/8 to-transparent",
    glowClass: "shadow-blue-500/10",
  },
  {
    number: "04",
    icon: Zap,
    title: "Get Grounded Answers",
    description: "GPT-4o-mini synthesizes a precise response using your actual documents as context. No hallucinations — every answer is grounded in your data.",
    accent: "#3b82f6",
    accentClass: "text-blue-400",
    borderClass: "border-blue-500/20",
    bgClass: "from-blue-500/8 to-transparent",
    glowClass: "shadow-blue-500/10",
  },
];

function StepCard({ step, index }: { step: typeof ragSteps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-20% 0px -20% 0px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex gap-5 group"
    >
      {/* Left: icon + line */}
      <div className="flex flex-col items-center shrink-0">
        <motion.div
          animate={isInView ? { opacity: 1 } : { opacity: 0.2 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all duration-500 ${
            isInView
              ? "bg-blue-500/8 border-blue-500/20"
              : "bg-white/[0.02] border-white/8"
          }`}
        >
          <Icon className={`h-5 w-5 transition-colors duration-500 ${isInView ? "text-blue-400" : "text-white/15"}`} />
        </motion.div>
        {index < ragSteps.length - 1 && (
          <div className="w-px flex-1 mt-3 min-h-[40px] bg-white/5 relative overflow-hidden">
            <motion.div
              className="absolute inset-x-0 top-0 bg-gradient-to-b from-blue-500/40 to-transparent"
              initial={{ height: 0 }}
              animate={isInView ? { height: "100%" } : { height: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
            />
          </div>
        )}
      </div>

      {/* Right: content */}
      <motion.div
        animate={isInView ? { opacity: 1 } : { opacity: 0.2 }}
        transition={{ duration: 0.4 }}
        className={`flex-1 mb-8 rounded-xl px-5 py-4 border transition-all duration-500 ${
          isInView
            ? "bg-white/[0.03] border-white/8"
            : "bg-transparent border-white/4"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-xs font-mono font-bold transition-colors duration-500 ${isInView ? "text-blue-400/70" : "text-white/15"}`}>
            {step.number}
          </span>
          <h3 className="text-sm font-semibold text-white">{step.title}</h3>
        </div>
        <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
      </motion.div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden relative">
      <CustomScrollbar />
      
      {/* Top Left Logo */}
      <div className="absolute top-4 left-6 z-50">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          <span className="font-semibold text-lg tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            ContextIQ 
          </span>
        </div>
      </div>

      {/* Top absolute header for subtle user profile */}
      <AnimatePresence>
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 right-6 z-50 flex items-center gap-4 text-sm font-medium"
          >
            <span className="text-white/40">{user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-white/40 hover:text-white hover:bg-white/5 h-8 px-3"
            >
              Sign out
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero — full screen fluid simulation */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LiquidEther
            colors={['#5227FF', '#FF9FFC', '#B497CF']}
            mouseForce={9}
            cursorSize={150}
            isViscous
            viscous={46}
            iterationsViscous={17}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce
            autoDemo
            autoSpeed={0.15}
            autoIntensity={1.8}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </div>
        <div className="absolute inset-0 z-10 bg-black/50" />

        <div className="relative z-20 text-center px-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs text-white/80 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Retrieval-Augmented Generation · Powered by Groq
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              Your documents,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-slate-300">
                finally answerable.
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/60 leading-relaxed mb-4 max-w-lg mx-auto">
              Upload PDFs, text files, and notes. Ask anything. Get precise answers
              grounded in your own knowledge base — not hallucinations.
            </p>

            <div className="flex items-center justify-center gap-6 mb-10 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-400/60" />
                Real-time retrieval
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-400/60" />
                Markdown responses
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-400/60" />
                Per-user history
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative min-h-[48px]">
              <AnimatePresence mode="wait">
                {isAuthenticated ? (
                  <motion.div
                    key="authenticated"
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      size="lg"
                      onClick={() => navigate("/chat")}
                      className="gap-2 px-8 bg-white text-black hover:bg-white/90 font-semibold"
                    >
                      Open Chat
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="unauthenticated"
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3"
                  >
                    <Button
                      size="lg"
                      onClick={() => navigate("/login")}
                      className="gap-2 px-8 bg-white text-black hover:bg-white/90 font-semibold"
                    >
                      Sign in to get started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/signup")}
                      className="px-8 border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                    >
                      Create free account
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-xs text-white/30 mt-8">
              No password required · Sign in with email OTP
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/40">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* RAG Pipeline section — replaces the 4 feature blocks */}
      <section className="py-28 px-6 bg-[#0a0a0f]">
        <div className="max-w-2xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-xs text-blue-300 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              How it works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              From document to answer
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-slate-400">
                in four steps.
              </span>
            </h2>
            <p className="text-sm text-white/40 max-w-sm mx-auto leading-relaxed">
              The RAG pipeline retrieves the most relevant context from your documents before generating a response — grounding every answer in your data.
            </p>
          </motion.div>

          {/* Steps */}
          <div>
            {ragSteps.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-28 px-6 border-t border-white/5 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-600/6 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto relative text-center"
        >
          {/* Icon row */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[Upload, Cpu, MessageSquare, Zap].map((Icon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/8 flex items-center justify-center"
              >
                <Icon className="h-3.5 w-3.5 text-blue-400/70" />
              </motion.div>
            ))}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white leading-tight">
            Start exploring
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-slate-400">
              your knowledge base.
            </span>
          </h2>

          <p className="text-sm text-white/40 mb-8 max-w-md mx-auto leading-relaxed">
            Sign up in seconds with just your email. Upload your first document and ask your first question — no setup required.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {["Free to start", "No password needed", "Email OTP auth", "GPT-4o-mini powered"].map((pill) => (
              <span
                key={pill}
                className="px-3 py-1 rounded-full border border-white/8 bg-white/[0.03] text-xs text-white/40"
              >
                {pill}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/chat" : "/signup")}
              className="gap-2 px-10 bg-white text-black hover:bg-white/90 font-semibold h-11 rounded-xl"
            >
              {isAuthenticated ? "Go to Chat" : "Get started free"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/login")}
                className="px-10 border-white/15 text-white/70 bg-transparent hover:bg-white/5 h-11 rounded-xl"
              >
                Sign in
              </Button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo className="w-4 h-4 drop-shadow-[0_0_4px_rgba(99,102,241,0.5)]" />
            <span className="text-xs font-medium text-white">ContextIQ </span>
          </div>
          <p className="text-xs text-white/30">
            Designed & Developed by Sujal Singh · B.Tech (Hons.) CSE — AI & Analytics · GLA University, Mathura
          </p>
        </div>
      </footer>
    </div>
  );
}
