// (C) 2026 GoodData Corporation

import {
    type IAnalyticalBackend,
    type IUserSettings,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import {
    type IColorPalette,
    type IEntitlementDescriptor,
    type ILocale,
    type IUser,
} from "@gooddata/sdk-model";
import { isWorkspaceScopedSettings } from "@gooddata/sdk-pluggable-application-model";

import { type IBootstrapData } from "../../actions/app_context_actions.js";
import { hostValuesToBootstrapData } from "../../embedding/platformContext.js";

async function optional<T>(name: string, load: () => Promise<T>): Promise<T | undefined> {
    try {
        return await load();
    } catch (error) {
        console.warn(`Analytical Designer cannot load the ${name}; it uses the default.`, error);
        return undefined;
    }
}

interface IOrganizationIdentity {
    id: string;
    title?: string;
}

async function loadOrganization(backend: IAnalyticalBackend): Promise<IOrganizationIdentity> {
    const organization = await backend.organizations().getCurrentOrganization();
    const { id, title } = await organization.getDescriptor();
    return { id, title };
}

/** Values the host already has are not loaded again. */
export interface IBackendBootstrapDataOptions {
    settings?: IUserWorkspaceSettings | IUserSettings;
    user?: IUser;
    organization?: IOrganizationIdentity;
    entitlements?: IEntitlementDescriptor[];
    colorPalette?: IColorPalette;
    /** False skips the theme request; the data then carries no theme. */
    loadTheme?: boolean;
}

/** The settings AD runs with: the workspace settings, or the user settings without a workspace. */
export function loadSettings(
    backend: IAnalyticalBackend,
    workspaceId: string | undefined,
): Promise<IUserWorkspaceSettings | IUserSettings> {
    return workspaceId
        ? backend.workspace(workspaceId).settings().getSettingsForCurrentUser()
        : backend.currentUser().settings().getSettings();
}

/**
 * AD's bootstrap data loaded from the backend, for a host that passes none. The user and the settings
 * are required. The other values are optional and fall back to their defaults. The workspace title
 * is the workspace identifier: only the standalone header showed it.
 */
export async function backendBootstrapData(
    backend: IAnalyticalBackend,
    workspaceId: string | undefined,
    locale: ILocale | undefined,
    { loadTheme = true, ...known }: IBackendBootstrapDataOptions = {},
): Promise<IBootstrapData> {
    const workspace = workspaceId ? backend.workspace(workspaceId) : undefined;
    const [user, settings, organization, entitlements, colorPalette, theme] = await Promise.all([
        known.user ?? backend.currentUser().getUserWithDetails(),
        known.settings ?? loadSettings(backend, workspaceId),
        known.organization ?? optional("organization", () => loadOrganization(backend)),
        known.entitlements ?? optional("entitlements", () => backend.entitlements().resolveEntitlements()),
        known.colorPalette ??
            (workspace ? optional("color palette", () => workspace.styling().getColorPalette()) : undefined),
        workspace && loadTheme ? optional("theme", () => workspace.styling().getTheme()) : undefined,
    ]);
    const data = hostValuesToBootstrapData({
        workspaceId,
        locale,
        user,
        settings,
        organization,
        isOrganizationAdmin: user.permissions?.includes("MANAGE"),
        entitlements,
        whiteLabeling: settings.whiteLabeling,
        colorPalette,
        theme,
    });
    return {
        ...data,
        mapboxToken: isWorkspaceScopedSettings(settings) ? settings.mapboxToken : undefined,
        maxZoomLevel: settings.maxZoomLevel,
    };
}
