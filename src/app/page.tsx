"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";
import { ChevronDown, DoorOpen, Clock, Users, ShoppingCart, Car, Navigation, ArrowRight } from "lucide-react";
import Link from "next/link";

function AnimatedNumber({ value, suffix = "", decimal = false }: { value: number, suffix?: string, decimal?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  
  useEffect(() => {
    if (inView && ref.current) {
      const controls = animate(0, value, {
        duration: 2.5,
        ease: "easeOut",
        onUpdate(v) {
          if (ref.current) {
             ref.current.textContent = `${decimal ? v.toFixed(1) : Math.floor(v).toLocaleString()}${suffix}`;
          }
        }
      });
      return () => controls.stop();
    }
  }, [inView, value, suffix, decimal]);

  return <span ref={ref}>0{suffix}</span>;
}

function StadiumBackground() {
  const dots = Array.from({ length: 250 }).map((_, i) => {
    // Generate random positions within an oval stadium shape
    const angle = Math.random() * Math.PI * 2;
    // Keep dots out of the center pitch
    const innerRadiusX = 180;
    const innerRadiusY = 90;
    const outerRadiusX = 450;
    const outerRadiusY = 250;
    
    // Scale randomly between inner and outer
    const scalar = Math.sqrt(Math.random()); 
    const radiusX = innerRadiusX + (outerRadiusX - innerRadiusX) * scalar;
    const radiusY = innerRadiusY + (outerRadiusY - innerRadiusY) * scalar;
    
    const cx = 500 + Math.cos(angle) * radiusX;
    const cy = 300 + Math.sin(angle) * radiusY;
    
    // Density colors logic
    const rand = Math.random();
    // 5% red (crowded), 15% amber (medium), 80% green (smooth)
    const color = rand > 0.95 ? "#EF4444" : rand > 0.8 ? "#FFB830" : "#00F0A0"; 
    const delay = Math.random() * 3;
    const duration = 1.5 + Math.random() * 2.5;

    return (
      <motion.circle
        key={i}
        cx={cx}
        cy={cy}
        r={1.5 + Math.random() * 2}
        fill={color}
        initial={{ opacity: 0.1 }}
        animate={{ opacity: [0.1, 0.8, 0.1] }}
        transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  });

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-40">
      <svg viewBox="0 0 1000 600" className="w-[120%] md:w-full h-[120%] md:h-full max-w-6xl object-cover" preserveAspectRatio="xMidYMid slice">
         {/* Pitch area */}
         <ellipse cx="500" cy="300" rx="150" ry="75" className="fill-surface/50 stroke-glass stroke-2" />
         <rect x="400" y="250" width="200" height="100" className="fill-none stroke-glass/50 stroke-[0.5]" />
         <circle cx="500" cy="300" r="25" className="fill-none stroke-glass/50 stroke-[0.5]" />
         <path d="M 500 250 L 500 350" className="stroke-glass/50 stroke-[0.5]" />
         {dots}
      </svg>
      {/* Vignette fade to edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#080C1A_80%)]" />
    </div>
  );
}

export default function Home() {
  const headline = "Every fan. Every moment. Perfectly coordinated.";
  const words = headline.split(" ");

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 80, damping: 20 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-navy overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full h-[100vh] flex flex-col justify-center items-center overflow-hidden pt-16">
        <StadiumBackground />
        
        <div className="container relative mx-auto px-4 flex flex-col items-center justify-center text-center z-10 -mt-16">
          <motion.h1 
            variants={container} 
            initial="hidden" 
            animate="show"
            className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading tracking-tight text-white max-w-5xl leading-[1.1] mb-6"
          >
            {words.map((word, i) => (
              <motion.span key={i} variants={item} className="inline-block mr-3 md:mr-4">
                {word === "Perfectly" ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-green">{word}</span>
                ) : word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-400 font-body max-w-2xl mb-10"
          >
            AI-powered crowd intelligence for 70,000+ capacity venues
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link 
              href="/demo" 
              className="px-8 py-3 rounded-full bg-electric text-navy font-semibold text-lg tracking-wide hover:bg-electric/90 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              See live demo
            </Link>
            <Link 
              href="/how-it-works" 
              className="px-8 py-3 rounded-full border border-glass bg-surface/30 backdrop-blur-sm text-white font-semibold text-lg tracking-wide hover:bg-surface/60 hover:border-gray-500 transition-all w-full sm:w-auto"
            >
              How it works
            </Link>
          </motion.div>
        </div>

        {/* Bouncing Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
             animate={{ y: [0, 10, 0] }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 opacity-60" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar Section */}
      <section className="relative z-20 border-y border-glass bg-surface/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x divide-glass/0 md:divide-glass">
            
            <div className="flex flex-col items-center justify-center text-center px-4 space-y-2">
              <span className="text-4xl md:text-5xl font-heading font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                <AnimatedNumber value={52000} />
              </span>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Attendees</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-4 space-y-2 border-l border-glass md:border-l-0">
              <span className="text-4xl md:text-5xl font-heading font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                <AnimatedNumber value={4.2} suffix=" min" decimal />
              </span>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Avg Wait</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-4 space-y-2 pt-8 md:pt-0 border-t border-glass md:border-t-0">
              <span className="text-4xl md:text-5xl font-heading font-bold text-electric drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <AnimatedNumber value={96} suffix="%" />
              </span>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Flow Score</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-4 space-y-2 pt-8 md:pt-0 border-t border-glass border-l md:border-t-0">
              <span className="text-4xl md:text-5xl font-heading font-bold text-amber drop-shadow-[0_0_15px_rgba(255,184,48,0.2)]">
                <AnimatedNumber value={3} />
              </span>
              <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Active Alerts</span>
            </div>

          </div>
        </div>
      </section>

      {/* Problems We Solve Section */}
      <section className="relative py-24 bg-navy z-10 overflow-hidden">
        {/* Background glow for section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-3xl md:text-5xl font-heading font-bold text-white"
            >
              The bottlenecks <span className="text-electric">we eliminate</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 font-body text-lg max-w-2xl mx-auto"
            >
              Traditional stadiums operate blindly. FlowVenue provides the predictive intelligence to resolve chokepoints before they happen.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {[
              { 
                icon: DoorOpen, title: "Gate congestion", desc: "Turnstile bottlenecks delay thousands", 
                statOne: "12 min wait", statTwo: "90 sec" 
              },
              { 
                icon: Clock, title: "Washroom rush", desc: "Break-time queues steal match time", 
                statOne: "15 min lost", statTwo: "3 min" 
              },
              { 
                icon: Users, title: "Lost companions", desc: "Finding friends wastes precious time", 
                statOne: "Manual search", statTwo: "Live pin" 
              },
              { 
                icon: ShoppingCart, title: "Seller stockouts", desc: "Empty stalls cause crowd clustering", 
                statOne: "Surprise stockout", statTwo: "Pre-warned" 
              },
              { 
                icon: Car, title: "Post-match gridlock", desc: "Everyone leaves at once", 
                statOne: "45 min exit", statTwo: "12 min" 
              },
              { 
                icon: Navigation, title: "Cab surge overload", desc: "Uber surge pricing spikes 3x", 
                statOne: "3x surge", statTwo: "Coordinated" 
              }
            ].map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-surface/40 border border-glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:border-electric/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)] flex flex-col justify-between h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-glass to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-electric/10 flex items-center justify-center border border-electric/20 group-hover:border-electric/50 transition-colors">
                    <problem.icon className="w-6 h-6 text-electric transition-transform group-hover:rotate-6 group-hover:scale-110" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white mb-2">{problem.title}</h3>
                    <p className="text-gray-400 font-body text-sm leading-relaxed">{problem.desc}</p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-glass flex items-center justify-between text-sm font-semibold">
                  <span className="text-amber/80 line-through decoration-amber/30">{problem.statOne}</span>
                  <ArrowRight className="w-4 h-4 text-gray-500 mx-2" />
                  <span className="text-green bg-green/10 px-2 py-1 rounded-md">{problem.statTwo}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacer to allow scrolling to see inView animations if needed */}
      <div className="h-[10vh] bg-navy" />
    </div>
  );
}
