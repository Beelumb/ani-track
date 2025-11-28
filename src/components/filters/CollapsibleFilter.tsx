import { useState, useEffect } from "react";
import type { ReactNode } from "react";

// --- Reusable SVG Icons ---
import { ChevronUpIcon } from "../../icons/icons";
import { ChevronDownIcon } from "../../icons/icons";

// Replicating the icons from your provided HTML for a complete component.

// --- TypeScript Interface for Props ---
interface CollapsibleFilterBaseProps {
  label: string;
  icon?: ReactNode;
  options: string[];
  defaultOpen?: boolean;
  className?: string;
}

// We create a specific set of props for a SINGLE-SELECT filter.
interface CollapsibleFilterSingleProps extends CollapsibleFilterBaseProps {
  multiSelect?: false; // The "discriminant"
  selected: string | null;
  onSelect: (selection: string | null) => void;
}

// We create a specific set of props for a MULTI-SELECT filter.
interface CollapsibleFilterMultiProps extends CollapsibleFilterBaseProps {
  multiSelect: true; // The "discriminant"
  selected: string[];
  onSelect: (selection: string[]) => void;
}

// The final Prop type is a UNION of the two specific types.
// TypeScript will now enforce that if multiSelect=true,
// 'selected' and 'onSelect' MUST match the MultiProps.
type CollapsibleFilterProps =
  | CollapsibleFilterSingleProps
  | CollapsibleFilterMultiProps;

// --- The Reusable CollapsibleFilter Component ---
// This is based on the HTML structure you provided.
export default function CollapsibleFilter(props: CollapsibleFilterProps) {
  // Destructure common props
  const { label, icon, options, defaultOpen = false, className = "" } = props;

  // State for open/closed status
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // We use useEffect to set the `data-state` *after* mount
  // to prevent server-side rendering mismatches if `defaultOpen` is true.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dataState = isMounted
    ? isOpen
      ? "open"
      : "closed"
    : defaultOpen
    ? "open"
    : "closed";

  const handleSelect = (option: string) => {
    // Because of our new prop type, TypeScript now understands
    // that if 'props.multiSelect' is true, then 'props.selected'
    // is a string[] and 'props.onSelect' expects a string[].
    if (props.multiSelect) {
      // Handle multi-select logic
      const currentSelection = props.selected || [];
      let newSelection;
      if (currentSelection.includes(option)) {
        newSelection = currentSelection.filter((item) => item !== option);
      } else {
        newSelection = [...currentSelection, option];
      }
      props.onSelect(newSelection);
    } else {
      // ...and if 'props.multiSelect' is false, then 'props.selected'
      // is a string|null and 'props.onSelect' expects a string|null.
      // This is what fixes your error!
      const newSelection = props.selected === option ? null : option;
      props.onSelect(newSelection);
    }
  };

  // Helper to determine if an option is currently selected
  const isSelected = (option: string) => {
    // This logic is now also perfectly type-safe.
    if (props.multiSelect) {
      return (props.selected || []).includes(option);
    }
    return props.selected === option;
  };

  // We use Tailwind classes to style the filter pills based on selection.
  const getButtonClass = (option: string) => {
    const baseClasses =
      "inline-flex gap-2 hover:cursor-pointer items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 px-3.5 py-1 text-xs rounded-full";

    if (isSelected(option)) {
      // Selected state style (e.g., solid blue)
      return `${baseClasses} bg-background text-accent border border-primary-border hover:bg-primary-border`;
    } else {
      // Default state style from your HTML
      return `${baseClasses} bg-secondary/20 border border-border hover:bg-secondary hover:text-secondary-foreground`;
    }
  };

  return (
    <div
      // This replicates all the complex state-based classes from your HTML
      data-state={dataState}
      className={`group border border-border bg-secondary/20 duration-200 data-[state=open]:mb-4 data-[state=open]:rounded-lg data-[state=open]:py-4 data-[state=closed]:border-b-0 data-[state=closed]:has-[+div[data-state=open]]:mb-4 data-[state=closed]:has-[+div[data-state=open]]:rounded-b-lg data-[state=closed]:has-[+div[data-state=open]]:border-b first:rounded-t-lg last:rounded-b-lg last:border-b! px-4 ${
        isOpen ? "py-4" : "py-2"
      } ${className}`}
    >
      {/* --- Header / Trigger --- */}
      <div
        className="flex cursor-pointer items-center justify-between gap-2"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && setIsOpen(!isOpen)
        }
      >
        <div className="flex items-center gap-2">
          {icon}
          <label className="text-sm font-medium leading-tight cursor-pointer select-none">
            {label}
          </label>
        </div>
        <button
          type="button"
          aria-label={isOpen ? "Collapse section" : "Expand section"}
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-8 w-8 [&_svg]:size-4"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </div>

      {/* --- Collapsible Content (with smooth animation) --- */}
      <div
        data-state={dataState}
        className={`w-full grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          {" "}
          {/* Inner div required for grid animation */}
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={getButtonClass(option)}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
