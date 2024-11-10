"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Rss, Book, Blocks } from "lucide-react";
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
  const radius = Math.random() * 20 + 10;
  return {
    x: [0, radius, -radius, 0],
    y: [0, -radius, radius, 0],
    rotate: [0, 5, -5, 0],
  };
};

const FloatingImage: React.FC<FloatingImageProps> = ({
  src,
  position,
  index,
}) => {
  const path = generateRandomPath();
  const duration = Math.random() * 10 + 15;
  const delay = index * 0.7;

  return (
    <motion.div
      className="absolute w-48 h-48 blur-sm"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.1, 0.2, 0.1],
        scale: [0.8, 1, 0.8],
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
        className="rounded-2xl object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </motion.div>
  );
};

export default function Landing() {
  const rssSectionRef = useRef<HTMLDivElement>(null);
  const [imagePositions, setImagePositions] = useState<Position[]>([]);

  useEffect(() => {
    const calculatePositions = (): Position[] => {
      const positions: Position[] = [];
      const minSpacing = 25;
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

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/80" />
        {floatingImages.map((img, index) => (
          <FloatingImage
            key={index}
            src={`${img}`}
            position={imagePositions[index] || { left: 0, top: 0 }}
            index={index}
          />
        ))}
      </div>

      {/* Short Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl sm:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-8"
          >
            VBT
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl mb-12"
          >
            Vietnamese Book Tracking RSS Feed Generator
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <Rss className="w-12 h-12 mb-4 mx-auto text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">
                Automated RSS Feeds
              </h3>
              <p>
                Stay updated with the latest Vietnamese book publications
                through VBT&apos;s automated RSS feeds.
              </p>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <Book className="w-12 h-12 mb-4 mx-auto text-purple-400" />
              <h3 className="text-xl font-semibold mb-2">
                Comprehensive Tracking
              </h3>
              <p>Track new book registrations, releases.</p>
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <Blocks className="w-12 h-12 mb-4 mx-auto text-green-400" />
              <h3 className="text-xl font-semibold mb-2">Extendable</h3>
              <p>Easy to selfhost just by forks this and setting few things</p>
            </motion.div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="px-8 py-4 bg-blue-600 rounded-lg font-semibold text-lg"
            onClick={scrollToRSS}
            aria-label="Go to RSS Feeds"
          >
            Explore available Feeds
          </motion.button>
        </div>
      </section>

      {/* RSS Feeds Section */}
      <RSSSection sectionRef={rssSectionRef} />

      {/* About Section */}
      <section className="min-h-screen relative flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center p-8 bg-gray-900 bg-opacity-80 rounded-xl z-10">
          <h2 className="text-4xl font-bold mb-6">About VBT</h2>
          <p className="text-xl mb-8">
            VBT is an RSS Feed Generator for Tracking Vietnamese Book Publishing
            Registrations. It uses GitHub Actions to automatically generate and
            update RSS feeds, making it easy to stay informed about new book
            registrations in Vietnam.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="https://github.com/Irilith/VBT"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              <Github size={24} /> View on GitHub
            </Link>
          </motion.div>
        </div>
      </section>
      <footer>
        <div className="text-center">
          <p className="mb-4">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/Irilith/VBT/blob/main/LICENSE"
            >
              {" "}
              GNU General Public License v3.0
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
