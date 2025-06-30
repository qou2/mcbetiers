"use client"
import { Button } from "@/components/ui/button"
import { GameModeIcon } from "./GameModeIcon"

interface MobileNavMenuProps {
  isOpen: boolean
  onClose: () => void
  selectedMode: string
  onSelectMode: (mode: string) => void
  navigate: (path: string) => void
}

export function MobileNavMenu({ isOpen, onClose, selectedMode, onSelectMode, navigate }: MobileNavMenuProps) {
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

  if (!isOpen) return null

  const handleModeSelect = (mode: string) => {
    onSelectMode(mode)
    onClose()
  }

  return (
    <div className="md:hidden bg-black/90 border-t border-white/10">
      <div className="px-4 py-4 space-y-2">
        {gameModes.map((mode) => (
          <Button
            key={mode.id}
            variant={selectedMode === mode.id ? "default" : "ghost"}
            size="sm"
            onClick={() => handleModeSelect(mode.id)}
            className={`w-full justify-start gap-2 ${
              selectedMode === mode.id
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            {mode.id !== "overall" && <GameModeIcon mode={mode.id.toLowerCase()} className="h-4 w-4" />}
            {mode.label}
          </Button>
        ))}

        <div className="pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate("/about")
              onClose()
            }}
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
          >
            About
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate("/news")
              onClose()
            }}
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
          >
            News
          </Button>
        </div>
      </div>
    </div>
  )
}
