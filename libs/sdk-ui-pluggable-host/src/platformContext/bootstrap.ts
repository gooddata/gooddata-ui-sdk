// (C) 2026 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IEntitlementDescriptor, type ITheme, type IWhiteLabeling } from "@gooddata/sdk-model";
import {
    type IOrganization,
    type IOrganizationPermissions,
    type IPlatformContext,
    PantherTier,
} from "@gooddata/sdk-pluggable-application-model";

const DEFAULT_WHITE_LABELING: IWhiteLabeling = { enabled: false };
const BOOTSTRAP_LOG_PREFIX = "[host-runtime/bootstrap]";

function resolvePantherTier(entitlements: IEntitlementDescriptor[]): PantherTier {
    const tier = entitlements.find((e) => e.name === "Tier")?.value?.toUpperCase();
    switch (tier) {
        case PantherTier.INTERNAL:
            return PantherTier.INTERNAL;
        case PantherTier.POC:
            return PantherTier.POC;
        case PantherTier.LABS:
            return PantherTier.LABS;
        case PantherTier.DEMO:
            return PantherTier.DEMO;
        case PantherTier.TRIAL:
        default:
            return PantherTier.TRIAL;
    }
}

export interface IBootstrapResult {
    user: IPlatformContext["user"];
    userSettings: IPlatformContext["userSettings"];
    organization: IOrganization | undefined;
    organizationPermissions: IOrganizationPermissions;
    entitlements: IEntitlementDescriptor[];
    whiteLabeling: IWhiteLabeling;
    pantherTier: PantherTier;
    theme: ITheme;
}

export const PLATFORM_CONTEXT_VERSION: IPlatformContext["version"] = "1.0";

function logBootstrapWarning(message: string, error: unknown): void {
    // Keep fallback behavior while making silent backend failures visible.
    console.error(`${BOOTSTRAP_LOG_PREFIX} ${message}`, error);
}

function logAndRethrow(message: string) {
    return (error: unknown): never => {
        logBootstrapWarning(message, error);
        throw error;
    };
}

async function fetchOrganizationDetails(
    backend: IAnalyticalBackend,
    organizationId: string,
    includeAdditionalDetails = true,
) {
    return backend
        .organization(organizationId)
        .getDescriptor(includeAdditionalDetails)
        .catch((error): undefined => {
            logBootstrapWarning("Failed to load organization descriptor.", error);
            return undefined;
        });
}

export async function bootstrapApplication(backend: IAnalyticalBackend): Promise<IBootstrapResult> {
    const entitlementsPromise = backend
        .entitlements()
        .resolveEntitlements()
        .catch((error): IEntitlementDescriptor[] => {
            logBootstrapWarning("Failed to resolve entitlements.", error);
            return [];
        });

    const [userProfile, userSettings] = await Promise.all([
        backend
            .currentUser()
            .getUserWithDetails()
            .catch(logAndRethrow("Failed to load current user profile.")),
        backend
            .currentUser()
            .settings()
            .getSettings()
            .catch(logAndRethrow("Failed to load current user settings.")),
    ]);

    const includeAdditionalDetails = userProfile.permissions?.includes("MANAGE") ?? false;
    const organizationId =
        userProfile.organizationId ??
        (
            await backend
                .organizations()
                .getCurrentOrganization()
                .catch(logAndRethrow("Failed to load current organization."))
        ).organizationId;

    const [userInfo, organizationDescriptor, entitlements, theme] = await Promise.all([
        backend
            .organization(organizationId)
            .users()
            .getUser(userProfile.login)
            .catch((error): undefined => {
                logBootstrapWarning("Failed to load user details from organization.", error);
                return undefined;
            }),
        fetchOrganizationDetails(backend, organizationId, includeAdditionalDetails),
        entitlementsPromise,
        backend
            .organization(organizationId)
            .styling()
            .getTheme()
            .catch((error): ITheme => {
                logBootstrapWarning("Failed to load organization theme.", error);
                return {};
            }),
    ]);

    const user: typeof userProfile = {
        ...userProfile,
        email: userInfo?.email ?? userProfile.email,
    };

    const organizationPermissions: IOrganizationPermissions = {
        canManageOrganization: user.permissions?.includes("MANAGE") ?? false,
        hasBaseUiAccess: user.permissions?.includes("BASE_UI_ACCESS") ?? false,
        canCreateDevToken: user.permissions?.includes("SELF_CREATE_TOKEN") ?? false,
    };

    const organization: IOrganization | undefined = organizationDescriptor
        ? {
              id: organizationDescriptor.id,
              title: organizationDescriptor.title,
              bootstrapUser: organizationDescriptor.bootstrapUser,
              bootstrapUserGroup: organizationDescriptor.bootstrapUserGroup,
              identityProviderType: organizationDescriptor.identityProviderType,
          }
        : { id: organizationId, title: userProfile.organizationName };

    const pantherTier = resolvePantherTier(entitlements);

    const whiteLabelingSetting = userSettings.whiteLabeling;
    const whiteLabeling: IWhiteLabeling = {
        enabled: whiteLabelingSetting?.enabled ?? DEFAULT_WHITE_LABELING.enabled,
        logoUrl: whiteLabelingSetting?.logoUrl,
        faviconUrl: whiteLabelingSetting?.faviconUrl,
        appleTouchIconUrl: whiteLabelingSetting?.appleTouchIconUrl,
    };

    return {
        user,
        userSettings,
        organization,
        organizationPermissions,
        entitlements,
        whiteLabeling,
        pantherTier,
        theme,
    };
}
