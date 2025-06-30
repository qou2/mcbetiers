
/**
 * Formats a Minecraft avatar URL with multiple fallback options
 */
export const getAvatarUrl = (ign: string, javaUsername?: string | null): string => {
  // Use java username if provided, otherwise use "itzrealme" as fallback
  const username = javaUsername || "itzrealme";
  
  // Primary: Visage Bust API (3D renders) - most reliable
  return `https://visage.surgeplay.com/bust/128/${username}`;
};

/**
 * Get fallback avatar URLs in order of preference
 */
export const getAvatarFallbacks = (ign: string, javaUsername?: string | null): string[] => {
  const username = javaUsername || "itzrealme";
  
  return [
    `https://visage.surgeplay.com/bust/128/${username}`,
    `https://crafatar.com/avatars/${username}?size=128&overlay=true`,
    `https://mc-heads.net/avatar/${username}/128`,
    `https://minotar.net/helm/${username}/128.png`,
    '/default-avatar.png'
  ];
};

/**
 * Enhanced error handling for avatar loading failures with automatic fallback
 */
export const handleAvatarError = (event: React.SyntheticEvent<HTMLImageElement>, ign: string, javaUsername?: string | null) => {
  const img = event.currentTarget;
  const fallbacks = getAvatarFallbacks(ign, javaUsername);
  const currentSrc = img.src;
  
  // Find current fallback index
  const currentIndex = fallbacks.findIndex(url => currentSrc.includes(url.split('/').pop() || ''));
  const nextIndex = currentIndex + 1;
  
  // Try next fallback
  if (nextIndex < fallbacks.length) {
    console.log(`Avatar failed for ${ign}, trying fallback ${nextIndex + 1}/${fallbacks.length}`);
    img.src = fallbacks[nextIndex];
  } else {
    // All fallbacks failed, use default
    console.log(`All avatar fallbacks failed for ${ign}, using default`);
    img.src = '/default-avatar.png';
    img.style.opacity = '0.8';
  }
};

/**
 * Cache for storing fetched avatar URLs
 */
export const avatarCache: Record<string, string> = {};

/**
 * Prefetch and cache an avatar to improve performance
 */
export const prefetchAvatar = async (ign: string, javaUsername?: string | null): Promise<void> => {
  try {
    if (avatarCache[ign]) return;
    
    const url = getAvatarUrl(ign, javaUsername);
    
    const img = new Image();
    img.src = url;
    
    img.onload = () => {
      avatarCache[ign] = url;
    };
    
    img.onerror = () => {
      // Try first fallback
      const fallbacks = getAvatarFallbacks(ign, javaUsername);
      if (fallbacks.length > 1) {
        avatarCache[ign] = fallbacks[1];
      } else {
        avatarCache[ign] = '/default-avatar.png';
      }
    };
  } catch (e) {
    // Silent failure
    avatarCache[ign] = '/default-avatar.png';
  }
};
