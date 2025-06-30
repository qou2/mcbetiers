"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { GameModeSelector } from "./GameModeSelector"
import { MobileNavMenu } from "./MobileNavMenu"
import { Home, Youtube, MessageCircle, Search, Menu, X } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { usePlayerSearch } from "@/hooks/usePlayerSearch"
import { usePopup } from "@/contexts/PopupContext"
import type { Player } from "@/services/playerService"
import { getPlayerRank } from "@/utils/rankUtils"
import { Button } from "@/components/ui/button"

// Custom hook for tablet detection
function useIsTablet() {
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= 768 && width <= 1024)
    }

    checkTablet()
    window.addEventListener("resize", checkTablet)
    return () => window.removeEventListener("resize", checkTablet)
  }, [])

  return isTablet
}

interface NavbarProps {
  selectedMode: string
  onSelectMode: (mode: string) => void
  navigate: (path: string) => void
}

export function Navbar({ selectedMode, onSelectMode, navigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const { searchResults, isSearching, searchPlayers } = usePlayerSearch()
  const { openPopup } = usePopup()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      setScrolled(offset > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Show results when we have a query and results or when focused with query
    if (searchQuery && searchQuery.length >= 2 && (searchResults.length > 0 || searchFocused)) {
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
    }
  }, [searchQuery, searchResults, searchFocused])

  useEffect(() => {
    // Hide results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".search-container")) {
        setShowSearchResults(false)
        setSearchFocused(false)
      }
    }

    if (showSearchResults) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [showSearchResults])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      await searchPlayers(searchQuery)
    }
  }

  const handlePlayerSelect = (player: Player) => {
    // Handle player selection - could open modal or navigate
    setSearchQuery("")
    const rankInfo = getPlayerRank(player.global_points || 0)

    const tierAssignments = (player.tierAssignments || []).map((assignment) => ({
      gamemode: assignment.gamemode,
      tier: assignment.tier,
      score: assignment.score,
    }))

    openPopup({
      player,
      tierAssignments,
      combatRank: {
        title: rankInfo.title,
        points: player.global_points || 0,
        color: rankInfo.color,
        effectType: "general",
        rankNumber: player.overall_rank || 1,
        borderColor: rankInfo.borderColor,
      },
      timestamp: new Date().toISOString(),
    })
  }

  const handleSearchFocus = () => {
    setSearchFocused(true)
    if (searchQuery && searchQuery.length >= 2) {
      setShowSearchResults(true)
    }
  }

  const handleSearchBlur = () => {
    // Delay hiding to allow clicks on results
    setTimeout(() => {
      setSearchFocused(false)
    }, 150)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Determine layout based on device type
  const isCompact = isMobile
  const containerPadding = isMobile ? "px-3" : isTablet ? "px-6" : "px-4 lg:px-8"
  const navHeight = isMobile ? "h-14" : isTablet ? "h-18" : "h-16"
  const logoHeight = isMobile ? "h-8" : isTablet ? "h-12" : "h-10"
  const titleSize = isMobile ? "text-lg" : isTablet ? "text-2xl" : "text-xl md:text-2xl"

  return (
    <div className={`pt-4 pb-2 ${isMobile ? "px-2" : isTablet ? "px-3" : "pt-8"}`}>
      <motion.nav
        className={cn("navbar rounded-xl", scrolled ? "shadow-xl" : "shadow-lg")}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className={`container mx-auto ${containerPadding}`}>
          <div className={`flex items-center justify-between ${navHeight}`}>
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => navigate("/")}
                className="flex items-center text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
              >
                <img
                  src="/lovable-uploads/3bad17d6-7347-46e0-8f33-35534094962f.png"
                  alt="MCBE TIERS"
                  className={`w-auto mr-2 ${logoHeight}`}
                />
                MCBE TIERS
              </button>
            </div>

            {/* Center - Main Navigation (Desktop and Tablet) */}
            {!isMobile && (
              <div className={`${isTablet ? "flex" : "hidden lg:flex"} items-center space-x-8`}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/"
                    className={`flex items-center text-white/80 hover:text-white transition-colors duration-200 ${isTablet ? "text-xl" : "text-lg"}`}
                  >
                    <Home size={isTablet ? 24 : 20} className="mr-2" />
                    <span>Rankings</span>
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Right - Search & External Links (Desktop/Tablet) / Menu Button (Mobile) */}
            {isMobile ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="text-white hover:bg-white/10">
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            ) : (
              <div className={`${isTablet ? "flex" : "hidden md:flex"} items-center space-x-6`}>
                <div className="relative search-container">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search players..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
                      className="pl-10 pr-4 py-2 w-64 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                    />
                  </div>

                  {/* Search Results */}
                  {searchQuery && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                      {searchResults.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => handlePlayerSelect(player)}
                          className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors"
                        >
                          <div className="text-white font-medium">{player.ign}</div>
                          <div className="text-gray-400 text-sm">
                            {player.region} • {player.global_points} points
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <motion.a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-red-500 transition-colors duration-200"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Youtube size={isTablet ? 28 : 24} />
                </motion.a>

                <motion.a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-indigo-400 transition-colors duration-200"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MessageCircle size={isTablet ? 28 : 24} />
                </motion.a>
              </div>
            )}
          </div>

          {/* Search bar for mobile */}
          {isMobile && (
            <div className="py-2 border-t border-white/10 search-container">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    className="pl-10 pr-4 py-2 w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                  />
                </div>

                {/* Mobile Search Results */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/20 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {searchResults.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handlePlayerSelect(player)}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors"
                      >
                        <div className="text-white font-medium">{player.ign}</div>
                        <div className="text-gray-400 text-sm">
                          {player.region} • {player.global_points} points
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Game Mode Selector - Different for mobile */}
          <div className="py-2 border-t border-white/10 overflow-x-auto">
            {isMobile ? (
              <MobileNavMenu currentMode={selectedMode || "overall"} />
            ) : (
              <GameModeSelector selectedMode={selectedMode || "overall"} onSelectMode={onSelectMode} />
            )}
          </div>

          {/* Mobile Navigation Menu */}
          {isMobile && mobileMenuOpen && (
            <motion.div
              className="py-3 px-2 border-t border-white/10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-2">
                <Link
                  to="/"
                  className="flex items-center p-3 rounded-md hover:bg-white/10 text-white/80 hover:text-white text-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={22} className="mr-3" />
                  <span>Rankings</span>
                </Link>
                <div className="flex space-x-4 p-3 mt-2 justify-center">
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-red-500 transition-colors duration-200"
                  >
                    <Youtube size={28} />
                  </a>
                  <a
                    href="https://discord.gg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-indigo-400 transition-colors duration-200"
                  >
                    <MessageCircle size={28} />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>
    </div>
  )
}
