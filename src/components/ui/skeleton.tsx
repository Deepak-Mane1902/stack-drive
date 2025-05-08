import React from "react";
import clsx from "clsx"; // Helper to merge Tailwind classes conditionally

type SkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={clsx("bg-gray-300 animate-pulse rounded", className)}
      style={style}
    />
  );
}
