import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { TableCell } from "@/components/ui/table"

interface PlayerRowProps {
  id?: string
  position?: number
  displayName: string
  avatar?: string
  gameMode?: string
  tier?: number | string
  badge?: string
  points?: number
  country?: string
  device?: string
  compact?: boolean
  onClick?: () => void
  delay?: number
  gameModes?: string[]
  tierAssignments?: Array<{
    gamemode: string
    tier: string
    score: number
  }>
}

export function PlayerRow({
  position,
  displayName,
  avatar,
  points,
  country,
  device,
  compact = false,
  onClick,
  gameModes = [],
  tierAssignments = [],
}: PlayerRowProps) {
  const getTierDisplay = (gamemode: string) => {
    const assignment = tierAssignments.find((a) => a.gamemode.toLowerCase() === gamemode.toLowerCase())

    if (!assignment || assignment.tier === "Not Ranked") {
      return { display: "NR", color: "text-gray-500" }
    }

    if (assignment.tier === "Retired") {
      return { display: "R", color: "text-gray-400" }
    }

    // Return full tier name (HT1, LT1, etc.)
    const tier = assignment.tier
    let color = "text-gray-400"

    if (tier.includes("1")) color = "text-tier-1"
    else if (tier.includes("2")) color = "text-tier-2"
    else if (tier.includes("3")) color = "text-tier-3"
    else if (tier.includes("4")) color = "text-tier-4"
    else if (tier.includes("5")) color = "text-tier-5"

    return { display: tier, color }
  }

  return (
    <>
      <TableCell className="w-12">
        <span className="text-white/40 text-sm font-mono">{position}</span>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className={cn("border-2 border-white/10", compact ? "h-8 w-8" : "h-10 w-10")}>
            <AvatarImage src={avatar || "/placeholder.svg"} alt={displayName} />
            <AvatarFallback>{displayName ? displayName.charAt(0) : "?"}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className={cn("font-medium", compact ? "text-sm" : "text-base")}>{displayName}</span>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-center">
        <span className="text-sm">{country}</span>
      </TableCell>

      <TableCell className="text-center">
        <span className="text-sm">{device}</span>
      </TableCell>

      {gameModes.map((mode) => {
        const tierInfo = getTierDisplay(mode)
        return (
          <TableCell key={mode} className="text-center">
            <span className={cn("text-sm font-bold", tierInfo.color)}>{tierInfo.display}</span>
          </TableCell>
        )
      })}

      <TableCell className="text-right">
        <div className={cn("flex items-center justify-end", compact ? "text-xs" : "text-sm")}>
          <Trophy size={compact ? 12 : 14} className="mr-1 text-yellow-400" />
          <span>{points}</span>
        </div>
      </TableCell>
    </>
  )
}
