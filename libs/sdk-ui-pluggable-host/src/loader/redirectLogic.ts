// (C) 2026 GoodData Corporation

import { type ApplicationScope, type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { debugLog } from "../debug.js";
import { type WorkspaceAccess } from "../platformContext/workspaceAccess.js";

import { getLastVisitedApp, setLastVisitedApp } from "./lastVisitedApp.js";
import {
    type ILastVisitedWorkspaceOwner,
    clearLastVisitedWorkspace,
    getLastVisitedWorkspace,
    setLastVisitedWorkspace,
} from "./lastVisitedWorkspace.js";
import { mapBareLegacyPathToApp } from "./legacyRedirect.js";
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
    /** Query string of the current URL (location.search, `?`-prefixed or empty). */
    search?: string;
    /** Fetches the first workspace ID for the current user. */
    fetchFirstWorkspaceId: () => Promise<string | undefined>;
    /**
     * Resolves whether the given workspace can still be opened by the current user.
     * Used to validate the remembered workspace before redirecting into it.
     */
    getWorkspaceAccess: (workspaceId: string) => Promise<WorkspaceAccess>;
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
 * Resolves the workspace to land in when the URL carries none: the workspace this user
 * visited last, falling back to the first workspace they can see.
 *
 * The remembered workspace is validated before it is used — it may have been deleted or
 * the user's access to it revoked since it was stored. Only a workspace the user provably
 * cannot open is forgotten; a failed check ("unknown") keeps the memory, because losing the
 * user's workspace over a network blip is worse than letting the workspace route retry the
 * same request and report the real error.
 */
async function resolveLandingWorkspaceId(
    owner: ILastVisitedWorkspaceOwner,
    {
        fetchFirstWorkspaceId,
        getWorkspaceAccess,
    }: Pick<IResolveRedirectTargetOptions, "fetchFirstWorkspaceId" | "getWorkspaceAccess">,
): Promise<string | undefined> {
    const rememberedWorkspaceId = getLastVisitedWorkspace(owner);

    if (rememberedWorkspaceId) {
        const access = await getWorkspaceAccess(rememberedWorkspaceId);
        if (access === "forbidden") {
            debugLog(
                `[host-runtime/redirect] last visited workspace ${rememberedWorkspaceId} is not accessible — forgetting it`,
            );
            clearLastVisitedWorkspace(owner, rememberedWorkspaceId);
        } else {
            debugLog(
                `[host-runtime/redirect] using last visited workspace → ${rememberedWorkspaceId} (access=${access})`,
            );
            return rememberedWorkspaceId;
        }
    }

    debugLog("[host-runtime/redirect] fetching first workspace");
    return fetchFirstWorkspaceId();
}

/**
 * Remembers the workspace the user is in — reached by link, route change or the header
 * workspace picker — so a later landing on a workspace-less URL returns here instead of the
 * user's first workspace.
 *
 * Called only from the paths that resolved to an app the user may open, never from the
 * not-found paths: a workspace whose URL maps to no app, or that grants the user no app at
 * all, would otherwise stay remembered and send every later workspace-less landing back to
 * the same 404 — which has no header, so there is no workspace picker to escape with.
 *
 * Also gated on loaded permissions: an inaccessible workspace reaches this point with
 * `workspacePermissions` undefined (useWorkspacePermissions reports "forbidden" for 403/404).
 */
function rememberWorkspace(
    owner: ILastVisitedWorkspaceOwner,
    workspaceId: string | undefined,
    ctx: IPlatformContext,
): void {
    if (workspaceId && ctx.workspacePermissions) {
        setLastVisitedWorkspace(owner, workspaceId);
    }
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
    search,
    fetchFirstWorkspaceId,
    getWorkspaceAccess,
}: IResolveRedirectTargetOptions): Promise<string | null> {
    const scope = ctx.currentApplicationScope;
    const workspaceId = ctx.currentWorkspaceId;
    // The user id is the same identifier the host uses elsewhere (e.g. for the workspace
    // picker); the organization keeps entries apart when one origin serves several backends
    const owner: ILastVisitedWorkspaceOwner = {
        organizationId: ctx.organization?.id,
        userId: ctx.user.login,
    };

    debugLog(
        `[host-runtime/redirect] resolveRedirectTarget: scope=${scope ?? "(none)"} workspaceId=${workspaceId ?? "(none)"} pathname=${pathname} apps=${apps.length}`,
    );

    // Bare legacy app landing (/dashboards, /analyze, /metrics, /modeler — no workspace in the
    // hash; hash-bearing legacy URLs are rewritten synchronously before the host boots). The
    // legacy standalone apps redirected these to the app in the user's first workspace, so
    // preserve the app intent instead of falling through to the generic root redirect below
    // (which would land on /organization or the preferred workspace app).
    const legacyAppRouteBase = mapBareLegacyPathToApp(pathname);
    if (legacyAppRouteBase) {
        debugLog(`[host-runtime/redirect] bare legacy app path — resolving landing workspace`);
        const legacyWorkspaceId = await resolveLandingWorkspaceId(owner, {
            fetchFirstWorkspaceId,
            getWorkspaceAccess,
        });
        if (!legacyWorkspaceId) {
            debugLog("[host-runtime/redirect] no workspace available for user — throwing not-found");
            throw new AppNotFoundError("No workspace is available for this user.");
        }
        // Keep the query string — the legacy bare flow preserved it through its hash replacement
        // (e.g. /modeler?displayEditMode opened the modeler in edit mode).
        const legacyHref = `/workspace/${legacyWorkspaceId}${legacyAppRouteBase}${search ?? ""}`;
        debugLog(`[host-runtime/redirect] redirecting bare legacy app path → ${legacyHref}`);
        return legacyHref;
    }

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
            // This URL can be one the host built itself: a bare legacy landing (/analyze) is
            // redirected into the remembered workspace's app path, and if that app is not
            // permitted there it lands exactly here. Leaving the memory intact would send every
            // later bare-legacy visit back to this same 404, which has no header and therefore no
            // workspace picker to escape with. Forgetting costs one preference update — the next
            // successful app navigation records it again — so it is the cheaper side to err on
            // even for a merely mistyped path.
            if (workspaceId) {
                clearLastVisitedWorkspace(owner, workspaceId);
            }
            throw new AppNotFoundError(`No application found at path: ${pathname}`);
        }
        debugLog(`[host-runtime/redirect] workspace scope: active app matched → ${active.id}`);
        setLastVisitedApp("workspace", active.id);
        rememberWorkspace(owner, workspaceId, ctx);
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
        debugLog("[host-runtime/redirect] no workspace ID — resolving landing workspace");
        const resolvedWorkspaceId = await resolveLandingWorkspaceId(owner, {
            fetchFirstWorkspaceId,
            getWorkspaceAccess,
        });

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
        // A workspace that grants this user no app at all must not stay remembered. It can have
        // had apps when it was stored and lost them since (an app permission or feature flag
        // changed), and the access check cannot see that: the permissions endpoint still
        // succeeds. Without this, every later workspace-less landing would be sent straight back
        // to this 404, which has no header and therefore no workspace picker to escape with.
        clearLastVisitedWorkspace(owner, workspaceId);
        throw new AppNotFoundError("No workspace-scoped applications are available for this workspace.");
    }

    const href = getApplicationHref(targetApp, ctx, pathname);
    debugLog(
        `[host-runtime/redirect] redirecting to preferred workspace app → ${href} (app: ${targetApp.id})`,
    );
    rememberWorkspace(owner, workspaceId, ctx);
    return href;
}
