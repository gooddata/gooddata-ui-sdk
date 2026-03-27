// (C) 2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

/**
 * Model contracts for pluggable application integration.
 *
 * @packageDocumentation
 */

export {
    type EmbeddingMode,
    type IOrganization,
    type IOrganizationPermissions,
    type IPlatformContext,
    type IPlatformContextV1,
    type IPluggableApplicationNavigation,
    PantherTier,
    isPlatformContextV1,
} from "./platformContext.js";
export { type ILocale } from "@gooddata/sdk-model";

export {
    type IAppInstance,
    type IPluggableApp,
    type IPluggableApplicationMountHandle,
    type IPluggableApplicationMountOptions,
    type IPluggableAppEvent,
    type IPluggableAppTelemetryCallbacks,
    type ITelemetryEventOptions,
    type PluggableApplicationMount,
    type TelemetryChannel,
} from "./mount.js";

export {
    type IShellUiModule,
    type IShellUiMountHandle,
    type IShellUiMountOptions,
    type ShellUiMount,
} from "./shellUi.js";
