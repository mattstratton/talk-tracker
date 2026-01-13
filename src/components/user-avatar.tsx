"use client";

import { useState } from "react";

interface UserAvatarProps {
  name: string;
  image: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function UserAvatar({
  name,
  image,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initial = name.charAt(0).toUpperCase();
  const sizeClass = sizeClasses[size];

  // If no image or image failed to load, show initials
  if (!image || imageError) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600 ${sizeClass} ${className}`}
      >
        {initial}
      </div>
    );
  }

  // Try to load the image, fall back to initials on error
  return (
    <img
      src={image}
      alt={name}
      className={`rounded-full ${sizeClass} ${className}`}
      onError={() => setImageError(true)}
    />
  );
}
