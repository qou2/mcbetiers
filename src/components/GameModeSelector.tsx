"use client"
import { Button } from "@/components/ui/button"
import { GameModeIcon } from "./GameModeIcon"

interface GameModeSelectorProps {
  selectedMode: string
  onSelectMode: (mode: string) => void
}

export function GameModeSelector({ selectedMode, onSelectMode }: GameModeSelectorProps) {
  const gameModes = [
    { id: "overall", label: "Overall" },
    { id: "Skywars", label: "Skywars" },
    { id: "Midfight", label: "Midfight" },
    { id: "Bridge", label: "Bridge" },
    { id: "Crystal", label: "Crystal" },
    { id: "Sumo", label: "Sumo" },
    { id: "Nodebuff", label: "Nodebuff" },
    { id: "Bedfight", label: "Bedfight" },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {gameModes.map((mode) => (
        <Button
          key={mode.id}
          variant={selectedMode === mode.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onSelectMode(mode.id)}
          className={`flex items-center gap-2 whitespace-nowrap ${
            selectedMode === mode.id
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          {mode.id !== "overall" && <GameModeIcon mode={mode.id.toLowerCase()} className="h-4 w-4" />}
          {mode.label}
        </Button>
      ))}
    </div>
  )
}
