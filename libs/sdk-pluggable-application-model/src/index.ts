// (C) 2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

/**
 * Model contracts for pluggable application integration.
 *
 * @packageDocumentation
 */

export { DefaultApplicationId } from "./defaultPlatformApplications.js";

export { LIB_VERSION, LIB_DESCRIPTION, LIB_NAME } from "./__version.js";

export {
    type EmbeddingMode,
    type IApiTokenAuthCredentials,
    type IAuthCredentials,
    type IContextDeferredAuthCredentials,
    type IEffectiveSettings,
    type IJwtAuthCredentials,
    type IOrganization,
    type IOrganizationPermissions,
    type IPlatformContext,
    type IPlatformContextV1,
    type IPluggableApplicationNavigation,
    PantherTier,
    isPlatformContextV1,
    isWorkspaceScopedSettings,
} from "./platformContext.js";
export { type ILocale } from "@gooddata/sdk-model";

export {
    type IAppHeaderOptions,
    type IAppInstance,
    type KnownPluggableAppEventTypeName,
    type IPluggableApp,
    type IPluggableApplicationMountHandle,
    type IPluggableApplicationMountOptions,
    type IPluggableAppEvent,
    type IPluggableAppTelemetryCallbacks,
    type IReloadPlatformContextRequestedEvent,
    type ITelemetryEventOptions,
    isReloadPlatformContextRequestedEvent,
    type PluggableApplicationMount,
    PluggableAppEventType,
    type PluggableAppEventTypeName,
    reloadPlatformContextRequested,
    type TelemetryChannel,
} from "./mount.js";

export {
    type IHostUiModule,
    type IHostUiMountHandle,
    type IHostUiMountOptions,
    type IHostUiNotification,
    type INewDeploymentAvailableHostUiNotification,
    type HostUiMount,
} from "./hostUi.js";
