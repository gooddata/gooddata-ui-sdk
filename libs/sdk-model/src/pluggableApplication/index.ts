// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type ILocale } from "../base/localization.js";
import { type IEntitlementsName } from "../entitlements/index.js";
import { type OrganizationPermissionAssignment } from "../organization/index.js";
import { type IWorkspacePermissions } from "../permissions/index.js";
import { type IFeatureFlags, type IPermanentSettings } from "../settings/settings.js";

/**
 * Defines in which scope the application should be registered.
 *
 * The default UI uses this information to determine if the application is visible in
 * the organization or workspace portal.
 *
 * @alpha
 */
export type ApplicationScope = "organization" | "workspace";

/**
 * Localized titles of pluggable application.
 *
 * @alpha
 */
export type LocalizedTitle = {
    [locale in ILocale]: string;
};

/**
 * Logical condition for evaluating requirement properties.
 *
 * Supports composable AND/OR logic for determining whether an application should be accessible.
 * Conditions can be nested arbitrarily to express complex boolean expressions.
 *
 * There are three forms:
 *
 * 1. **Plain object (implicit AND)** — all specified properties must match their expected values.
 *    This is the simplest form and is backwards compatible with the original flat object types.
 *    Example:
 *      \{ canInitData: true, canRefreshData: true \} // both must be true
 *
 * 2. **$or condition** — at least one of the nested conditions must be satisfied.
 *    Example:
 *      \{ \$or: [\{ canInitData: true \}, \{ canRefreshData: true \}] \} // either one suffices
 *
 * 3. **$and condition** — all nested conditions must be satisfied. Useful when composing
 *    with $or at deeper levels to express grouped AND clauses.
 *    Example:
 *      \{
 *          \$or: [
 *              \{ \$and: [\{ canInitData: true \}, \{ canManageProject: true \}] \},
 *              \{ canRefreshData: true \},
 *          ]
 *      \}
 *
 * @alpha
 */
export type Condition<T> = T | IConditionOr<T> | IConditionAnd<T>;

/**
 * OR condition — at least one of the nested conditions must be satisfied.
 *
 * @alpha
 */
export interface IConditionOr<T> {
    $or: Array<Condition<T>>;
}

/**
 * AND condition — all nested conditions must be satisfied.
 *
 * @alpha
 */
export interface IConditionAnd<T> {
    $and: Array<Condition<T>>;
}

/**
 * Settings and their values that must be set for the pluggable application to be accessible for the currently
 * logged user.
 *
 * @alpha
 */
export type RequiredSettings = Condition<Partial<IPermanentSettings | IFeatureFlags>>;

/**
 * Entitlements and their values that must be set for the pluggable application to be accessible for
 * the currently logged user.
 *
 * @alpha
 */
export type RequiredEntitlements = Condition<
    Partial<{
        [entitlement in IEntitlementsName]: string | boolean;
    }>
>;

/**
 * Workspace permissions and their values that must be set for the pluggable application to be accessible for
 * the currently logged user.
 *
 * @alpha
 */
export type RequiredWorkspacePermissions = Condition<Partial<IWorkspacePermissions>>;

/**
 * Organization permissions that must be set for the pluggable application to be accessible for
 * the currently logged user.
 *
 * @alpha
 */
export type RequiredOrganizationPermissions = Condition<
    Partial<{
        [permission in OrganizationPermissionAssignment]: boolean;
    }>
>;

/**
 * Pluggable application meta-information, v1.
 *
 * @alpha
 */
export interface IPluggableApplicationMetaV1 {
    /**
     * The version of the application API.
     *
     * Explicit version is specified here as the applications list will be passed down the contract,
     * for example, to shell application UI rendered, that can use 3rd party module for rendering.
     * The local and remote registry manifest is versioned, but these types will not be passed down once
     * the resulting list of the application is constructed from both of these manifests.
     */
    apiVersion: "1.0";
    /**
     * Unique ID of the application.
     *
     * Used when the application is referenced by the remote registry override and in any other case
     * when the application needs to be referenced.
     */
    id: string;

    /**
     * States if the application is enabled and should be allowed to load by the shell application.
     *
     * Used mainly by the remote registry override to disable the standard application.
     */
    isEnabled?: boolean;

    /**
     * Title of the application.
     *
     * Used, for example, in Application Header, when the localized title variant is not provided.
     */
    title: string;

    /**
     * Optional localized titles map keyed by supported locale.
     *
     * It is used in the Application Header to display a localized name of the application. Each application
     * has its own locale bundle, but it can't be used to store the localized name of the application.
     * The application bundle is loaded and parsed only after the user clicks on the application link.
     */
    localizedTitle?: LocalizedTitle;

    /**
     * Defines in which scope the application should be registered.
     *
     * The default UI uses this information to determine if the application is visible in
     * the organization or workspace portal.
     */
    applicationScope: ApplicationScope;

    /**
     * Order of the application in the menu.
     *
     * Applications are sorted and rendered in the default UI according to this value, from smallest
     * to the highest.
     */
    menuOrder: number;

    /**
     * Settings (and feature flags) and their values that must be set for the pluggable application to be
     * accessible for the currently
     * logged user.
     */
    requiredSettings?: RequiredSettings;

    /**
     * Entitlements and their values that must be set for the pluggable application to be accessible for
     * the currently logged user.
     */
    requiredEntitlements?: RequiredEntitlements;

    /**
     * Workspace permissions and their values that must be set for the pluggable application to be
     * accessible for the currently logged user.
     */
    requiredWorkspacePermissions?: RequiredWorkspacePermissions;

    /**
     * Organization permissions that must be set for the pluggable application to be accessible for
     * the currently logged user.
     */
    requiredOrganizationPermissions?: RequiredOrganizationPermissions;
}

/**
 * Pluggable application meta-information.
 *
 * @alpha
 */
export type PluggableApplicationMeta = IPluggableApplicationMetaV1;

/**
 * Definition of the remote pluggable application.
 * The application is loaded via Module Federation.
 *
 * @alpha
 */
export interface IRemotePluggableApplicationModule {
    /**
     * Full URL of the remote federated module with the application bundle.
     *
     * @example
     * https://my-remote-federated-module.com/remoteEntry.js
     */
    url: string;

    /**
     * Unique module federation scope value (must match the remote module definition during build)
     * Must be unique within the same remote federation to not share dependencies and scope with another
     * application.
     *
     * @example
     * "my-remote-federated-module"
     */
    scope: string;

    /**
     * Exposed module name. Must match the remote module definition.
     * Maps to internal application module (e.g. "./src/remote-entry.tsx")
     *
     * @example
     * "./AppModule"
     */
    module: string;

    /**
     * Base route of the application.
     * It is relative to the shell application route.
     *
     * @example
     * "/my-application"
     *
     * When the application is registered to "organization" scope, the application will be hosted at
     * /organization/my-application.
     * When the application is registered to the "workspace" scope, the application will be hosted at
     * /workspace/\{workspaceId\}/my-application.
     */
    routeBase: string;
}

/**
 * Remote pluggable application registry item, v1.
 * Loaded via Module Federation.
 *
 * @alpha
 */
export interface IRemotePluggableApplicationRegistryItemV1 extends IPluggableApplicationMetaV1 {
    /**
     * Defines how the remote-federated module should be loaded.
     */
    remote: IRemotePluggableApplicationModule;
}

/**
 * Remote pluggable application registry item.
 * Loaded via Module Federation.
 *
 * @alpha
 */
export type RemotePluggableApplicationRegistryItem = IRemotePluggableApplicationRegistryItemV1;

/**
 * Definition of the pluggable application deployed locally with the shell application.
 * The application is loaded from the host bundle asynchronously via lazy-loaded import.
 *
 * @alpha
 */
export interface ILocalPluggableApplicationModule {
    /**
     * Base route of the application.
     * It is relative to the shell application route.
     *
     * @example
     * "/my-application
     *
     * When the application is registered to "organization" scope, the application will be hosted at
     * /organization/my-application.
     * When the application is registered to "workspace" scope, the application will be hosted at
     * /workspace/\{workspaceId\}/my-application.
     */
    routeBase: string;
}

/**
 * Local pluggable application registry item, v1.
 * Loaded from the host bundle asynchronously.
 *
 * @alpha
 */
export interface ILocalPluggableApplicationRegistryItemV1 extends IPluggableApplicationMetaV1 {
    /**
     * Defines the local application module reference and route registration.
     *
     * The loader strategy is intentionally not part of this data contract. The host resolves
     * the loader implementation from application metadata (typically by `app.id`).
     */
    local: ILocalPluggableApplicationModule;
}

/**
 * Local pluggable application registry item.
 * Loaded from the host bundle asynchronously.
 *
 * @alpha
 */
export type LocalPluggableApplicationRegistryItem = ILocalPluggableApplicationRegistryItemV1;

/**
 * Definition of the pluggable application that is just a URL link.
 * The default UI will replace the application window with the URL link.
 *
 * @alpha
 */
export interface IExternalUrlPluggableApplicationModule {
    /**
     * URL of the external application.
     *
     * @example
     * https://google.com
     */
    url: string;
}

/**
 * External pluggable application registry item, v1.
 *
 * Loaded from an external application hosted module outside the shell, i.e., external link that will
 * replace the application window.
 *
 * @alpha
 */
export interface IExternalPluggableApplicationRegistryItemV1 extends IPluggableApplicationMetaV1 {
    /**
     * Defines where the web application should be redirected.
     */
    external: IExternalUrlPluggableApplicationModule;
}

/**
 * External pluggable application registry item.
 *
 * Loaded from an external application hosted module outside the shell, i.e., external link that will
 * replace the application window.
 *
 * @alpha
 */
export type ExternalPluggableApplicationRegistryItem = IExternalPluggableApplicationRegistryItemV1;

/**
 * Pluggable application registry item
 *
 * @alpha
 */
export type PluggableApplicationRegistryItem =
    | RemotePluggableApplicationRegistryItem
    | LocalPluggableApplicationRegistryItem
    | ExternalPluggableApplicationRegistryItem;

/**
 * Pluggable application registry, v1.
 *
 * @alpha
 */
export interface ILocalPluggableApplicationsRegistryV1 {
    /**
     * The version of the API used by the application manifest
     */
    apiVersion: "1.0";
    /**
     * The list of pluggable applications deployed in the shell application by default.
     */
    applications: PluggableApplicationRegistryItem[];
}

/**
 * Pluggable application registry
 *
 * @alpha
 */
export type LocalPluggableApplicationsRegistry = ILocalPluggableApplicationsRegistryV1;

/**
 * Pluggable application remote registry, v1.
 *
 * @alpha
 */
export interface IRemotePluggableApplicationsRegistryV1 {
    /**
     * The version of the API used by the application manifest
     */
    apiVersion: "1.0";
    /**
     * The overrides of the pluggable applications deployed in the shell application by default.
     *
     * Each override is mapped to a key that is the well-documented ID of the default pluggable application,
     * e.g., gdc-analytical-designer, gdc-dashboards, etc. The property can be used, for example, to disable
     * one of these applications or changing the order under which it is added to the Application Header menu.
     */
    overrides?: { [applicationId: string]: Partial<PluggableApplicationRegistryItem> };
    /**
     * The optional list of allowed standard applications.
     *
     * The array of well-documented IDs of the standard applications that are deployed in the shell
     * application by default. The property can be used to stabilize which of the standard applications
     * will be available in the Application Header menu. When a new standard application is deployed in
     * the shell application, it will not appear in the menu until it is added to the list of allowed
     * standard applications.
     */
    allowedStandardApplications?: string[];
    /**
     * The list of additional pluggable applications registered to the shell application.
     *
     * Mainly used to register 3rd party hosted remote module federated applications.
     */
    applications?: PluggableApplicationRegistryItem[];
    /**
     * Optional remote module federation definition for a custom shell UI module.
     *
     * @remarks
     * When set, the shell application loads the UI module from this remote instead of using the
     * built-in default shell UI. The loaded module must conform to the {@link @gooddata/sdk-pluggable-application-model#IShellUiModule}
     * interface.
     *
     * This allows organizations to fully replace the application chrome (header, navigation, layout)
     * with a custom implementation while keeping the pluggable application loading and lifecycle
     * management intact.
     */
    uiModule?: IRemotePluggableApplicationModule;
}

/**
 * Pluggable application remote registry
 *
 * @alpha
 */
export type RemotePluggableApplicationsRegistry = IRemotePluggableApplicationsRegistryV1;

/**
 * Type guard for ExternalPluggableApplicationRegistryItem
 *
 * @alpha
 */
export function isExternalPluggableApplicationRegistryItem(
    app: PluggableApplicationRegistryItem,
): app is ExternalPluggableApplicationRegistryItem {
    return !isEmpty(app) && (app as ExternalPluggableApplicationRegistryItem).external !== undefined;
}

/**
 * Type guard for LocalPluggableApplicationRegistryItem
 *
 * @alpha
 */
export function isLocalPluggableApplicationRegistryItem(
    app: PluggableApplicationRegistryItem,
): app is LocalPluggableApplicationRegistryItem {
    return !isEmpty(app) && (app as LocalPluggableApplicationRegistryItem).local !== undefined;
}

/**
 * Type guard for RemotePluggableApplicationRegistryItem
 *
 * @alpha
 */
export function isRemotePluggableApplicationRegistryItem(
    app: PluggableApplicationRegistryItem,
): app is RemotePluggableApplicationRegistryItem {
    return !isEmpty(app) && (app as RemotePluggableApplicationRegistryItem).remote !== undefined;
}
