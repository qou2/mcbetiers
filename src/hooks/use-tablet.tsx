
import * as React from "react"

const TABLET_MIN_BREAKPOINT = 768
const TABLET_MAX_BREAKPOINT = 1024

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= TABLET_MIN_BREAKPOINT && width <= TABLET_MAX_BREAKPOINT)
    }

    const mql = window.matchMedia(`(min-width: ${TABLET_MIN_BREAKPOINT}px) and (max-width: ${TABLET_MAX_BREAKPOINT}px)`)
    
    mql.addEventListener("change", checkTablet)
    checkTablet()
    
    return () => mql.removeEventListener("change", checkTablet)
  }, [])

  return !!isTablet
}
