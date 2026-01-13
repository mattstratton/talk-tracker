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
      className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium text-white ${className} ${
        onClick ? "cursor-pointer transition-opacity hover:opacity-80" : ""
      }`}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
    >
      {tag.name}
    </span>
  );
}
