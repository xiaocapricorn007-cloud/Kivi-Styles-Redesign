import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint } from 'lucide-react';

/**
 * Interface for a single footprint instance.
 */
export interface Footprint {
  id: string;
  x: number;
  y: number;
  rotation: number;
  isRight: boolean;
  createdAt: number;
}

export interface FootprintManagerProps {
  /** If true, constrains the Stack overlay to its parent container instead of fixed full-screen */
  contained?: boolean;
  /** Spawn interval for each paw in milliseconds (default: 750ms) */
  spawnInterval?: number;
  /** How long each footprint takes to fade to 0% and be pruned (default: 5000ms) */
  fadeDuration?: number;
  /** Optional CSS class for the Stack container */
  className?: string;
}

/**
 * Stack component to ensure footprints sit on top of the existing UI
 * without breaking the DOM layout or interfering with clicks.
 */
export function Stack({
  children,
  contained = false,
  className = '',
}: {
  children: React.ReactNode;
  contained?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${
        contained ? 'absolute inset-0' : 'fixed inset-0'
      } pointer-events-none z-50 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

/**
 * FootprintManager handles the periodic timer spawning of cat paw prints,
 * simulating a natural trail walking across the screen, fading each footprint
 * from 100% to 0% opacity over 5 seconds before removing it from state.
 */
export default function FootprintManager({
  contained = false,
  spawnInterval = 750,
  fadeDuration = 5000,
  className = '',
}: FootprintManagerProps) {
  const [paws, setPaws] = useState<Footprint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable walker state kept in ref to ensure continuous smooth trail progression
  const walkerRef = useRef({
    x: 100,
    y: 200,
    angle: Math.PI / 6,
    isRight: false,
    initialized: false,
  });

  // Timer to periodically spawn cat paw icons across the screen
  useEffect(() => {
    // Initialize starting position near an edge or center
    const initWalker = () => {
      const w = containerRef.current?.clientWidth || window.innerWidth || 1000;
      const h = containerRef.current?.clientHeight || window.innerHeight || 700;

      // Start from a random screen entry point
      const startX = Math.random() < 0.5 ? 60 : w - 80;
      const startY = 100 + Math.random() * (h - 220);
      const targetAngle = startX < w / 2 ? (Math.random() - 0.5) * 0.8 : Math.PI + (Math.random() - 0.5) * 0.8;

      walkerRef.current = {
        x: startX,
        y: startY,
        angle: targetAngle,
        isRight: false,
        initialized: true,
      };
    };

    initWalker();

    const intervalId = setInterval(() => {
      const w = containerRef.current?.clientWidth || window.innerWidth || 1000;
      const h = containerRef.current?.clientHeight || window.innerHeight || 700;

      const walker = walkerRef.current;
      if (!walker.initialized) initWalker();

      // Step size (distance forward)
      const stepDist = 38 + Math.random() * 8;

      // Natural meandering turn (add slight random variation to heading)
      let newAngle = walker.angle + (Math.random() - 0.5) * 0.45;

      let nextX = walker.x + Math.cos(newAngle) * stepDist;
      let nextY = walker.y + Math.sin(newAngle) * stepDist;

      // Boundary deflection to keep trail meandering naturally on screen
      const padX = 60;
      const padY = 70;
      let bounced = false;

      if (nextX < padX || nextX > w - padX) {
        newAngle = Math.PI - newAngle + (Math.random() - 0.5) * 0.2;
        bounced = true;
      }
      if (nextY < padY || nextY > h - padY) {
        newAngle = -newAngle + (Math.random() - 0.5) * 0.2;
        bounced = true;
      }

      if (bounced) {
        nextX = walker.x + Math.cos(newAngle) * stepDist;
        nextY = walker.y + Math.sin(newAngle) * stepDist;
      }

      // Lateral offset for left/right cat paw walking gait
      const lateralOffset = 13;
      const perpAngle = newAngle + (walker.isRight ? Math.PI / 2 : -Math.PI / 2);
      const pawX = Math.max(20, Math.min(w - 20, nextX + Math.cos(perpAngle) * lateralOffset));
      const pawY = Math.max(20, Math.min(h - 20, nextY + Math.sin(perpAngle) * lateralOffset));
      const pawRotation = (newAngle * 180) / Math.PI + 90;

      // Update walker state
      walker.x = nextX;
      walker.y = nextY;
      walker.angle = newAngle;
      walker.isRight = !walker.isRight;

      // Generate new unique footprint
      const pawId = `paw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newPaw: Footprint = {
        id: pawId,
        x: pawX,
        y: pawY,
        rotation: pawRotation,
        isRight: walker.isRight,
        createdAt: Date.now(),
      };

      // Add to state
      setPaws(prev => [...prev, newPaw]);

      // Lifecycle: strictly remove from state after fadeDuration (5 seconds)
      setTimeout(() => {
        setPaws(prev => prev.filter(p => p.id !== pawId));
      }, fadeDuration);
    }, spawnInterval);

    return () => clearInterval(intervalId);
  }, [spawnInterval, fadeDuration]);

  return (
    <Stack contained={contained} className={className}>
      <div ref={containerRef} className="relative w-full h-full">
        <AnimatePresence>
          {paws.map(paw => (
            <motion.div
              key={paw.id}
              initial={{ opacity: 1, scale: 0.8 }}
              animate={{ opacity: 0, scale: 1.05 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{
                opacity: { duration: fadeDuration / 1000, ease: 'linear' },
                scale: { duration: 0.3, ease: 'easeOut' },
              }}
              style={{
                position: 'absolute',
                left: paw.x,
                top: paw.y,
                transform: `translate(-50%, -50%) rotate(${paw.rotation}deg)`,
                pointerEvents: 'none',
              }}
              className="select-none"
            >
              <div className="relative p-2 rounded-full">
                {/* Cat Paw Icon with Warm Amber Glow Styling */}
                <PawPrint className="w-6 h-6 text-orange-400/80 fill-orange-400/25 drop-shadow-[0_2px_8px_rgba(251,146,60,0.4)]" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Stack>
  );
}
