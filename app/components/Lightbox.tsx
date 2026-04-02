"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

export default function Lightbox({ isOpen, onClose, src, alt }: LightboxProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.85)",
            cursor: "zoom-out",
            padding: "2rem",
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={28} />
          </button>
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={src}
            alt={alt || ""}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "12px",
              cursor: "default",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
