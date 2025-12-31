import React, { useState, useEffect } from 'react';
import { LockIcon } from './icons/LockIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

interface DeployingBannerProps {
  username: string;
  onComplete?: () => void;
  initialSeconds?: number;
  variant?: 'fixed' | 'inline';
  title?: string;
  subtitle?: string;
  showActionButton?: boolean;
}

const DEPLOY_COUNTDOWN_SECONDS = 300; // 5 minutes

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const DeployingBanner: React.FC<DeployingBannerProps> = ({ 
  username, 
  onComplete, 
  initialSeconds, 
  variant = 'fixed',
  title = 'Deploying your changes...',
  subtitle,
  showActionButton = true,
}) => {
  const [countdown, setCountdown] = useState(initialSeconds ?? DEPLOY_COUNTDOWN_SECONDS);
  const actionUrl = `https://github.com/glnk-dev/glnk-${username}/actions/workflows/deploy-pages.yaml`;

  useEffect(() => {
    if (countdown <= 0) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, onComplete]);

  const containerClasses = variant === 'fixed' 
    ? 'fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white shadow-lg'
    : 'bg-orange-500 text-white shadow-lg rounded-xl';

  return (
    <div className={containerClasses}>
      <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-6">
        <div className="flex items-center justify-between gap-2 sm:gap-3 py-2.5 sm:py-3 min-h-[50px] sm:min-h-[57px]">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <LockIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold truncate">{title}</p>
              <p className="text-xs sm:text-xs text-white/90">
                {subtitle ? subtitle.replace('{time}', formatTime(countdown)) : `Editing locked for ${formatTime(countdown)}`}
              </p>
            </div>
          </div>
          {showActionButton && (
            <a
              href={actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 sm:px-4 py-1 sm:py-1.5 bg-white text-orange-500 rounded-full text-xs sm:text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-1 sm:gap-1.5 flex-shrink-0 whitespace-nowrap"
            >
              <span className="hidden sm:inline">View Action</span>
              <span className="sm:hidden">View</span>
              <ExternalLinkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

