// (C) 2026 GoodData Corporation

import {
    type ApplicationScope,
    type PluggableApplicationRegistryItem,
    isExternalPluggableApplicationRegistryItem,
    isLocalPluggableApplicationRegistryItem,
    isRemotePluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

const WORKSPACE_PATH_PATTERN = /^\/workspace\/(?<workspaceId>[^/]+)(?:\/|$)/;

/**
 * Returns the application scope for the given URL path, or undefined if the path
 * does not match a known scope.
 */
export function getApplicationScopeFromPath(path: string): ApplicationScope | undefined {
    const isPathMatching = (definitionPath: `/${string}`) =>
        path === definitionPath || path.startsWith(definitionPath + "/");

    if (isPathMatching("/organization")) {
        return "organization";
    }
    if (isPathMatching("/workspace")) {
        return "workspace";
    }
    return undefined;
}

/**
 * Returns the workspace id for the given URL path, or undefined if the path
 * does not contain a workspace id.
 */
export function getWorkspaceIdFromPath(pathname: string | undefined): string | undefined {
    return WORKSPACE_PATH_PATTERN.exec(pathname ?? "")?.groups?.["workspaceId"];
}

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

function resolveWorkspaceId(ctx: IPlatformContext, pathname?: string): string | undefined {
    if (ctx.currentWorkspaceId) {
        return ctx.currentWorkspaceId;
    }

    return getWorkspaceIdFromPath(pathname);
}

function composeInternalAppPath(
    app: PluggableApplicationRegistryItem,
    routeBase: string,
    ctx: IPlatformContext,
    pathname?: string,
): string {
    const scopeBase =
        app.applicationScope === "organization"
            ? "/organization"
            : app.applicationScope === "workspace"
              ? `/workspace/${resolveWorkspaceId(ctx, pathname) ?? ""}`
              : undefined;

    if (!scopeBase) {
        throw new Error(
            `[host-runtime/routing] Unsupported application scope "${app.applicationScope}" for app "${app.id}".`,
        );
    }

    return normalizePath(`${normalizePath(scopeBase)}${ensureLeadingSlash(routeBase)}`);
}

/**
 * Substitutes `{workspaceId}` placeholders in an external app URL with the
 * currently resolved workspace id. URLs with no placeholder pass through
 * unchanged, so apps that don't care about workspace context can keep using
 * a plain literal URL (e.g. `https://docs.example.com`).
 */
export function substituteExternalUrlPlaceholders(
    url: string,
    ctx: IPlatformContext,
    pathname?: string,
): string {
    if (!url.includes("{workspaceId}")) {
        return url;
    }
    const workspaceId = resolveWorkspaceId(ctx, pathname) ?? "";
    return url.replaceAll("{workspaceId}", workspaceId);
}

export function getApplicationHref(
    app: PluggableApplicationRegistryItem,
    ctx: IPlatformContext,
    pathname?: string,
): string {
    if (isExternalPluggableApplicationRegistryItem(app)) {
        return substituteExternalUrlPlaceholders(app.external.url, ctx, pathname);
    }
    if (isLocalPluggableApplicationRegistryItem(app)) {
        return composeInternalAppPath(app, app.local.routeBase, ctx, pathname);
    }
    if (isRemotePluggableApplicationRegistryItem(app)) {
        return composeInternalAppPath(app, app.remote.routeBase, ctx, pathname);
    }
    return "#";
}

export function isInternalAppRouteActive(
    app: PluggableApplicationRegistryItem,
    ctx: IPlatformContext,
    pathname: string,
): boolean {
    if (isExternalPluggableApplicationRegistryItem(app)) {
        return false;
    }

    const basePath = normalizePath(getApplicationHref(app, ctx, pathname));
    const normalizedPathname = normalizePath(pathname);
    return normalizedPathname === basePath || normalizedPathname.startsWith(`${basePath}/`);
}

export function getActiveInternalApplication(
    apps: PluggableApplicationRegistryItem[],
    ctx: IPlatformContext,
    pathname: string,
): PluggableApplicationRegistryItem | undefined {
    return apps.find(
        (app) =>
            !isExternalPluggableApplicationRegistryItem(app) && isInternalAppRouteActive(app, ctx, pathname),
    );
}
