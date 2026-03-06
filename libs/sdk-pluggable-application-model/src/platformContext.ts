// (C) 2026 GoodData Corporation

import { type IAnalyticalBackend, type IUserSettings } from "@gooddata/sdk-backend-spi";
import {
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

/**
 * Platform context contract version 1.0.
 *
 * @alpha
 */
export interface IPlatformContextV1 {
    version: "1.0";

    backend: IAnalyticalBackend;
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

    currentPath?: string;
    currentWorkspaceId?: string;

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
