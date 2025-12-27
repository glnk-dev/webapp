// Google IMA SDK Type Definitions
declare namespace google {
  namespace ima {
    class AdDisplayContainer {
      constructor(
        adContainer: HTMLElement,
        videoElement?: HTMLVideoElement
      );
      initialize(): void;
      destroy(): void;
    }

    class AdsLoader {
      constructor(adDisplayContainer: AdDisplayContainer);
      addEventListener(
        type: string,
        listener: (event: AdsManagerLoadedEvent | AdErrorEvent) => void,
        useCapture?: boolean
      ): void;
      requestAds(adsRequest: AdsRequest): void;
      contentComplete(): void;
      destroy(): void;
    }

    class AdsRequest {
      adTagUrl: string;
      linearAdSlotWidth: number;
      linearAdSlotHeight: number;
      nonLinearAdSlotWidth: number;
      nonLinearAdSlotHeight: number;
    }

    interface AdsManagerLoadedEvent {
      getAdsManager(
        contentPlayback: { currentTime: number; duration: number },
        adsRenderingSettings?: AdsRenderingSettings
      ): AdsManager;
    }

    interface AdsRenderingSettings {
      restoreCustomPlaybackStateOnAdBreakComplete?: boolean;
    }

    interface AdsManager {
      addEventListener(
        type: string,
        listener: (event: AdEvent | AdErrorEvent) => void
      ): void;
      init(
        width: number,
        height: number,
        viewMode: ViewMode
      ): void;
      start(): void;
      pause(): void;
      resume(): void;
      stop(): void;
      resize(width: number, height: number, viewMode: ViewMode): void;
      destroy(): void;
      getRemainingTime(): number;
      getVolume(): number;
      setVolume(volume: number): void;
    }

    interface AdEvent {
      type: string;
      getAd(): Ad;
      getAdData(): Record<string, unknown>;
    }

    interface Ad {
      getDuration(): number;
      getTitle(): string;
      getDescription(): string;
      getAdvertiserName(): string;
      isLinear(): boolean;
    }

    interface AdErrorEvent {
      getError(): AdError;
    }

    interface AdError {
      getMessage(): string;
      getErrorCode(): number;
      getType(): string;
    }

    enum ViewMode {
      NORMAL = 'normal',
      FULLSCREEN = 'fullscreen'
    }

    const AdsManagerLoadedEvent: {
      Type: {
        ADS_MANAGER_LOADED: string;
      };
    };

    const AdEvent: {
      Type: {
        ALL_ADS_COMPLETED: string;
        CLICK: string;
        COMPLETE: string;
        CONTENT_PAUSE_REQUESTED: string;
        CONTENT_RESUME_REQUESTED: string;
        FIRST_QUARTILE: string;
        IMPRESSION: string;
        LOADED: string;
        MIDPOINT: string;
        PAUSED: string;
        RESUMED: string;
        SKIPPED: string;
        STARTED: string;
        THIRD_QUARTILE: string;
        USER_CLOSE: string;
        VIDEO_CLICKED: string;
        VIDEO_ICON_CLICKED: string;
        VOLUME_CHANGED: string;
        VOLUME_MUTED: string;
      };
    };

    const AdErrorEvent: {
      Type: {
        AD_ERROR: string;
      };
    };
  }
}

