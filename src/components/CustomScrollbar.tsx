import { useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export default function CustomScrollbar() {
  const { scrollYProgress } = useScroll();
  
  // Smooth out the scroll progress using framer-motion springs
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 25,
    restDelta: 0.001
  });

  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // Subscribe to the smoothed progress to update the number
    return smoothProgress.on("change", (latest) => {
      setPercent(Math.round(latest * 100));
    });
  }, [smoothProgress]);

  // Transform the 0-1 progress into a percentage for CSS height
  const fillHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
      {/* The Track line */}
      <div className="relative w-1.5 h-64 bg-white/10 rounded-full overflow-hidden">
        
        {/* The glowing fill bar */}
        <motion.div 
          className="absolute top-0 left-0 w-full rounded-full bg-gradient-to-b from-blue-400 to-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
          style={{ height: fillHeight }}
        />
        
      </div>
      
      {/* Number below */}
      <div className="text-[10px] font-mono text-white/50 w-full text-center tabular-nums">
        {percent}
      </div>
    </div>
  );
}