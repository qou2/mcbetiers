"use client"
import { cn } from "@/lib/utils"
import { GameModeIcon } from "./GameModeIcon"

interface GameModeSelectorProps {
  selectedMode: string
  onSelectMode: (mode: string) => void
}

export function GameModeSelector({ selectedMode = "overall", onSelectMode }: GameModeSelectorProps) {
  // Define all game modes - EDIT THIS ARRAY TO CHANGE GAMEMODES
  const gameModes = [
    { id: "overall", label: "Overall" },
    { id: "skywars", label: "Skywars" },
    { id: "midfight", label: "Midfight" },
    { id: "bridge", label: "Bridge" },
    { id: "crystal", label: "Crystal" },
    { id: "sumo", label: "Sumo" },
    { id: "nodebuff", label: "Nodebuff" },
    { id: "bedfight", label: "Bedfight" },
    { id: "uhc", label: "UHC" },

  ]

  const currentMode = selectedMode?.toLowerCase() || "overall"

  return (
    <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
      {gameModes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelectMode(mode.id)}
          className={cn(
            // Responsive px/py/font for mobile, tablet (md), desktop (lg)
            "flex items-center justify-center rounded-lg whitespace-nowrap border transition-colors duration-150",
            "text-xs px-3 py-1.5", // default: mobile
            "md:text-base md:px-4 md:py-2", // tablet
            "lg:text-lg lg:px-5 lg:py-2.5", // desktop
            "font-semibold",
            mode.id === "overall" ? "" : "",
            currentMode === mode.id
              ? "bg-white/10 border-white/20 text-white"
              : "bg-white/5 border-white/5 text-white/60 hover:bg-white/8 hover:text-white/80",
          )}
        >
          {mode.id !== "overall" && (
            <GameModeIcon
              mode={mode.id}
              // INCREASED ICON SIZES: 24px mobile, 32px tablet, 40px desktop
              className="h-6 w-6 mr-1.5 md:h-8 md:w-8 md:mr-2.5 lg:h-10 lg:w-10 lg:mr-3"
            />
          )}
          {mode.label}
        </button>
      ))}
    </div>
  )
}
