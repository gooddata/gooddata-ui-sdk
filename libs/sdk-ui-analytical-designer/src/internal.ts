// (C) 2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files

// The entry of the GoodData apps (the AD pluggable module). It is not a public API: the public
// component is in the root entry.

export { Root } from "./Root.js";
export { store, startSagas, subscribeControls, sagaMiddleware } from "./reduxStore.js";
export { getHelpMenuItems, getTranslatedHelpMenuItemsForLocale } from "./utils/appHeader.js";
export { type IAdHostBackend, type IApiToken, adoptHostBackend, resetBackend } from "./backend.js";
export { emitApiTokenIsAboutToExpire } from "./postMessageApi/outgoing/set_api_token_events.js";
export { workspacePermissionsSuccess } from "./actions/permissions_actions.js";
export { setEmbedded } from "./actions/embedded_actions.js";
export { resetForPluggableMount } from "./actions/reset_for_pluggable_mount_actions.js";
export { setFeatureFlagsItems } from "./actions/featureFlags_actions.js";
export { setRouteProjectId } from "./store/router/router_actions.js";
export { useAppMode } from "./appMode/appMode.js";
export { handleHostNavigationRequest } from "./appMode/handleHostNavigationRequest.js";
export { clearPendingHostNavigation } from "./appMode/pendingHostNavigation.js";
export {
    type IBootstrapData,
    type ISetLocaleAction,
    bootstrapData,
    setLocale,
    setTheme,
    setColorPalette,
} from "./actions/app_context_actions.js";
export { currentReportTitle } from "./selectors/report_title_selector.js";
export { type IAiAssistantTagScope, selectAiAssistantTagScope } from "./selectors/route_selector.js";
export { storeApiToken } from "./store/application_context/app_context_actions.js";
export {
    setHostTelemetryCallbacks,
    clearHostTelemetryCallbacks,
} from "./services/telemetry/tracking_events.js";
export {
    platformContextAuthToApiToken,
    platformContextToBootstrapData,
} from "./embedding/platformContext.js";
export {
    AnalyticalDesignerInternal as AnalyticalDesigner,
    type IAnalyticalDesignerInternalApi,
    type IAnalyticalDesignerInternalProps,
} from "./embedding/AnalyticalDesigner.js";
