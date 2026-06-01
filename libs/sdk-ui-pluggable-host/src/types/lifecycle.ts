// (C) 2026 GoodData Corporation

import { type IPluggableAppTelemetryCallbacks } from "@gooddata/sdk-pluggable-application-model";

/**
 * @alpha
 */
export interface IAppLifecycleCallbacks {
    // Host UI lifecycle
    onHostUiMounted?: (durationMs: number) => void;

    // App navigation
    onAppNavigation?: (appId: string, pathname: string) => void;
    onPageVisited?: (appId: string) => void;

    // App loading lifecycle
    onPreloadStarted?: (appId: string) => void;
    onPreloadCompleted?: (appId: string, durationMs: number) => void;
    onLoadStarted?: (appId: string) => void;
    onLoadCompleted?: (appId: string, durationMs: number) => void;
    onMountCompleted?: (appId: string, durationMs: number) => void;
    onRendered?: (appId: string, totalDurationMs: number) => void;
    onLoadFailed?: (appId: string, error: string) => void;
    onUnmounted?: (appId: string) => void;
    createTelemetryCallbacks?: (appId: string) => IPluggableAppTelemetryCallbacks;
}
