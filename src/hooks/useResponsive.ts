import React from 'react'

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export type Breakpoint = keyof typeof breakpoints

export const useBreakpoint = (): Breakpoint => {
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<Breakpoint>('lg')

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < parseInt(breakpoints.xs)) {
        setCurrentBreakpoint('xs')
      } else if (width < parseInt(breakpoints.sm)) {
        setCurrentBreakpoint('sm')
      } else if (width < parseInt(breakpoints.md)) {
        setCurrentBreakpoint('md')
      } else if (width < parseInt(breakpoints.lg)) {
        setCurrentBreakpoint('lg')
      } else if (width < parseInt(breakpoints.xl)) {
        setCurrentBreakpoint('xl')
      } else {
        setCurrentBreakpoint('2xl')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return currentBreakpoint
}

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

export const useIsMobile = (): boolean => {
  return useMediaQuery(`(max-width: ${breakpoints.md})`)
}

export const useIsTablet = (): boolean => {
  return useMediaQuery(`(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`)
}

export const useIsDesktop = (): boolean => {
  return useMediaQuery(`(min-width: ${breakpoints.lg})`)
}

export const useOrientation = (): 'portrait' | 'landscape' => {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('landscape')

  React.useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    handleOrientationChange()
    window.addEventListener('resize', handleOrientationChange)
    return () => window.removeEventListener('resize', handleOrientationChange)
  }, [])

  return orientation
}

export const useViewport = () => {
  const [viewport, setViewport] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  React.useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}
