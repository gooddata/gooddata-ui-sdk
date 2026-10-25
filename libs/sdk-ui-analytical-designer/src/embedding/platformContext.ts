// (C) 2026 GoodData Corporation

import {
    type IColorPalette,
    type IEntitlementDescriptor,
    type ILocale,
    type ITheme,
    type IUser,
    type IWhiteLabeling,
} from "@gooddata/sdk-model";
import {
    type IAuthCredentials,
    type IEffectiveSettings,
    type IPlatformContext,
    isWorkspaceScopedSettings,
} from "@gooddata/sdk-pluggable-application-model";

import { type IBootstrapData } from "../actions/app_context_actions.js";
import { type IApiToken } from "../backend.js";

// AD's IBootstrapData.user.separators is required; the host settings can lack them.
const DEFAULT_SEPARATORS = { thousand: ",", decimal: "." };

/** AD's token shape for the platform-context credentials; undefined for context-deferred auth. */
export function platformContextAuthToApiToken(auth: IAuthCredentials): IApiToken | undefined {
    if (auth.type === "apiToken") {
        return { apiToken: auth.token, apiTokenType: "gooddata" };
    }
    if (auth.type === "jwt") {
        return {
            apiToken: auth.token,
            apiTokenType: "jwt",
            secondsBeforeTokenExpirationToCallReminder: auth.secondsBeforeTokenExpirationToCallReminder,
        };
    }
    return undefined;
}

/** The external identity provider a context-deferred host authenticates through, if any. */
export function platformContextAuthExternalProviderId(auth: IAuthCredentials): string | undefined {
    return auth.type === "contextDeferred" ? auth.externalProviderId : undefined;
}

/**
 * The host values AD builds its bootstrap data from. A host without a platform context passes them directly.
 */
export interface IAdBootstrapHostValues {
    workspaceId?: string;
    locale?: ILocale;
    user: IUser;
    settings: IEffectiveSettings;
    organization?: { id: string; title?: string };
    isOrganizationAdmin?: boolean;
    entitlements?: IEntitlementDescriptor[];
    whiteLabeling?: IWhiteLabeling;
    colorPalette?: IColorPalette;
    theme?: ITheme;
}

/** AD's bootstrap data from host values; no applicationTitle, the host owns the tab title. */
export function hostValuesToBootstrapData({
    workspaceId,
    locale,
    user,
    settings,
    organization,
    isOrganizationAdmin,
    entitlements,
    whiteLabeling,
    colorPalette,
    theme,
}: IAdBootstrapHostValues): IBootstrapData {
    const projectId = workspaceId ?? "";
    const login = user.login;
    return {
        user: {
            firstName: user.firstName ?? user.fullName ?? login,
            lastName: user.lastName ?? "",
            email: user.email ?? "",
            uri: `/api/v1/entities/users/${login}`,
            domain: "",
            loginMD5: login,
            language: locale ?? "en-US",
            stashedProjectUri: projectId ? `/gdc/projects/${projectId}` : "",
            separators: settings.separators ?? DEFAULT_SEPARATORS,
            formatLocale: settings.formatLocale,
            created: "",
            companyName: organization?.title ?? "",
            permissions: user.permissions ?? [],
        },
        uiSettings: {
            organizationName: organization?.title ?? "",
            organizationId: organization?.id,
            displayProjects: true,
            displayAccountPage: true,
            logoUrl: whiteLabeling?.logoUrl ?? "",
            faviconUrl: whiteLabeling?.faviconUrl ?? "",
            appleTouchIconUrl: whiteLabeling?.appleTouchIconUrl ?? "",
            isBranded: !!whiteLabeling?.enabled,
            documentationUrl: "https://www.gooddata.com/developers/cloud-native/doc/cloud/",
            supportEmail: "tiger-beta@gooddata.com",
            supportForumUrl: "https://support.gooddata.com/home",
        },
        project: projectId
            ? {
                  identifier: projectId,
                  uri: `/gdc/projects/${projectId}`,
                  title: projectId,
                  templateUrl: "",
                  timezoneOffset: 0,
                  description: "",
                  defaultDashboard: "",
                  defaultDashboardTab: "",
                  analyticalDashboards: [],
              }
            : null,
        bear: {},
        tiger: {
            organizationEntitlements: entitlements ?? [],
            isOrganizationAdmin: !!isOrganizationAdmin,
        },
        colorPalette,
        theme,
        agGridToken: isWorkspaceScopedSettings(settings) ? settings.agGridToken : undefined,
    };
}

/** AD's bootstrap data from the platform context; no applicationTitle, the host owns the tab title. */
export function platformContextToBootstrapData(ctx: IPlatformContext): IBootstrapData {
    return hostValuesToBootstrapData({
        workspaceId: ctx.currentWorkspaceId,
        locale: ctx.preferredLocale,
        user: ctx.user,
        settings: ctx.workspaceSettings ?? ctx.userSettings,
        organization: ctx.organization,
        isOrganizationAdmin: ctx.organizationPermissions?.canManageOrganization,
        entitlements: ctx.entitlements,
        whiteLabeling: ctx.whiteLabeling,
        colorPalette: ctx.colorPalette,
        theme: ctx.theme,
    });
}
