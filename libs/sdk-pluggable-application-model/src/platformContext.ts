// (C) 2026 GoodData Corporation

import { type IUserSettings } from "@gooddata/sdk-backend-spi";
import {
    type ApplicationScope,
    type IEntitlementDescriptor,
    type ILocale,
    type ITheme,
    type IUser,
    type IWhiteLabeling,
    type IWorkspacePermissions,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * Pluggable application embedding mode.
 *
 * @alpha
 */
export type EmbeddingMode = "none" | "iframe" | "export";

/**
 * Panther tier.
 *
 * @alpha
 */
export enum PantherTier {
    TRIAL = "TRIAL",
    INTERNAL = "INTERNAL",
    POC = "POC",
    LABS = "LABS",
    DEMO = "DEMO",
}

/**
 * Organization information available in the platform context.
 *
 * @alpha
 */
export interface IOrganization {
    id: string;
    title?: string;
    bootstrapUser?: ObjRef;
    bootstrapUserGroup?: ObjRef;
    identityProviderType?: string;
}

/**
 * Organization-level permissions.
 *
 * @remarks
 * There is no canonical org-permissions type in `@gooddata/sdk-model` today; this interface is intentionally minimal
 * and expected to evolve.
 *
 * @alpha
 */
export interface IOrganizationPermissions {
    canManageOrganization?: boolean;
    hasBaseUiAccess?: boolean;
    canCreateDevToken?: boolean;
}

/**
 * Navigation facade exposed to pluggable applications.
 *
 * @alpha
 */
export interface IPluggableApplicationNavigation {
    go(to: string): void;
    openApp(id: string, path?: string): void;
}

// ---------------------------------------------------------------------------
// Authentication credentials
// ---------------------------------------------------------------------------

/**
 * Cookie / session-based authentication — no explicit credentials required.
 *
 * @alpha
 */
export interface IContextDeferredAuthCredentials {
    type: "contextDeferred";
    /**
     * Optional external identity-provider identifier for SSO flows.
     * When building a backend with `ContextDeferredAuthProvider`, pass
     * this value to `createNotAuthenticatedHandler` (or equivalent) so
     * the redirect targets the correct IdP login page.
     */
    externalProviderId?: string;
}

/**
 * GoodData API-token authentication.
 *
 * @alpha
 */
export interface IApiTokenAuthCredentials {
    type: "apiToken";
    token: string;
}

/**
 * JWT-based authentication.
 *
 * @alpha
 */
export interface IJwtAuthCredentials {
    type: "jwt";
    token: string;
    secondsBeforeTokenExpirationToCallReminder?: number;
}

/**
 * Authentication credentials for building a backend instance.
 *
 * @remarks
 * The shell application determines authentication method and passes the
 * resolved credentials in the platform context. Client applications use
 * them to construct their own backend instance.
 *
 * @alpha
 */
export type IAuthCredentials =
    | IContextDeferredAuthCredentials
    | IApiTokenAuthCredentials
    | IJwtAuthCredentials;

// ---------------------------------------------------------------------------
// Platform context
// ---------------------------------------------------------------------------

/**
 * Platform context contract version 1.0.
 *
 * @remarks
 * The shell application populates this context after bootstrapping and
 * passes it to pluggable (client) applications. It intentionally does NOT
 * include a backend instance — client applications create their own using
 * the provided {@link IAuthCredentials} to avoid SDK version desync.
 *
 * @alpha
 */
export interface IPlatformContextV1 {
    version: "1.0";

    /**
     * Authentication credentials resolved by the shell.
     * Client applications use these to build their own backend instance.
     */
    auth: IAuthCredentials;

    user: IUser;
    organization?: IOrganization;

    organizationPermissions?: IOrganizationPermissions;
    workspacePermissions?: IWorkspacePermissions;

    entitlements?: IEntitlementDescriptor[];

    userSettings: IUserSettings;

    whiteLabeling: IWhiteLabeling | undefined;
    preferredLocale?: ILocale;
    pantherTier?: PantherTier;
    theme?: ITheme;

    currentWorkspaceId?: string;
    currentApplicationScope?: ApplicationScope;

    embeddingMode: EmbeddingMode;
}

/**
 * Platform context contract.
 *
 * @alpha
 */
export type IPlatformContext = IPlatformContextV1;

/**
 * Type guard for {@link IPlatformContextV1}.
 *
 * @alpha
 */
export function isPlatformContextV1(context: unknown): context is IPlatformContextV1 {
    return (
        typeof context === "object" &&
        context !== null &&
        "version" in context &&
        (context as { version?: unknown }).version === "1.0"
    );
}
