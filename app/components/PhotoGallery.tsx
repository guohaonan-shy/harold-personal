"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Lightbox from "./Lightbox";
import DecryptedText from "./DecryptedText";

interface Photo {
  src: string;
  filename: string;
}

const photos: Photo[] = [
  { src: "https://media.haroldguo.com/gallery/img1.jpg", filename: "phillip-island/road" },
  { src: "https://media.haroldguo.com/gallery/img2.jpg", filename: "great-ocean-road/twelve-apostles" },
  { src: "https://media.haroldguo.com/gallery/img3.jpg", filename: "melbourne/hosier-lane" },
  { src: "https://media.haroldguo.com/gallery/img4.jpg", filename: "yarra-valley/rochford-wines" },
  { src: "https://media.haroldguo.com/gallery/img5.jpg", filename: "phillip-island/seal-rocks" },
  { src: "https://media.haroldguo.com/gallery/img6.jpg", filename: "great-ocean-road/gibson-steps" },
];

export default function PhotoGallery() {
  const t = useTranslations("gallery");
  const tAbout = useTranslations("about");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section className="bg-gradient-section border-t border-light">
      <div className="max-w-7xl mx-auto px-8 lg:px-[120px] py-16">
        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 max-w-2xl"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-main leading-[1.15] tracking-tight mb-4">
            <DecryptedText text={tAbout("greeting")} speed={40} maxIterations={15} />
          </h1>
          <p className="text-lg text-dim leading-[1.8]">
            {tAbout.rich("bio", {
              green: (chunks) => (
                <span className="text-terminal-green italic">{chunks}</span>
              ),
            })}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.filename}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
              className="rounded-xl overflow-hidden border border-light bg-card cursor-pointer group"
              onClick={() => setLightboxIndex(index)}
            >
              {/* Terminal Header */}
              <div className="flex items-center gap-2 h-8 px-3 border-b border-main">
                <div className="w-2 h-2 rounded-full bg-terminal-red" />
                <div className="w-2 h-2 rounded-full bg-terminal-yellow" />
                <div className="w-2 h-2 rounded-full bg-terminal-green" />
                <span className="ml-1 text-[10px] font-mono text-dim">~/{photo.filename}</span>
              </div>

              {/* Photo */}
              <div className="relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.filename}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 pointer-events-none bg-scanline opacity-[0.03]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          isOpen={true}
          onClose={() => setLightboxIndex(null)}
          src={photos[lightboxIndex].src}
          alt={photos[lightboxIndex].filename}
        />
      )}
    </section>
  );
}
