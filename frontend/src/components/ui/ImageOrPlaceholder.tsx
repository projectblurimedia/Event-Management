import { useState } from 'react';
import { ImageIcon, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { isVideoUrl } from '@/lib/cloudinary';

interface ImageOrPlaceholderProps {
  src?: string | null;
  alt: string;
  className?: string;
  iconSize?: number;
  /** How the media fills its box — defaults to 'cover' (crop to fill). */
  objectFit?: 'cover' | 'contain';
}

function VideoWithControls({
  src,
  alt,
  className,
  objectFit,
}: {
  src: string;
  alt: string;
  className?: string;
  objectFit: 'cover' | 'contain';
}) {
  const [muted, setMuted] = useState(true);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  return (
    <>
      <div className={cn('relative overflow-hidden', className)}>
        <video
          src={src}
          className={cn('h-full w-full', objectFit === 'contain' ? 'object-contain' : 'object-cover')}
          autoPlay
          muted={muted}
          loop
          playsInline
          aria-label={alt}
          onClick={(e) => {
            e.stopPropagation();
            setFullscreenOpen(true);
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => !m);
          }}
          aria-label={muted ? 'Unmute video' : 'Mute video'}
          className="bg-ink-black/60 hover:bg-ink-black/80 absolute right-1.5 bottom-1.5 flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors"
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>

      {fullscreenOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreenOpen(false)}
        >
          <button
            type="button"
            onClick={() => setFullscreenOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>
          <video
            src={src}
            className="max-h-full max-w-full rounded-lg"
            controls
            autoPlay
            playsInline
            aria-label={alt}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

/**
 * Renders the real photo (or video, muted/looping like a GIF with a mute
 * toggle) when one is set, otherwise a placeholder box of the exact same
 * size/shape with a centered icon — so cards look identical whether or not
 * the admin has uploaded media yet. Clicking a video opens it full-size.
 */
export function ImageOrPlaceholder({ src, alt, className, iconSize = 20, objectFit = 'cover' }: ImageOrPlaceholderProps) {
  if (src) {
    if (isVideoUrl(src)) {
      return <VideoWithControls src={src} alt={alt} className={className} objectFit={objectFit} />;
    }
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(objectFit === 'contain' ? 'object-contain' : 'object-cover', className)}
      />
    );
  }
  return (
    <div className={cn('bg-surface-muted text-text-muted/40 flex items-center justify-center', className)}>
      <ImageIcon size={iconSize} />
    </div>
  );
}
