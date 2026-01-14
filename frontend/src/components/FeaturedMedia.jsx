import React, { useRef, useEffect, useState } from 'react';

/**
 * FeaturedMedia component - Renders images, videos, or GIFs for featured media
 * Automatically detects media type from URL and renders appropriately
 * Supports: images, GIFs, MP4/WebM videos, YouTube, Vimeo, ScreenPal embeds
 */
const FeaturedMedia = ({ 
  src, 
  alt = '', 
  className = '', 
  containerClassName = '',
  autoPlay = true,
  loop = true,
  muted = true,
  showControls = false,
  objectFit = 'cover',
  aspectRatio = null // e.g., "16/9", "4/3", "1/1"
}) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Detect media type from URL
  const getMediaType = (url) => {
    if (!url) return 'none';
    const lowerUrl = url.toLowerCase();
    
    // Check for video extensions
    if (lowerUrl.match(/\.(mp4|webm|ogg|mov|m4v)($|\?)/)) {
      return 'video';
    }
    
    // Check for GIF
    if (lowerUrl.match(/\.gif($|\?)/)) {
      return 'gif';
    }
    
    // Check for common video hosting patterns - these need iframes
    if (lowerUrl.includes('screenpal.com') || 
        lowerUrl.includes('screencast-o-matic.com') ||
        lowerUrl.includes('loom.com') ||
        lowerUrl.includes('vimeo.com') ||
        lowerUrl.includes('youtube.com') ||
        lowerUrl.includes('youtu.be') ||
        lowerUrl.includes('dailymotion.com') ||
        lowerUrl.includes('twitch.tv')) {
      return 'embed';
    }
    
    // Default to image
    return 'image';
  };

  // Normalize embed URLs for proper embedding
  const getEmbedUrl = (url) => {
    if (!url) return url;
    
    // YouTube
    if (url.includes('youtube.com/watch')) {
      const videoId = new URLSearchParams(new URL(url).search).get('v');
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]?.split('/')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1`;
    }
    
    // ScreenPal - already in embed format usually, just ensure autoplay params
    if (url.includes('screenpal.com')) {
      // If it's already a player URL, use as-is but ensure autoplay params
      if (url.includes('/player/')) {
        const hasParams = url.includes('?');
        return hasParams ? url : `${url}?autoplay=1`;
      }
      return url;
    }
    
    return url;
  };

  const mediaType = getMediaType(src);
  const embedUrl = mediaType === 'embed' ? getEmbedUrl(src) : src;

  // Auto-play video when in view
  useEffect(() => {
    if (mediaType === 'video' && videoRef.current && autoPlay) {
      videoRef.current.play().catch(() => {
        // Auto-play might be blocked, that's ok
      });
    }
  }, [mediaType, autoPlay]);

  // Container style with aspect ratio support
  const containerStyle = aspectRatio ? { aspectRatio } : {};

  if (!src || mediaType === 'none') {
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${containerClassName}`} style={containerStyle}>
        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${containerClassName}`} style={containerStyle}>
        <div className="text-center p-4">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-gray-500">Failed to load media</p>
        </div>
      </div>
    );
  }

  // Render based on media type
  switch (mediaType) {
    case 'video':
      return (
        <div className={`relative ${containerClassName}`} style={containerStyle}>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
              <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-amber-500 animate-spin" />
            </div>
          )}
          <video
            ref={videoRef}
            src={src}
            className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            playsInline
            controls={showControls}
            style={{ objectFit }}
            onLoadedData={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        </div>
      );

    case 'gif':
      return (
        <div className={`relative ${containerClassName}`} style={containerStyle}>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
              <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-amber-500 animate-spin" />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}
            style={{ objectFit }}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        </div>
      );

    case 'embed':
      // Handle embedded videos (YouTube, Vimeo, ScreenPal, etc.)
      return (
        <div className={`relative ${containerClassName}`} style={containerStyle}>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 z-10">
              <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-amber-500 animate-spin" />
            </div>
          )}
          <iframe
            src={embedUrl}
            className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        </div>
      );

    case 'image':
    default:
      return (
        <div className={`relative ${containerClassName}`} style={containerStyle}>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
              <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-amber-500 animate-spin" />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}
            style={{ objectFit }}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        </div>
      );
  }
};

export default FeaturedMedia;
