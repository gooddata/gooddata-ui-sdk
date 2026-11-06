// (C) 2026 GoodData Corporation

/**
 * Kind of the module that a lifecycle callback reports.
 *
 * @alpha
 */
export type PluggableModuleKind = "application" | "headless";

/**
 * Lifecycle step that failed.
 *
 * @remarks
 * Applications report `load`, `security` and `mount`. Headless modules also report `update` and
 * `unmount`, because they stay mounted for the whole page.
 *
 * @alpha
 */
export type PluggableModuleFailurePhase = "load" | "security" | "mount" | "update" | "unmount";

/**
 * @alpha
 */
export interface IPluggableModuleLifecycleInfo {
    kind: PluggableModuleKind;
}

/**
 * @alpha
 */
export interface IPluggableModuleFailureInfo extends IPluggableModuleLifecycleInfo {
    phase: PluggableModuleFailurePhase;
}

/**
 * Lifecycle notifications of the host runtime.
 *
 * @remarks
 * The load, mount, failure and unmount callbacks report applications and headless modules. The `info`
 * argument tells them apart. `durationMs` of `onLoadCompleted` covers the load only, and `durationMs` of
 * `onMountCompleted` covers the mount only, for both kinds.
 *
 * @alpha
 */
export interface IAppLifecycleCallbacks {
    // Host UI lifecycle
    onHostUiMounted?: (durationMs: number) => void;

    // App navigation
    onAppNavigation?: (appId: string, pathname: string) => void;
    onPageVisited?: (appId: string) => void;

    // Module lifecycle
    onPreloadStarted?: (appId: string) => void;
    onPreloadCompleted?: (appId: string, durationMs: number) => void;
    onLoadStarted?: (appId: string, info?: IPluggableModuleLifecycleInfo) => void;
    onLoadCompleted?: (appId: string, durationMs: number, info?: IPluggableModuleLifecycleInfo) => void;
    onMountCompleted?: (appId: string, durationMs: number, info?: IPluggableModuleLifecycleInfo) => void;
    onRendered?: (appId: string, totalDurationMs: number) => void;
    onLoadFailed?: (appId: string, error: string, info?: IPluggableModuleFailureInfo) => void;
    onUnmounted?: (appId: string, info?: IPluggableModuleLifecycleInfo) => void;
}
