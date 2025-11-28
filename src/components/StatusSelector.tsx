import { useState, useRef, useEffect } from "react";
// 1. Import the shared config
import { statusConfig, STATUS_OPTIONS } from "../config/statusConfig";

interface StatusSelectorProps {
  currentStatus: string | null;
  isLoading: boolean;
  onChange: (status: string) => void;
}

export function StatusSelector({
  currentStatus,
  isLoading,
  onChange,
}: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<"top" | "bottom">("bottom");
  const containerRef = useRef<HTMLDivElement>(null);

  // 2. Get the active config object based on the current status string
  const activeConfig = currentStatus ? statusConfig[currentStatus] : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If space below is less than ~220px, pop UP
      if (spaceBelow < 220) {
        setDropdownPos("top");
      } else {
        setDropdownPos("bottom");
      }
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (statusValue: string) => {
    onChange(statusValue);
    setIsOpen(false);
  };

  // 3. Determine dynamic classes using the config
  const buttonContainerClass = activeConfig
    ? `${activeConfig.bgColor} border ${activeConfig.borderColor} ${activeConfig.color}`
    : "bg-secondary border-white/10 text-white hover:bg-secondary/80";

  return (
    <div className="relative w-full font-sans" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 transition disabled:opacity-50 ${buttonContainerClass} ${
          isOpen && !activeConfig ? "bg-secondary/80" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          {activeConfig ? (
            <div className="flex h-5 w-5 items-center justify-center">
              {activeConfig.icon}
            </div>
          ) : (
            // Default Plus Icon
            <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-white/20 bg-white/5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
          )}

          <span className="font-medium">
            {activeConfig ? activeConfig.label : "Add to List"}
          </span>
        </div>

        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-200 ${
            activeConfig ? "opacity-80" : "text-gray-400"
          } ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 z-50 w-full overflow-hidden rounded-xl border border-white/10 bg-secondary/30 p-2 backdrop-blur-md
          ${dropdownPos === "top" ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          <div className="flex flex-col gap-1">
            {/* 4. Iterate over the centralized OPTIONS list */}
            {STATUS_OPTIONS.map((item) => {
              const config = statusConfig[item.value];
              const isSelected = currentStatus === item.value;

              if (!config) return null;

              return (
                <button
                  key={item.value}
                  onClick={() => handleSelect(item.value)}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-secondary"
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-sm border transition ${
                      isSelected
                        ? "border-green-500 bg-green-500/10"
                        : "border-white/20 group-hover:border-white/40"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2.5 w-2.5 rounded-default bg-green-500" />
                    )}
                  </div>

                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-md border ${config.bgColor} ${config.color} ${config.borderColor}`}
                  >
                    {config.icon}
                  </div>

                  <span
                    className={`text-sm font-medium ${
                      isSelected ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}