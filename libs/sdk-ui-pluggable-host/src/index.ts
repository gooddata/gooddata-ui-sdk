// (C) 2026 GoodData Corporation

export { getBackend, setRuntimePackageName } from "./platformContext/backend.js";
export { registerPlatformContextCallbacks } from "./platformContext/useLoadPlatformContext.js";
export { type ILoadPlatformContextCallbacks } from "./platformContext/loadPlatformContext.js";

export {
    registerLocalApplicationLoaders,
    type LocalPluggableApplicationLoader,
} from "./loader/localLoader.js";

export { registerLocalApplications } from "./registry/pluggableApplicationsRegistry.js";
export { registerAppLifecycleCallbacks } from "./loader/pluggableApplicationsLoader.js";

export { Root, type IRootCallbacks } from "./components/Root.js";
export { type IAppLifecycleCallbacks } from "./types/lifecycle.js";

export {
    STALE_CHUNK_RELOAD_PARAM,
    installPreloadErrorHandler,
    installVersionWatcher,
    reloadForStaleChunks,
    setStaleChunkReloadListener,
    type IStaleChunkReloadInfo,
    type IVersionWatcherOptions,
    type StaleChunkReloadListener,
} from "./lib/chunkReloadGuard.js";
export { dispatchHostNotification } from "./lib/hostNotifications.js";

export {
    setHostPricingExtension,
    type UseHostPricingExtension,
    type IHostChromePricing,
} from "./ui/useHostChromePricing.js";
