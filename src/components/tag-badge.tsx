interface TagBadgeProps {
  tag: {
    name: string;
    color: string | null;
  };
  onClick?: () => void;
  className?: string;
}

export function TagBadge({ tag, onClick, className = "" }: TagBadgeProps) {
  const bgColor = tag.color || "#2563eb";

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-1 font-medium text-white text-xs ${className} ${
        onClick ? "cursor-pointer transition-opacity hover:opacity-80" : ""
      }`}
      onClick={onClick}
      style={{ backgroundColor: bgColor }}
    >
      {tag.name}
    </span>
  );
}
