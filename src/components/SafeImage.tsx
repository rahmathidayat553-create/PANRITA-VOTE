import React, { useState } from 'react';
import { User, ImageOff } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  fallbackInitial?: string;
  className?: string;
  containerClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackInitial,
  className = "w-full h-full object-cover",
  containerClassName = "w-full h-full relative overflow-hidden bg-emerald-950/10 flex items-center justify-center",
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || hasError) {
    return (
      <div className={`${containerClassName} border border-emerald-900/10`}>
        <div className="flex flex-col items-center justify-center text-center p-2">
          {fallbackInitial ? (
            <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-sm shadow-sm mb-1">
              {fallbackInitial.slice(0, 2).toUpperCase()}
            </div>
          ) : (
            <User className="w-8 h-8 text-emerald-800/60 mb-1" />
          )}
          <span className="text-[11px] font-medium text-emerald-950/70 truncate max-w-[120px]">
            {alt}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400">
          <ImageOff className="w-4 h-4 opacity-40 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
      />
    </div>
  );
};
