// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type ILocalPluggableApplicationRegistryItemV1,
    type PluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import { type EmbeddingMode, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import * as lastVisitedAppModule from "../lastVisitedApp.js";
import { AppNotFoundError, resolveRedirectTarget } from "../redirectLogic.js";

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

    beforeEach(() => {
        vi.clearAllMocks();
        noFetchWorkspaceId.mockResolvedValue(undefined);
        getLastVisitedAppSpy.mockReturnValue(undefined);
        setLastVisitedAppSpy.mockImplementation(() => {});
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
                }),
            ).rejects.toThrow(AppNotFoundError);
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
                }),
            ).rejects.toThrow(AppNotFoundError);
        });
    });
});
