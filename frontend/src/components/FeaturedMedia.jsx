import React, { useRef, useEffect } from 'react';

/**
 * FeaturedMedia component - Renders images, videos, or GIFs for featured media
 * Automatically detects media type from URL and renders appropriately
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
  objectFit = 'cover'
}) => {
  const videoRef = useRef(null);

  // Detect media type from URL
  const getMediaType = (url) => {
    if (!url) return 'none';
    const lowerUrl = url.toLowerCase();
    
    // Check for video extensions
    if (lowerUrl.match(/\.(mp4|webm|ogg|mov)($|\?)/)) {
      return 'video';
    }
    
    // Check for GIF
    if (lowerUrl.match(/\.gif($|\?)/)) {
      return 'gif';
    }
    
    // Check for common video hosting patterns
    if (lowerUrl.includes('screenpal.com') || 
        lowerUrl.includes('loom.com') ||
        lowerUrl.includes('vimeo.com') ||
        lowerUrl.includes('youtube.com') ||
        lowerUrl.includes('youtu.be')) {
      return 'embed';
    }
    
    // Default to image
    return 'image';
  };

  const mediaType = getMediaType(src);

  // Auto-play video when in view
  useEffect(() => {
    if (mediaType === 'video' && videoRef.current && autoPlay) {
      videoRef.current.play().catch(() => {
        // Auto-play might be blocked, that's ok
      });
    }
  }, [mediaType, autoPlay]);

  if (!src || mediaType === 'none') {
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${containerClassName}`}>
        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  // Render based on media type
  switch (mediaType) {
    case 'video':
      return (
        <div className={containerClassName}>
          <video
            ref={videoRef}
            src={src}
            className={className}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            playsInline
            controls={showControls}
            style={{ objectFit }}
          />
        </div>
      );

    case 'gif':
      return (
        <div className={containerClassName}>
          <img
            src={src}
            alt={alt}
            className={className}
            style={{ objectFit }}
          />
        </div>
      );

    case 'embed':
      // Handle embedded videos (YouTube, Vimeo, ScreenPal, etc.)
      return (
        <div className={containerClassName}>
          <iframe
            src={src}
            className={className}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      );

    case 'image':
    default:
      return (
        <div className={containerClassName}>
          <img
            src={src}
            alt={alt}
            className={className}
            style={{ objectFit }}
          />
        </div>
      );
  }
};

export default FeaturedMedia;
