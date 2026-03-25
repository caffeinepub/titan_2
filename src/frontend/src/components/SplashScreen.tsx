import { motion } from "motion/react";

export function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)",
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Logo badge */}
      <motion.div
        className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-2xl"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <span className="text-primary-foreground font-black text-4xl select-none">
          T
        </span>
      </motion.div>

      {/* App name */}
      <motion.p
        className="mt-5 text-2xl font-black tracking-[0.25em] text-white select-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        TITAN
      </motion.p>

      {/* Spinner */}
      <motion.div
        className="mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-white/15 border-t-primary animate-spin" />
      </motion.div>
    </motion.div>
  );
}
