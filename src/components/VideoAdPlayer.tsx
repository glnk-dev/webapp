import { useEffect, useRef, useState, useCallback } from 'react';

const SAMPLE_VAST_TAGS = {
  linear: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s',
  skippable: 'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s',
};

interface VideoAdPlayerProps {
  vastTagUrl?: string;
  onAdComplete?: () => void;
  onAdError?: (error: string) => void;
  onAdStarted?: () => void;
  onAdProgress?: (remaining: number, duration: number) => void;
  autoplay?: boolean;
}

export function VideoAdPlayer({
  vastTagUrl = SAMPLE_VAST_TAGS.skippable,
  onAdComplete,
  onAdError,
  onAdStarted,
  onAdProgress,
  autoplay = false,
}: VideoAdPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const adsLoaderRef = useRef<google.ima.AdsLoader | null>(null);
  const adsManagerRef = useRef<google.ima.AdsManager | null>(null);
  const intervalRef = useRef<number | null>(null);
  const onAdCompleteRef = useRef(onAdComplete);
  const onAdErrorRef = useRef(onAdError);
  const onAdStartedRef = useRef(onAdStarted);
  const onAdProgressRef = useRef(onAdProgress);

  useEffect(() => { onAdCompleteRef.current = onAdComplete; }, [onAdComplete]);
  useEffect(() => { onAdErrorRef.current = onAdError; }, [onAdError]);
  useEffect(() => { onAdStartedRef.current = onAdStarted; }, [onAdStarted]);
  useEffect(() => { onAdProgressRef.current = onAdProgress; }, [onAdProgress]);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [adInfo, setAdInfo] = useState<{
    title?: string;
    duration?: number;
    remaining?: number;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const cleanupAds = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (adsManagerRef.current) {
      adsManagerRef.current.destroy();
      adsManagerRef.current = null;
    }
    if (adsLoaderRef.current) {
      adsLoaderRef.current.destroy();
      adsLoaderRef.current = null;
    }
  }, []);

  const initializeIMA = useCallback(() => {
    if (!videoRef.current || !adContainerRef.current) return;
    if (typeof google === 'undefined' || !google.ima) {
      setError('IMA SDK not loaded');
      setIsLoading(false);
      return;
    }

    cleanupAds();

    try {
      const adDisplayContainer = new google.ima.AdDisplayContainer(
        adContainerRef.current,
        videoRef.current
      );
      adDisplayContainer.initialize();

      const adsLoader = new google.ima.AdsLoader(adDisplayContainer);
      adsLoaderRef.current = adsLoader;

      adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        (event) => {
          const adsManagerLoadedEvent = event as google.ima.AdsManagerLoadedEvent;
          const adsManager = adsManagerLoadedEvent.getAdsManager(
            { currentTime: 0, duration: 0 },
            { restoreCustomPlaybackStateOnAdBreakComplete: true }
          );
          adsManagerRef.current = adsManager;

          adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, () => {
            setIsLoading(false);
          });

          adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, (adEvent) => {
            const ad = (adEvent as google.ima.AdEvent).getAd();
            setIsPlaying(true);
            setAdInfo({
              title: ad.getTitle(),
              duration: ad.getDuration(),
              remaining: ad.getDuration(),
            });
            onAdStartedRef.current?.();

            intervalRef.current = window.setInterval(() => {
              if (adsManagerRef.current) {
                const remaining = adsManagerRef.current.getRemainingTime();
                const duration = ad.getDuration();
                setAdInfo((prev) => ({ ...prev, remaining }));
                onAdProgressRef.current?.(remaining, duration);
              }
            }, 250);
          });

          adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, () => {
            setIsPlaying(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          });

          adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
            cleanupAds();
            onAdCompleteRef.current?.();
          });

          adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, () => {
            onAdCompleteRef.current?.();
          });

          adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, (errorEvent) => {
            const adError = (errorEvent as google.ima.AdErrorEvent).getError();
            const errorMessage = adError.getMessage();
            setError(errorMessage);
            setIsLoading(false);
            onAdErrorRef.current?.(errorMessage);
            cleanupAds();
          });

          try {
            const containerWidth = adContainerRef.current?.clientWidth || 640;
            const containerHeight = adContainerRef.current?.clientHeight || 360;
            adsManager.init(containerWidth, containerHeight, google.ima.ViewMode.NORMAL);
            adsManager.start();
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start ad';
            setError(errorMessage);
            onAdErrorRef.current?.(errorMessage);
          }
        }
      );

      adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, (errorEvent) => {
        const adError = (errorEvent as google.ima.AdErrorEvent).getError();
        const errorMessage = adError.getMessage();
        setError(errorMessage);
        setIsLoading(false);
        onAdErrorRef.current?.(errorMessage);
      });

      const adsRequest = new google.ima.AdsRequest();
      adsRequest.adTagUrl = vastTagUrl + '&correlator=' + Date.now();
      const reqWidth = adContainerRef.current?.clientWidth || 640;
      const reqHeight = adContainerRef.current?.clientHeight || 360;
      adsRequest.linearAdSlotWidth = reqWidth;
      adsRequest.linearAdSlotHeight = reqHeight;
      adsRequest.nonLinearAdSlotWidth = reqWidth;
      adsRequest.nonLinearAdSlotHeight = Math.floor(reqHeight / 3);

      adsLoader.requestAds(adsRequest);
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize IMA';
      setError(errorMessage);
      setIsLoading(false);
      onAdErrorRef.current?.(errorMessage);
    }
  }, [vastTagUrl, cleanupAds]);

  useEffect(() => {
    if (autoplay) {
      initializeIMA();
    }
    return cleanupAds;
  }, [autoplay, initializeIMA, cleanupAds]);

  const handlePlayClick = () => {
    if (!isInitialized) {
      initializeIMA();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden shadow-lg w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        playsInline
        muted
      />

      <div ref={adContainerRef} className="absolute inset-0 pointer-events-auto" />

      {isLoading && isInitialized && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm">Loading ad...</p>
        </div>
      )}

      {!autoplay && !isInitialized && !error && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 cursor-pointer gap-4 transition-all hover:from-gray-800 hover:to-gray-700"
          onClick={handlePlayClick}
        >
          <button className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center transition-transform hover:scale-110 shadow-lg shadow-orange-500/40">
            <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <p className="text-white/80 text-sm">Click to play ad</p>
        </div>
      )}

      {isPlaying && adInfo.remaining !== undefined && (
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium">
          <span className="bg-orange-500 text-black px-2 py-0.5 rounded text-xs font-bold tracking-wider">AD</span>
          <span className="tabular-nums">
            {formatTime(adInfo.remaining)} / {formatTime(adInfo.duration || 0)}
          </span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-red-400 gap-4 p-6 text-center">
          <p className="text-sm max-w-xs">⚠️ {error}</p>
          <button 
            onClick={() => {
              setError(null);
              setIsInitialized(false);
              setIsLoading(true);
            }}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

export { SAMPLE_VAST_TAGS };
