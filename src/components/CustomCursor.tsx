"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] hidden lg:flex items-center justify-center mix-blend-screen"
      animate={{ x: mousePosition.x - 16, y: mousePosition.y - 16 }}
      transition={{ type: "tween", ease: "backOut", duration: 0.2 }}
    >
       <div className="relative flex items-center justify-center opacity-80">
          <div className="absolute w-[2px] h-4 bg-electric shadow-[0_0_10px_#00E5FF]" />
          <div className="absolute h-[2px] w-4 bg-electric shadow-[0_0_10px_#00E5FF]" />
       </div>
    </motion.div>
  );
}
