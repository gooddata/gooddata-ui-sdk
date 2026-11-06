// (C) 2026 GoodData Corporation

export { getBackend, setRuntimePackageName } from "./platformContext/backend.js";
export { registerPlatformContextCallbacks } from "./platformContext/useLoadPlatformContext.js";
export { type ILoadPlatformContextCallbacks } from "./platformContext/loadPlatformContext.js";

export {
    registerLocalApplicationLoaders,
    type LocalPluggableApplicationLoader,
} from "./loader/localLoader.js";

export { registerLocalApplications } from "./registry/pluggableApplicationsRegistry.js";
export { registerLocalHeadlessModules } from "./headless/headlessModulesRegistry.js";
export {
    registerLocalHeadlessModuleLoaders,
    type LocalHeadlessModuleLoader,
} from "./headless/localHeadlessLoader.js";
export {
    registerAppLifecycleCallbacks,
    registerHostTelemetryServices,
} from "./loader/pluggableApplicationsLoader.js";

export { mapLegacyUrlToHost, type ILegacyLocation } from "./loader/legacyRedirect.js";

export { Root, type IRootCallbacks } from "./components/Root.js";
export {
    HostErrorBoundary,
    type IHostErrorBoundaryProps,
    type IHostErrorBoundaryState,
} from "./components/HostErrorBoundary.js";
export {
    type IAppLifecycleCallbacks,
    type IPluggableModuleFailureInfo,
    type IPluggableModuleLifecycleInfo,
    type PluggableModuleFailurePhase,
    type PluggableModuleKind,
} from "./types/lifecycle.js";
export {
    type IHeadlessTelemetryProviderRegistration,
    type IHostTelemetryServices,
} from "./types/telemetryServices.js";

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

export { HostIntlProvider, type IHostIntlProviderProps } from "./ui/HostIntlProvider.js";
export { HostChromeProviders, type IHostChromeProvidersProps } from "./ui/HostChromeProviders.js";
export { LanguageDialog, type ILanguageDialogProps } from "./ui/LanguageDialog.js";
export { LanguageMobileSelect, type ILanguageMobileSelectProps } from "./ui/LanguageMobileSelect.js";
export { type ILanguages } from "./ui/useLanguages.js";
export { LANGUAGES, type LanguageChoice } from "./ui/languages.js";
