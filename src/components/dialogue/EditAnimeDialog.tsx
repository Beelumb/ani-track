import { useState, useRef, useEffect } from "react"; // Import useRef, useEffect
import type { UserAnime } from "../../types/animeTypes";
import { ChevronDown, X, Trash2 } from "lucide-react"; // ChevronDown is still needed
import CustomNumberInput from "../CustomNumberInput";
// Import the icons and colors from your config file (adjust path if needed)
import { statusConfig, STATUS_OPTIONS } from "../../config/statusConfig";


// Define the options list based on your statusConfig keys


export default function EditAnimeDialog({
  anime,
  onClose,
  onSave,
  onDelete,
}: {
  anime: UserAnime;
  onClose: () => void;
  onSave: (id: number, data: Partial<UserAnime>) => void;
  onDelete: (id: number) => void;
}) {
  const [status, setStatus] = useState(anime.status);
  const [score, setScore] = useState(anime.score || 0);
  const [watched, setWatched] = useState(anime.episodes_watched || 0);
  
  // New state for custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSave = () => {
    onSave(anime.mal_id, {
      status,
      score: Number(score),
      episodes_watched: Number(watched),
    });
  };

  const handleDeleteClick = () => {
    onDelete(anime.mal_id);
    onClose();
  };

  // Get the config for the currently selected status
  const currentStatusConfig = statusConfig[status];
  const currentStatusLabel = STATUS_OPTIONS.find(o => o.value === status)?.label || status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-black border border-border rounded-xl p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-white line-clamp-1 pr-4">
            {anime.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* --- CUSTOM STATUS DROPDOWN --- */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              List
            </label>
            
            {/* Dropdown Trigger Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between bg-secondary/20 border border-border rounded-lg px-3 py-2.5 text-left transition-colors ${currentStatusConfig ? `${currentStatusConfig.bgColor} ${currentStatusConfig.borderColor}` : ''}`}
            >
              <div className="flex items-center gap-2">
                 {/* Show icon of current status if it exists */}
                 {currentStatusConfig && (
                   <div className={`flex h-5 w-5 items-center justify-center ${currentStatusConfig.color}`}>
                     {currentStatusConfig.icon}
                   </div>
                 )}
                <span className={`font-medium ${currentStatusConfig ? currentStatusConfig.color : 'text-white'}`}>
                  {currentStatusLabel}
                </span>
              </div>
              {/* Keep your existing ChevronDown */}
              <ChevronDown
                className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                size={16}
              />
            </button>

            {/* Dropdown Options List */}
            {isDropdownOpen && (
              <div className="absolute z-50 top-full left-0 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-secondary/30 p-2 backdrop-blur-md font-sans">
                <div className="flex flex-col gap-1">
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = status === option.value;
                    const config = statusConfig[option.value];
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setStatus(option.value);
                          setIsDropdownOpen(false);
                        }}
                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-secondary"
                      >
                        {/* Checkbox Logic */}
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-sm border transition ${
                            isSelected
                              ? "border-green-500 bg-green-500/10" // Selected style
                              : "border-white/20 group-hover:border-white/40" // Unselected style
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2.5 w-2.5 rounded-sm bg-green-500" />
                          )}
                        </div>

                        {/* Status Icon & Label */}
                        {config && (
                           <div className={`flex h-6 w-6 items-center justify-center rounded-md border ${config.bgColor} ${config.color} ${config.borderColor}`}>
                             {config.icon}
                           </div>
                        )}
                        
                        <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-300"}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {/* --- END CUSTOM DROPDOWN --- */}

          <div className="grid grid-cols-2 gap-4">
            <CustomNumberInput
              label="Score"
              value={score}
              onChange={setScore}
              min={0}
              max={10}
            />

            <CustomNumberInput
              label="Episodes"
              value={watched}
              onChange={setWatched}
              min={0}
              max={anime.episodes_total || 9999}
            />
          </div>
        </div>

        {/* Footer Buttons (Unchanged) */}
        <div className="flex items-center justify-end mt-8 pt-4 border-t border-border">
          <button
            onClick={handleDeleteClick}
            className="flex items-center gap-2 px-4 py-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 size={16} /> Delete
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 ml-3  text-primary-foreground border border-primary-border hover:bg-primary-border  rounded-lg transition-all text-sm font-bold shadow-[0_0_10px_rgba(236,72,153,0.1)]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}