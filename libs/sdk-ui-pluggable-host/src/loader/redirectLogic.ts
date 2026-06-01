// (C) 2026 GoodData Corporation

import { type ApplicationScope, type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { debugLog } from "../debug.js";

import { getLastVisitedApp, setLastVisitedApp } from "./lastVisitedApp.js";
import { getActiveInternalApplication, getApplicationHref } from "./routing.js";

/**
 * Thrown when the current URL does not correspond to any accessible application.
 */
export class AppNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AppNotFoundError";
    }
}

export interface IResolveRedirectTargetOptions {
    /**
     * Fully permission-filtered apps (including workspace permissions).
     * Used for mount validation and as the redirect target when workspace permissions are available.
     */
    apps: PluggableApplicationRegistryItem[];
    ctx: IPlatformContext;
    pathname: string;
    /** Fetches the first workspace ID for the current user. */
    fetchFirstWorkspaceId: () => Promise<string | undefined>;
}

/**
 * Returns whether the given pathname is at the root of the specified scope.
 *
 * @example
 * - `/` → true (always considered a scope root)
 * - `/organization` → true; `/organization/ai-hub` → false
 * - `/workspace/abc` → true; `/workspace/abc/dashboards` → false
 * - `/workspace/` with no workspaceId → true (no workspace selected yet)
 */
function isAtScopeRoot(pathname: string, scope: ApplicationScope, workspaceId?: string): boolean {
    if (!pathname || pathname === "/") {
        return true;
    }
    if (scope === "organization") {
        return pathname === "/organization" || pathname === "/organization/";
    }
    if (scope === "workspace") {
        if (!workspaceId) {
            // No workspace ID in the URL means we haven't landed on a specific workspace yet — treat as root
            return true;
        }
        const wsRoot = `/workspace/${workspaceId}`;
        return pathname === wsRoot || pathname === wsRoot + "/";
    }
    // TypeScript exhaustive check — catches unhandled ApplicationScope additions at compile time
    const _: never = scope;
    throw new Error(`[host-runtime/redirectLogic] Unhandled application scope: ${_}`);
}

/**
 * Returns the last-visited app for the given scope if it is in the eligible list,
 * otherwise falls back to the first app.
 */
function preferLastVisitedApp(
    apps: PluggableApplicationRegistryItem[],
    scope: ApplicationScope,
): PluggableApplicationRegistryItem | undefined {
    const lastVisitedId = getLastVisitedApp(scope);
    if (lastVisitedId) {
        const match = apps.find((app) => app.id === lastVisitedId);
        if (match) {
            return match;
        }
    }
    return apps[0];
}

/**
 * Handles navigation when the user is inside the organization scope.
 * Either redirects to the preferred org app (last-visited or first, when at the org root)
 * or validates that the current path maps to a known app.
 * Individual modules are responsible for their own permission checks.
 */
function resolveOrgScopeTarget(
    apps: PluggableApplicationRegistryItem[],
    ctx: IPlatformContext,
    pathname: string,
): string | null {
    if (isAtScopeRoot(pathname, "organization")) {
        const target = preferLastVisitedApp(apps, "organization");
        if (!target) {
            debugLog(
                "[host-runtime/redirect] org scope: at root but no org apps available — throwing not-found",
            );
            throw new AppNotFoundError("No organization-scoped applications are available.");
        }
        const href = getApplicationHref(target, ctx, pathname);
        debugLog(`[host-runtime/redirect] org scope: at root, redirecting to preferred org app → ${href}`);
        return href;
    }

    const active = getActiveInternalApplication(apps, ctx, pathname);
    if (!active) {
        debugLog(
            `[host-runtime/redirect] org scope: no app matched pathname → ${pathname} — throwing not-found`,
        );
        throw new AppNotFoundError(`No application found at path: ${pathname}`);
    }
    debugLog(`[host-runtime/redirect] org scope: active app matched → ${active.id}`);
    setLastVisitedApp("organization", active.id);
    return null;
}

/**
 * Resolves where the shell app should navigate given the current URL and permission context.
 *
 * @returns
 * - A URL string → caller must navigate to this URL (e.g. via React Router)
 * - `null` → the current URL is valid; render the active app
 *
 * @throws {AppNotFoundError} The current path maps to no accessible application (show 404)
 * @throws {Error} Unexpected failure (show generic error screen)
 */
export async function resolveRedirectTarget({
    apps,
    ctx,
    pathname,
    fetchFirstWorkspaceId,
}: IResolveRedirectTargetOptions): Promise<string | null> {
    const scope = ctx.currentApplicationScope;
    const workspaceId = ctx.currentWorkspaceId;

    debugLog(
        `[host-runtime/redirect] resolveRedirectTarget: scope=${scope ?? "(none)"} workspaceId=${workspaceId ?? "(none)"} pathname=${pathname} apps=${apps.length}`,
    );

    if (scope === "organization") {
        return resolveOrgScopeTarget(apps, ctx, pathname);
    }

    if (scope === "workspace" && !isAtScopeRoot(pathname, scope, workspaceId)) {
        // User is at a specific path inside workspace scope — validate it maps to a permitted app
        const active = getActiveInternalApplication(apps, ctx, pathname);
        if (!active) {
            debugLog(
                `[host-runtime/redirect] workspace scope: no app matched pathname → ${pathname} — throwing not-found`,
            );
            throw new AppNotFoundError(`No application found at path: ${pathname}`);
        }
        debugLog(`[host-runtime/redirect] workspace scope: active app matched → ${active.id}`);
        setLastVisitedApp("workspace", active.id);
        return null;
    }

    // At a workspace root (with or without workspace ID) or the top-level app root.
    // Strategy: redirect in up to two hops via client-side navigation.
    //   1. If no workspace ID → fetch the first workspace → redirect to /workspace/{id}
    //   2. If at workspace root with ID → redirect to the first permitted app

    if (!workspaceId) {
        // When scope is undefined (user landed on "/"), prefer organization scope
        // for users with org management permission.
        if (!scope && ctx.organizationPermissions?.canManageOrganization) {
            debugLog("[host-runtime/redirect] user has canManageOrganization — redirecting to /organization");
            return "/organization";
        }

        // Hop 1: resolve a workspace ID and redirect to its root so that the next render cycle
        // can load workspace permissions and filter apps accurately.
        debugLog("[host-runtime/redirect] no workspace ID — fetching first workspace");
        const resolvedWorkspaceId = await fetchFirstWorkspaceId();

        if (!resolvedWorkspaceId) {
            debugLog("[host-runtime/redirect] no workspace available for user — throwing not-found");
            throw new AppNotFoundError("No workspace is available for this user.");
        }

        const wsRootHref = `/workspace/${resolvedWorkspaceId}`;
        debugLog(`[host-runtime/redirect] redirecting to workspace root → ${wsRootHref}`);
        return wsRootHref;
    }

    // Hop 2: workspace ID is known, workspace permissions are loaded, apps are fully filtered.
    // Redirect to the preferred (last-visited or first) workspace app.
    const targetApp = preferLastVisitedApp(apps, "workspace");

    if (!targetApp) {
        debugLog("[host-runtime/redirect] no permitted workspace apps — throwing not-found");
        throw new AppNotFoundError("No workspace-scoped applications are available for this workspace.");
    }

    const href = getApplicationHref(targetApp, ctx, pathname);
    debugLog(
        `[host-runtime/redirect] redirecting to preferred workspace app → ${href} (app: ${targetApp.id})`,
    );
    return href;
}
