import React from "react";
import { motion } from "motion/react";

export default function FullScreenLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#212122] lg:bg-[var(--bg-primary)] overflow-hidden"
    >
      <img
        src="https://i.imgur.com/dChuRQH.gif"
        alt="Loading..."
        className="w-full h-auto lg:w-[100vw] lg:h-[100vh] lg:object-cover pointer-events-none"
      />
    </motion.div>
  );
}
