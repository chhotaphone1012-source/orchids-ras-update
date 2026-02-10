"use client";

import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const NAVBAR_PAGES = ["/", "/games", "/leadership"];

export function RootProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = NAVBAR_PAGES.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`min-h-screen ${showNavbar ? "pt-16" : ""}`}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Toaster position="top-center" richColors />
    </>
  );
}
