// (C) 2026 GoodData Corporation

import {
    type ApplicationScope,
    type PluggableApplicationRegistryItem,
    getPluggableApplicationHref,
    isExternalPluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

const WORKSPACE_PATH_PATTERN = /^\/workspace\/(?<workspaceId>[^/]+)(?:\/|$)/;

export function stripEmbedPrefix(pathname: string): string {
    return pathname.startsWith("/embedded/") ? pathname.slice("/embedded".length) : pathname;
}

/**
 * Returns the application scope for the given URL path, or undefined if the path
 * does not match a known scope.
 */
export function getApplicationScopeFromPath(path: string): ApplicationScope | undefined {
    const stripped = stripEmbedPrefix(path);
    const isPathMatching = (definitionPath: `/${string}`) =>
        stripped === definitionPath || stripped.startsWith(definitionPath + "/");

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
    return WORKSPACE_PATH_PATTERN.exec(stripEmbedPrefix(pathname ?? ""))?.groups?.["workspaceId"];
}

function ensureLeadingSlash(path: string): string {
    return path.startsWith("/") ? path : `/${path}`;
}

export function normalizePath(path: string): string {
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

export function getApplicationHref(
    app: PluggableApplicationRegistryItem,
    ctx: IPlatformContext,
    pathname?: string,
): string {
    return getPluggableApplicationHref(app, resolveWorkspaceId(ctx, pathname));
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
    const normalizedPathname = normalizePath(stripEmbedPrefix(pathname));
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
