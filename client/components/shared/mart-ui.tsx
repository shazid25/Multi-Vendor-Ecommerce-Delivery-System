"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Glass Card ──────────────────────────────────────────────────────────────

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function GlassCard({ children, className, delay = 0, hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        "relative rounded-2xl border border-white/20 dark:border-white/10",
        "bg-white/60 dark:bg-white/5 backdrop-blur-xl",
        "shadow-lg hover:shadow-xl transition-shadow duration-300",
        className
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ─── Bento Grid ──────────────────────────────────────────────────────────────

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function BentoGrid({ children, className, columns = 4 }: BentoGridProps) {
  const colsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid grid-cols-1 gap-6", colsClass[columns], className)}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: index * 0.08,
            ease: "easeOut",
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Bento Card ──────────────────────────────────────────────────────────────

interface BentoCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { direction: "up" | "down"; value: number };
  className?: string;
  gradient?: string;
}

export function BentoCard({
  title,
  value,
  icon,
  trend,
  className,
  gradient = "from-blue-500/10 to-purple-500/10",
}: BentoCardProps) {
  return (
    <GlassCard className={cn("p-6", className)}>
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-50`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-sm font-medium flex items-center gap-1",
                  trend.direction === "up" ? "text-emerald-500" : "text-red-500"
                )}
              >
                {trend.direction === "up" ? "↑" : "↓"} {trend.value}%
                <span className="text-muted-foreground font-normal">vs last month</span>
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
            {icon}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Tilt Card ───────────────────────────────────────────────────────────────

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export function TiltCard({ children, className }: TiltCardProps) {
  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((y - centerY) / centerY) * 8);
    setRotateY(((centerX - x) / centerX) * 8);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn("transition-transform duration-200", className)}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated Timeline ──────────────────────────────────────────────────────

interface TimelineItem {
  status: string;
  timestamp: string;
  description: string;
  completed?: boolean;
}

interface AnimatedTimelineProps {
  items: TimelineItem[];
}

export function AnimatedTimeline({ items }: AnimatedTimelineProps) {
  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="flex gap-4"
        >
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 500 }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md",
                item.completed
                  ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                  : "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-muted-foreground"
              )}
            >
              {item.completed ? "✓" : index + 1}
            </motion.div>
            {index < items.length - 1 && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className={cn(
                  "w-0.5 h-12 origin-top",
                  item.completed
                    ? "bg-gradient-to-b from-emerald-400 to-emerald-200 dark:to-emerald-800"
                    : "bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700"
                )}
              />
            )}
          </div>
          <div className="pt-1.5 pb-6">
            <h4 className="font-semibold text-sm">{item.status}</h4>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{item.timestamp}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Page Transition ────────────────────────────────────────────────────────

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Stat Card (for dashboards) ─────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { direction: "up" | "down"; value: number };
  gradient?: string;
}

export function StatCard({ title, value, icon, trend, gradient }: StatCardProps) {
  return (
    <TiltCard>
      <BentoCard
        title={title}
        value={value}
        icon={icon}
        trend={trend}
        gradient={gradient}
      />
    </TiltCard>
  );
}

