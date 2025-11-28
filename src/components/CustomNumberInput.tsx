import { ChevronDown, ChevronUp } from "lucide-react";

export default function CustomNumberInput({ 
  label, 
  value, 
  onChange, 
  min, 
  max 
}: { 
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
  min: number; 
  max: number; 
}) {
  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
      <div className="relative group">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            let val = Number(e.target.value);
            // Clamp value between min and max manually if typed
            if (val > max) val = max;
            if (val < min) val = min;
            onChange(val);
          }}
          // Note: "appearance-none" in Tailwind helps, but the CSS in Step 1 is safer
          className="w-full bg-secondary/20 text-white border border-border rounded-lg px-3 py-2.5 focus:outline-none focus:border-white appearance-none"
        />
        
        {/* Custom Arrows Container */}
        <div className="absolute right-1 top-1 bottom-1 flex flex-col w-6 border-l border-white/10">
          <button
            onClick={handleIncrement}
            className="flex-1 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-tr-md transition-colors"
            tabIndex={-1} // Prevents tabbing to the tiny buttons
          >
            <ChevronUp size={12} />
          </button>
          <button
            onClick={handleDecrement}
            className="flex-1 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-br-md transition-colors"
            tabIndex={-1}
          >
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}