// (C) 2026 GoodData Corporation

import { type ILocale } from "../base/localization.js";

import {
    type PluggableApplicationRegistryItem,
    isExternalPluggableApplicationRegistryItem,
    isLocalPluggableApplicationRegistryItem,
    isRemotePluggableApplicationRegistryItem,
} from "./index.js";

function ensureLeadingSlash(path: string): string {
    return path.startsWith("/") ? path : `/${path}`;
}

function normalizePath(path: string): string {
    const prefixed = ensureLeadingSlash(path);
    if (prefixed === "/") {
        return prefixed;
    }
    return prefixed.replace(/\/+$/, "");
}

function getRouteBase(app: PluggableApplicationRegistryItem): string | undefined {
    if (isRemotePluggableApplicationRegistryItem(app)) {
        return app.remote.routeBase;
    }
    if (isLocalPluggableApplicationRegistryItem(app)) {
        return app.local.routeBase;
    }
    return undefined;
}

/**
 * Composes the URL under which the given pluggable application is reachable.
 *
 * @remarks
 * A workspace-scoped application lives under `/workspace/\{workspaceId\}`, an organization-scoped one
 * under `/organization`. An external application contributes its own URL, with any `\{workspaceId\}`
 * placeholder substituted.
 *
 * @param app - application to compose the URL for
 * @param workspaceId - workspace to compose the URL in; substituted as an empty string when omitted
 * @returns the application's URL
 *
 * @alpha
 */
export function getPluggableApplicationHref(
    app: PluggableApplicationRegistryItem,
    workspaceId?: string,
): string {
    if (isExternalPluggableApplicationRegistryItem(app)) {
        return app.external.url.replaceAll("{workspaceId}", workspaceId ?? "");
    }

    const routeBase = getRouteBase(app);
    if (routeBase === undefined) {
        return "#";
    }

    const scopeBase =
        app.applicationScope === "organization"
            ? "/organization"
            : app.applicationScope === "workspace"
              ? `/workspace/${workspaceId ?? ""}`
              : undefined;

    if (!scopeBase) {
        throw new Error(
            `[pluggable-application] Unsupported application scope "${app.applicationScope}" for app "${app.id}".`,
        );
    }

    return normalizePath(`${normalizePath(scopeBase)}${ensureLeadingSlash(routeBase)}`);
}

/**
 * Resolves the application's title in the given locale.
 *
 * @remarks
 * Falls back to the manifest's plain `title` when the locale is unknown or the application declares no
 * translation for it. Each application carries its titles in the registry because its own locale bundle
 * is loaded only once the user opens it.
 *
 * @param app - application to resolve the title of
 * @param locale - locale to resolve the title in
 * @returns the localized title, or the plain one
 *
 * @alpha
 */
export function getPluggableApplicationLocalizedTitle(
    app: PluggableApplicationRegistryItem,
    locale: ILocale | undefined,
): string {
    if (locale && app.localizedTitle) {
        const localizedTitle = app.localizedTitle[locale];
        if (localizedTitle) {
            return localizedTitle;
        }
    }
    return app.title;
}
