// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type ILocalPluggableApplicationRegistryItemV1,
    type IWorkspacePermissions,
    type PluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import { type EmbeddingMode, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { type WorkspaceAccess } from "../platformContext/workspaceAccess.js";

import * as lastVisitedAppModule from "./lastVisitedApp.js";
import * as lastVisitedWorkspaceModule from "./lastVisitedWorkspace.js";
import { AppNotFoundError, resolveRedirectTarget } from "./redirectLogic.js";

function context(overrides: Partial<IPlatformContext> = {}): IPlatformContext {
    const userSettings = {
        userId: "test-user",
        locale: "en-US",
        separators: { thousand: ",", decimal: "." },
    };
    return {
        version: "1.0",
        auth: { type: "contextDeferred" as const },
        user: {
            login: "test@example.com",
            ref: { identifier: "test-user", type: "user" },
        },
        userSettings,
        settings: userSettings,
        whiteLabeling: undefined,
        embeddingMode: "none" as EmbeddingMode,
        ...overrides,
    };
}

function localApp(
    overrides: Partial<ILocalPluggableApplicationRegistryItemV1>,
): ILocalPluggableApplicationRegistryItemV1 {
    return {
        apiVersion: "1.0",
        id: "gdc-ai-hub",
        title: "AI Hub",
        applicationScope: "organization",
        menuOrder: 60,
        local: {
            routeBase: "/ai-hub",
        },
        ...overrides,
    };
}

const orgApp = localApp({});
const wsApp = localApp({
    id: "gdc-dashboards",
    applicationScope: "workspace",
    local: { routeBase: "/dashboards" },
});
const noFetchWorkspaceId = vi.fn<() => Promise<string | undefined>>().mockResolvedValue(undefined);
const getWorkspaceAccess = vi
    .fn<(workspaceId: string) => Promise<WorkspaceAccess>>()
    .mockResolvedValue("accessible");
// Only the presence of loaded permissions matters here, not the individual flags
const workspacePermissions = {} as IWorkspacePermissions;
// The owner the fixture context resolves to: no organization in the context, user login as id
const OWNER = { organizationId: undefined, userId: "test@example.com" };

const wsAppAnalyze = localApp({
    id: "gdc-analyze",
    applicationScope: "workspace",
    local: { routeBase: "/analyze" },
});
const orgAppAdmin = localApp({
    id: "gdc-admin",
    title: "Admin",
    applicationScope: "organization",
    local: { routeBase: "/admin" },
});

describe("resolveRedirectTarget", () => {
    const getLastVisitedAppSpy = vi.spyOn(lastVisitedAppModule, "getLastVisitedApp");
    const setLastVisitedAppSpy = vi.spyOn(lastVisitedAppModule, "setLastVisitedApp");
    const getLastVisitedWorkspaceSpy = vi.spyOn(lastVisitedWorkspaceModule, "getLastVisitedWorkspace");
    const setLastVisitedWorkspaceSpy = vi.spyOn(lastVisitedWorkspaceModule, "setLastVisitedWorkspace");
    const clearLastVisitedWorkspaceSpy = vi.spyOn(lastVisitedWorkspaceModule, "clearLastVisitedWorkspace");

    beforeEach(() => {
        vi.clearAllMocks();
        noFetchWorkspaceId.mockResolvedValue(undefined);
        getWorkspaceAccess.mockResolvedValue("accessible");
        getLastVisitedAppSpy.mockReturnValue(undefined);
        setLastVisitedAppSpy.mockImplementation(() => {});
        getLastVisitedWorkspaceSpy.mockReturnValue(undefined);
        setLastVisitedWorkspaceSpy.mockImplementation(() => {});
        clearLastVisitedWorkspaceSpy.mockImplementation(() => {});
    });
    describe("organization scope", () => {
        it("returns null when user navigates to a valid org app sub-path", async () => {
            const result = await resolveRedirectTarget({
                apps: [orgApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "organization",
                    organizationPermissions: { canManageOrganization: true },
                }),
                pathname: "/organization/ai-hub",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBeNull();
        });

        it("redirects to the first org app when at the organization root", async () => {
            const result = await resolveRedirectTarget({
                apps: [orgApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "organization",
                    organizationPermissions: { canManageOrganization: true },
                }),
                pathname: "/organization",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/organization/ai-hub");
        });

        it("throws AppNotFoundError when at org root but no apps are available", async () => {
            await expect(
                resolveRedirectTarget({
                    apps: [],
                    ctx: context({
                        currentApplicationScope: "organization",
                        organizationPermissions: { canManageOrganization: true },
                    }),
                    pathname: "/organization",
                    fetchFirstWorkspaceId: noFetchWorkspaceId,
                    getWorkspaceAccess,
                }),
            ).rejects.toThrow(AppNotFoundError);
        });

        it("returns null when user without manage permission navigates to a valid org app", async () => {
            const result = await resolveRedirectTarget({
                apps: [orgApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "organization",
                    organizationPermissions: { canManageOrganization: false },
                }),
                pathname: "/organization/ai-hub",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBeNull();
        });

        it("redirects to the last-visited org app when it is in the eligible list", async () => {
            getLastVisitedAppSpy.mockReturnValue("gdc-admin");

            const result = await resolveRedirectTarget({
                apps: [orgApp, orgAppAdmin] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "organization",
                    organizationPermissions: { canManageOrganization: true },
                }),
                pathname: "/organization",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/organization/admin");
        });

        it("falls back to apps[0] when last-visited org app is not in the eligible list", async () => {
            getLastVisitedAppSpy.mockReturnValue("gdc-removed-app");

            const result = await resolveRedirectTarget({
                apps: [orgApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "organization",
                    organizationPermissions: { canManageOrganization: true },
                }),
                pathname: "/organization",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/organization/ai-hub");
        });

        it("calls setLastVisitedApp when navigating to a valid org app sub-path", async () => {
            await resolveRedirectTarget({
                apps: [orgApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "organization",
                    organizationPermissions: { canManageOrganization: true },
                }),
                pathname: "/organization/ai-hub",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(setLastVisitedAppSpy).toHaveBeenCalledWith("organization", "gdc-ai-hub");
        });

        it("throws AppNotFoundError when navigating to an unrecognised org path", async () => {
            await expect(
                resolveRedirectTarget({
                    apps: [orgApp] as PluggableApplicationRegistryItem[],
                    ctx: context({
                        currentApplicationScope: "organization",
                        organizationPermissions: { canManageOrganization: true },
                    }),
                    pathname: "/organization/nonexistent",
                    fetchFirstWorkspaceId: noFetchWorkspaceId,
                    getWorkspaceAccess,
                }),
            ).rejects.toThrow(AppNotFoundError);
        });
    });

    describe("workspace scope", () => {
        it("returns null when user navigates to a permitted workspace app sub-path", async () => {
            const result = await resolveRedirectTarget({
                apps: [wsApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: "ws-123",
                }),
                pathname: "/workspace/ws-123/dashboards",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBeNull();
        });

        it("throws AppNotFoundError when the workspace app is not in the permitted apps list", async () => {
            await expect(
                resolveRedirectTarget({
                    apps: [],
                    ctx: context({
                        currentApplicationScope: "workspace",
                        currentWorkspaceId: "ws-123",
                    }),
                    pathname: "/workspace/ws-123/dashboards",
                    fetchFirstWorkspaceId: noFetchWorkspaceId,
                    getWorkspaceAccess,
                }),
            ).rejects.toThrow(AppNotFoundError);
        });

        it("throws AppNotFoundError when navigating to an unrecognised workspace path", async () => {
            await expect(
                resolveRedirectTarget({
                    apps: [wsApp] as PluggableApplicationRegistryItem[],
                    ctx: context({
                        currentApplicationScope: "workspace",
                        currentWorkspaceId: "ws-123",
                    }),
                    pathname: "/workspace/ws-123/nonexistent",
                    fetchFirstWorkspaceId: noFetchWorkspaceId,
                    getWorkspaceAccess,
                }),
            ).rejects.toThrow(AppNotFoundError);
        });

        it("redirects to the first permitted workspace app when at the workspace root with an ID", async () => {
            const result = await resolveRedirectTarget({
                apps: [wsApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: "ws-123",
                }),
                pathname: "/workspace/ws-123",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/workspace/ws-123/dashboards");
        });

        it("redirects to the workspace root when the URL has no workspace ID (/workspace/)", async () => {
            const fetchFirstWorkspaceId = vi.fn().mockResolvedValue("ws-fetched");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: undefined,
                }),
                pathname: "/workspace/",
                fetchFirstWorkspaceId,
                getWorkspaceAccess,
            });

            expect(fetchFirstWorkspaceId).toHaveBeenCalledOnce();
            // First hop: redirects to workspace root, not directly to an app
            expect(result).toBe("/workspace/ws-fetched");
        });

        it("redirects to the last-visited workspace app when it is in the eligible list", async () => {
            getLastVisitedAppSpy.mockReturnValue("gdc-analyze");

            const result = await resolveRedirectTarget({
                apps: [wsApp, wsAppAnalyze] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: "ws-123",
                }),
                pathname: "/workspace/ws-123",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/workspace/ws-123/analyze");
        });

        it("falls back to apps[0] when last-visited workspace app is not in the eligible list", async () => {
            getLastVisitedAppSpy.mockReturnValue("gdc-removed-app");

            const result = await resolveRedirectTarget({
                apps: [wsApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: "ws-123",
                }),
                pathname: "/workspace/ws-123",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/workspace/ws-123/dashboards");
        });

        it("calls setLastVisitedApp when navigating to a valid workspace app sub-path", async () => {
            await resolveRedirectTarget({
                apps: [wsApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: "ws-123",
                }),
                pathname: "/workspace/ws-123/dashboards",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(setLastVisitedAppSpy).toHaveBeenCalledWith("workspace", "gdc-dashboards");
        });

        it("throws AppNotFoundError when at workspace root with ID but no permitted apps", async () => {
            await expect(
                resolveRedirectTarget({
                    apps: [],
                    ctx: context({
                        currentApplicationScope: "workspace",
                        currentWorkspaceId: "ws-123",
                    }),
                    pathname: "/workspace/ws-123",
                    fetchFirstWorkspaceId: noFetchWorkspaceId,
                    getWorkspaceAccess,
                }),
            ).rejects.toThrow(AppNotFoundError);
        });
    });

    describe("bare legacy app paths", () => {
        it.each([
            ["/dashboards", "/workspace/ws-fetched/dashboards"],
            ["/analyze", "/workspace/ws-fetched/analyze"],
            ["/metrics", "/workspace/ws-fetched/metrics"],
            ["/modeler", "/workspace/ws-fetched/modeler"],
            ["/modeler/", "/workspace/ws-fetched/modeler"],
        ])("redirects %s to the app in the first workspace", async (pathname, expected) => {
            const fetchFirstWorkspaceId = vi.fn().mockResolvedValue("ws-fetched");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: undefined,
                    currentWorkspaceId: undefined,
                }),
                pathname,
                fetchFirstWorkspaceId,
                getWorkspaceAccess,
            });

            expect(fetchFirstWorkspaceId).toHaveBeenCalledOnce();
            expect(result).toBe(expected);
        });

        it("preserves the query string (e.g. ?displayEditMode) through the redirect", async () => {
            const fetchFirstWorkspaceId = vi.fn().mockResolvedValue("ws-fetched");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: undefined,
                    currentWorkspaceId: undefined,
                }),
                pathname: "/modeler/",
                search: "?displayEditMode",
                fetchFirstWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/workspace/ws-fetched/modeler?displayEditMode");
        });

        it("preserves the app intent even for users with canManageOrganization", async () => {
            const fetchFirstWorkspaceId = vi.fn().mockResolvedValue("ws-fetched");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: undefined,
                    currentWorkspaceId: undefined,
                    organizationPermissions: { canManageOrganization: true },
                }),
                pathname: "/modeler/",
                fetchFirstWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/workspace/ws-fetched/modeler");
        });

        it("throws AppNotFoundError when the user has no workspace", async () => {
            await expect(
                resolveRedirectTarget({
                    apps: [],
                    ctx: context({
                        currentApplicationScope: undefined,
                        currentWorkspaceId: undefined,
                    }),
                    pathname: "/modeler/",
                    fetchFirstWorkspaceId: vi.fn().mockResolvedValue(undefined),
                    getWorkspaceAccess,
                }),
            ).rejects.toThrow(AppNotFoundError);
        });

        it("does not treat deep unknown paths under a legacy prefix as a bare legacy landing", async () => {
            const fetchFirstWorkspaceId = vi.fn().mockResolvedValue("ws-fetched");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: undefined,
                    currentWorkspaceId: undefined,
                    organizationPermissions: { canManageOrganization: false },
                }),
                pathname: "/modeler/deep/route",
                fetchFirstWorkspaceId,
                getWorkspaceAccess,
            });

            // Falls through to the generic root redirect (first hop → workspace root)
            expect(result).toBe("/workspace/ws-fetched");
        });
    });

    describe("undefined scope (top-level app root)", () => {
        it("redirects to /organization when user has canManageOrganization permission", async () => {
            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: undefined,
                    currentWorkspaceId: undefined,
                    organizationPermissions: { canManageOrganization: true },
                }),
                pathname: "/",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/organization");
            expect(noFetchWorkspaceId).not.toHaveBeenCalled();
        });

        it("fetches the first workspace and redirects to its root at path /", async () => {
            const fetchFirstWorkspaceId = vi.fn().mockResolvedValue("ws-fetched");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: undefined,
                    currentWorkspaceId: undefined,
                    organizationPermissions: { canManageOrganization: false },
                }),
                pathname: "/",
                fetchFirstWorkspaceId,
                getWorkspaceAccess,
            });

            expect(fetchFirstWorkspaceId).toHaveBeenCalledOnce();
            // First hop: redirects to workspace root, not directly to an app
            expect(result).toBe("/workspace/ws-fetched");
        });

        it("throws AppNotFoundError when fetchFirstWorkspaceId returns undefined", async () => {
            await expect(
                resolveRedirectTarget({
                    apps: [],
                    ctx: context({
                        currentApplicationScope: undefined,
                        currentWorkspaceId: undefined,
                    }),
                    pathname: "/",
                    fetchFirstWorkspaceId: vi.fn().mockResolvedValue(undefined),
                    getWorkspaceAccess,
                }),
            ).rejects.toThrow(AppNotFoundError);
        });
    });

    describe("last visited workspace", () => {
        it("remembers the workspace of the current URL", async () => {
            await resolveRedirectTarget({
                apps: [wsApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: "ws-123",
                    workspacePermissions,
                }),
                pathname: "/workspace/ws-123/dashboards",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(setLastVisitedWorkspaceSpy).toHaveBeenCalledWith(OWNER, "ws-123");
        });

        it("remembers the workspace when the workspace root resolves to an app", async () => {
            await resolveRedirectTarget({
                apps: [wsApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: "ws-123",
                    workspacePermissions,
                }),
                pathname: "/workspace/ws-123",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(setLastVisitedWorkspaceSpy).toHaveBeenCalledWith(OWNER, "ws-123");
        });

        it("does not remember a workspace whose path maps to no app", async () => {
            await expect(
                resolveRedirectTarget({
                    apps: [wsApp] as PluggableApplicationRegistryItem[],
                    ctx: context({
                        currentApplicationScope: "workspace",
                        currentWorkspaceId: "ws-123",
                        workspacePermissions,
                    }),
                    pathname: "/workspace/ws-123/nonexistent",
                    fetchFirstWorkspaceId: noFetchWorkspaceId,
                    getWorkspaceAccess,
                }),
            ).rejects.toThrow(AppNotFoundError);

            // Remembering it would send every later workspace-less landing back to this 404
            expect(setLastVisitedWorkspaceSpy).not.toHaveBeenCalled();
        });

        it("does not remember a workspace that grants the user no app", async () => {
            await expect(
                resolveRedirectTarget({
                    apps: [],
                    ctx: context({
                        currentApplicationScope: "workspace",
                        currentWorkspaceId: "ws-empty",
                        workspacePermissions,
                    }),
                    pathname: "/workspace/ws-empty",
                    fetchFirstWorkspaceId: noFetchWorkspaceId,
                    getWorkspaceAccess,
                }),
            ).rejects.toThrow(AppNotFoundError);

            expect(setLastVisitedWorkspaceSpy).not.toHaveBeenCalled();
        });

        it("forgets the remembered workspace when its app path does not resolve", async () => {
            // How a bare legacy landing fails: /analyze is redirected into the remembered
            // workspace's /analyze path, and that app is not permitted there
            getLastVisitedWorkspaceSpy.mockReturnValue("ws-remembered");

            await expect(
                resolveRedirectTarget({
                    apps: [wsApp] as PluggableApplicationRegistryItem[],
                    ctx: context({
                        currentApplicationScope: "workspace",
                        currentWorkspaceId: "ws-remembered",
                        workspacePermissions,
                    }),
                    pathname: "/workspace/ws-remembered/analyze",
                    fetchFirstWorkspaceId: noFetchWorkspaceId,
                    getWorkspaceAccess,
                }),
            ).rejects.toThrow(AppNotFoundError);

            // Otherwise every later /analyze landing comes straight back to this 404
            expect(clearLastVisitedWorkspaceSpy).toHaveBeenCalledWith(OWNER, "ws-remembered");
        });

        it("forgets a remembered workspace that no longer grants the user any app", async () => {
            // Stored while it still had apps; an app permission or feature flag changed since, and
            // the access check cannot see that because the permissions endpoint still succeeds
            getLastVisitedWorkspaceSpy.mockReturnValue("ws-empty");

            await expect(
                resolveRedirectTarget({
                    apps: [],
                    ctx: context({
                        currentApplicationScope: "workspace",
                        currentWorkspaceId: "ws-empty",
                        workspacePermissions,
                    }),
                    pathname: "/workspace/ws-empty",
                    fetchFirstWorkspaceId: noFetchWorkspaceId,
                    getWorkspaceAccess,
                }),
            ).rejects.toThrow(AppNotFoundError);

            // Otherwise every later workspace-less landing is sent back to this 404
            expect(clearLastVisitedWorkspaceSpy).toHaveBeenCalledWith(OWNER, "ws-empty");
        });

        it("keys the remembered workspace by the context organization", async () => {
            await resolveRedirectTarget({
                apps: [wsApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: "ws-123",
                    workspacePermissions,
                    organization: { id: "org-1", title: "Org One" },
                }),
                pathname: "/workspace/ws-123/dashboards",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            // One origin can serve several backends, so the same login must not share an entry
            expect(setLastVisitedWorkspaceSpy).toHaveBeenCalledWith(
                { organizationId: "org-1", userId: "test@example.com" },
                "ws-123",
            );
        });

        it("does not remember a workspace whose permissions could not be loaded", async () => {
            await resolveRedirectTarget({
                apps: [wsApp] as PluggableApplicationRegistryItem[],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: "ws-forbidden",
                    workspacePermissions: undefined,
                }),
                pathname: "/workspace/ws-forbidden/dashboards",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(setLastVisitedWorkspaceSpy).not.toHaveBeenCalled();
        });

        it("redirects to the last visited workspace when the URL has no workspace ID", async () => {
            getLastVisitedWorkspaceSpy.mockReturnValue("ws-remembered");
            const fetchFirstWorkspaceId = vi.fn().mockResolvedValue("ws-first");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: undefined,
                }),
                pathname: "/workspace/",
                fetchFirstWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/workspace/ws-remembered");
            // Looked up for the signed-in user, not globally — the key is shared by every
            // account signing in from the same browser profile
            expect(getLastVisitedWorkspaceSpy).toHaveBeenCalledWith(OWNER);
            expect(getWorkspaceAccess).toHaveBeenCalledWith("ws-remembered");
            expect(fetchFirstWorkspaceId).not.toHaveBeenCalled();
        });

        it("redirects to the last visited workspace at the app root", async () => {
            getLastVisitedWorkspaceSpy.mockReturnValue("ws-remembered");
            const fetchFirstWorkspaceId = vi.fn().mockResolvedValue("ws-first");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: undefined,
                    currentWorkspaceId: undefined,
                    organizationPermissions: { canManageOrganization: false },
                }),
                pathname: "/",
                fetchFirstWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/workspace/ws-remembered");
            expect(fetchFirstWorkspaceId).not.toHaveBeenCalled();
        });

        it("redirects a bare legacy app path into the last visited workspace", async () => {
            getLastVisitedWorkspaceSpy.mockReturnValue("ws-remembered");
            const fetchFirstWorkspaceId = vi.fn().mockResolvedValue("ws-first");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: undefined,
                    currentWorkspaceId: undefined,
                }),
                pathname: "/analyze",
                fetchFirstWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/workspace/ws-remembered/analyze");
            expect(fetchFirstWorkspaceId).not.toHaveBeenCalled();
        });

        it("falls back to the first workspace and forgets the last visited one when it is forbidden", async () => {
            getLastVisitedWorkspaceSpy.mockReturnValue("ws-deleted");
            getWorkspaceAccess.mockResolvedValue("forbidden");
            const fetchFirstWorkspaceId = vi.fn().mockResolvedValue("ws-first");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: undefined,
                }),
                pathname: "/workspace/",
                fetchFirstWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/workspace/ws-first");
            expect(clearLastVisitedWorkspaceSpy).toHaveBeenCalledWith(OWNER, "ws-deleted");
            expect(fetchFirstWorkspaceId).toHaveBeenCalledOnce();
        });

        it("keeps the last visited workspace when the access check itself fails", async () => {
            getLastVisitedWorkspaceSpy.mockReturnValue("ws-remembered");
            getWorkspaceAccess.mockResolvedValue("unknown");
            const fetchFirstWorkspaceId = vi.fn().mockResolvedValue("ws-first");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: "workspace",
                    currentWorkspaceId: undefined,
                }),
                pathname: "/workspace/",
                fetchFirstWorkspaceId,
                getWorkspaceAccess,
            });

            // A network blip or 5xx says nothing about the workspace — the memory survives and the
            // workspace route re-runs the request rather than silently switching workspaces.
            expect(result).toBe("/workspace/ws-remembered");
            expect(clearLastVisitedWorkspaceSpy).not.toHaveBeenCalled();
            expect(fetchFirstWorkspaceId).not.toHaveBeenCalled();
        });

        it("keeps preferring the organization for users who can manage it", async () => {
            getLastVisitedWorkspaceSpy.mockReturnValue("ws-remembered");

            const result = await resolveRedirectTarget({
                apps: [],
                ctx: context({
                    currentApplicationScope: undefined,
                    currentWorkspaceId: undefined,
                    organizationPermissions: { canManageOrganization: true },
                }),
                pathname: "/",
                fetchFirstWorkspaceId: noFetchWorkspaceId,
                getWorkspaceAccess,
            });

            expect(result).toBe("/organization");
        });
    });
});
