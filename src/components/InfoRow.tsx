import React, { type ReactNode } from "react";
import { statusClasses, statusLabel } from "./AnimeCard";


// 1. Define the interface for the component props
interface InfoRowProps {
  icon?: ReactNode; // Optional icon element
  label: string; // Required label text
  value: string | number | ReactNode; // Can be a string, number or a React element (like a badge)
  className?: string; // Optional custom classes
  valueClassName?: string; // new: allow custom value classes
}

/**
 * Reusable InfoRow Component (TypeScript)
 */
export const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  className = "",
}) => {
  // Only compute status classes when this row represents a status and value is a string
  const badgeCls =
    typeof value === "string" && label.toLowerCase() === "status"
      ? statusClasses(value)
      : "";

  return (
    <div
      className={`grid grid-cols-2 justify-between items-start gap-2 my-2 lg:my-0 ${className}`}
    >
      {/* Left Side: Icon + Label */}
      <div className="flex items-center gap-3 text-muted-foreground">
        {/* Render the icon if provided */}
        {icon && <span className="shrink-0 opacity-70">{icon}</span>}

        <label className="text-sm font-medium leading-tight peer-disabled:cursor-not-allowed opacity-70 peer-disabled:opacity-70 flex-1 line-clamp-2">
          {label}
        </label>
      </div>

      {/* Right Side: Value */}
      <div className="flex-1 text-right">
        <div
          className={`inline-flex truncate items-center text-[14px] wrap-break-word font-semibold ${badgeCls}`}
        >
          {typeof value === "string" ? statusLabel(value) : value}
        </div>
      </div>
    </div>
  );
};
