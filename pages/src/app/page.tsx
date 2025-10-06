"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, Rss, Book, Blocks, ArrowDown } from "lucide-react";
import RSSSection from "@/components/section/rss";

const floatingImages: string[] = [
  "cover/elaina-13.jpg",
  "cover/elaina-12.jpeg",
  "cover/elaina-7.jpeg",
  "cover/reviere-1.jpg",
  "cover/nu_chinh_1.png",
  "cover/nu_chinh_2.png",
  "cover/slime-12.png",
  "cover/slime-7.jpg",
];

interface Position {
  left: number;
  top: number;
}

interface AnimationPath {
  x: number[];
  y: number[];
  rotate: number[];
}

interface FloatingImageProps {
  src: string;
  position: Position;
  index: number;
}

const generateRandomPath = (): AnimationPath => {
  const radius = Math.random() * 30 + 15;
  return {
    x: [0, radius, -radius, 0],
    y: [0, -radius, radius, 0],
    rotate: [0, 8, -8, 0],
  };
};

const FloatingImage: React.FC<FloatingImageProps> = ({
  src,
  position,
  index,
}) => {
  const path = generateRandomPath();
  const duration = Math.random() * 12 + 18;
  const delay = index * 0.5;

  return (
    <motion.div
      className="absolute w-56 h-56 blur-[2px]"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{
        opacity: [0.08, 0.15, 0.08],
        scale: [0.7, 0.9, 0.7],
        x: path.x,
        y: path.y,
        rotate: path.rotate,
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        delay,
        ease: "easeInOut",
      }}
      style={{
        left: `${position.left}%`,
        top: `${position.top}%`,
      }}
    >
      <Image
        src={src}
        alt="Floating Background"
        fill
        className="rounded-3xl object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </motion.div>
  );
};

export default function Landing() {
  const rssSectionRef = useRef<HTMLDivElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const [imagePositions, setImagePositions] = useState<Position[]>([]);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  useEffect(() => {
    const calculatePositions = (): Position[] => {
      const positions: Position[] = [];
      const minSpacing = 28;
      const maxAttempts = 150;
      const gridSize = 10;

      const isValidPosition = (
        pos: Position,
        existingPositions: Position[],
      ): boolean => {
        return existingPositions.every((existing) => {
          const xDiff = Math.abs(existing.left - pos.left);
          const yDiff = Math.abs(existing.top - pos.top);
          return Math.sqrt(xDiff * xDiff + yDiff * yDiff) > minSpacing;
        });
      };

      floatingImages.forEach(() => {
        let newPosition: Position | null = null;
        let attempts = 0;

        while (!newPosition && attempts < maxAttempts) {
          attempts++;
          const gridX = Math.floor(Math.random() * gridSize);
          const gridY = Math.floor(Math.random() * gridSize);

          const candidatePosition: Position = {
            left: gridX * (100 / gridSize) + Math.random() * (100 / gridSize),
            top: gridY * (100 / gridSize) + Math.random() * (100 / gridSize),
          };

          if (
            isValidPosition(candidatePosition, positions) ||
            positions.length === 0
          ) {
            newPosition = candidatePosition;
          }
        }

        if (newPosition) {
          positions.push(newPosition);
        } else {
          positions.push({
            left: Math.random() * 80 + 10,
            top: Math.random() * 80 + 10,
          });
        }
      });

      return positions;
    };

    setImagePositions(calculatePositions());
  }, []);

  const scrollToRSS = () => {
    rssSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/70 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        {floatingImages.map((img, index) => (
          <FloatingImage
            key={index}
            src={`${img}`}
            position={imagePositions[index] || { left: 0, top: 0 }}
            index={index}
          />
        ))}
      </div>

      {/* Landing */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-7xl sm:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4 tracking-tight">
              VBT
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full" />
          </motion.div>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl sm:text-3xl mb-16 text-slate-300 font-light max-w-3xl mx-auto leading-relaxed"
          >
            Vietnamese Book Tracking RSS Feed Generator
          </motion.p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-500/20 transition-colors">
                <Rss className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Automated RSS Feeds
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Stay updated with the latest Vietnamese book publications
                through automated RSS feeds.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="bg-purple-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-purple-500/20 transition-colors">
                <Book className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Comprehensive Tracking
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Track new book registrations and releases seamlessly.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 hover:border-pink-500/50 transition-all duration-300"
            >
              <div className="bg-pink-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-pink-500/20 transition-colors">
                <Blocks className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Extendable</h3>
              <p className="text-slate-400 leading-relaxed">
                Easy to self-host by forking and configuring a few settings.
              </p>
            </motion.div>
          </motion.div>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg overflow-hidden"
            onClick={scrollToRSS}
            aria-label="Go to RSS Feeds"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Available Feeds
              <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>
      </motion.section>

      {/* RSS Feeds Section */}
      <RSSSection sectionRef={rssSectionRef} />

      {/* About */}
      <section
        ref={aboutSectionRef}
        className="min-h-screen flex items-center justify-center px-4 py-1.5"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center p-10 bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl rounded-3xl border border-slate-700/50 z-10"
        >
          <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            About VBT
          </h2>
          <p className="text-xl mb-10 text-slate-300 leading-relaxed">
            VBT is an RSS Feed Generator for Tracking Vietnamese Book Publishing
            Registrations. It uses GitHub Actions to automatically generate and
            update RSS feeds, making it easy to stay informed about new book
            registrations in Vietnam.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="https://github.com/Irilith/VBT"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-slate-800 px-8 py-4 rounded-xl font-semibold hover:bg-slate-700 transition-all duration-300 border border-slate-700 hover:border-slate-600"
            >
              <Github size={24} /> View on GitHub
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <footer className="relative z-10 py-8 border-t border-slate-800/50">
        <div className="text-center">
          <p className="text-slate-400">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/Irilith/VBT/blob/main/LICENSE"
              className="hover:text-blue-400 transition-colors"
            >
              GNU General Public License v3.0
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
