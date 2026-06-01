// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import {
    type ExternalPluggableApplicationRegistryItem,
    type PluggableApplicationRegistryItem,
    type RemotePluggableApplicationsRegistry,
} from "@gooddata/sdk-model";
import {
    type EmbeddingMode,
    type IOrganizationPermissions,
    type IPlatformContext,
} from "@gooddata/sdk-pluggable-application-model";

import { getApplicationScopeFromPath } from "../../loader/routing.js";
import { getRemoteRegistry, resolveApplications } from "../pluggableApplicationsRegistry.js";

function externalApp(
    overrides: Partial<ExternalPluggableApplicationRegistryItem> & { id: string },
): ExternalPluggableApplicationRegistryItem {
    return {
        apiVersion: "1.0",
        applicationScope: "workspace",
        menuOrder: 10,
        title: overrides.id,
        external: { url: `/${overrides.id}` },
        ...overrides,
    };
}

function remoteRegistry(
    overrides: Partial<RemotePluggableApplicationsRegistry> = {},
): RemotePluggableApplicationsRegistry {
    return {
        apiVersion: "1.0",
        ...overrides,
    };
}

function platformContext(
    registeredPluggableApplications: RemotePluggableApplicationsRegistry | Record<string, unknown>,
): IPlatformContext {
    const userSettings = {
        userId: "test-user",
        locale: "en-US",
        separators: { thousand: ",", decimal: "." },
        registeredPluggableApplications:
            registeredPluggableApplications as RemotePluggableApplicationsRegistry,
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
    };
}

function emptyContext(): IPlatformContext {
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
    };
}

describe("getRemoteRegistry", () => {
    it("logs unsupported apiVersion with a dedicated message", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const result = getRemoteRegistry(platformContext({ apiVersion: "2.0" }));

        expect(result).toBeUndefined();
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Remote registry apiVersion "2.0" is not supported.'),
        );
        expect(consoleSpy).not.toHaveBeenCalledWith(
            expect.stringContaining("is not a valid remote registry"),
        );
        consoleSpy.mockRestore();
    });

    it("silently treats a value without apiVersion as not configured", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const result = getRemoteRegistry(platformContext({ foo: "bar" }));

        expect(result).toBeUndefined();
        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it("silently treats an empty object as not configured", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const result = getRemoteRegistry(platformContext({}));

        expect(result).toBeUndefined();
        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});

describe("resolveApplications", () => {
    describe("merging", () => {
        it("returns local apps when no remote registry is provided", () => {
            const local = [externalApp({ id: "a", menuOrder: 1 })];
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: undefined,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("a");
        });

        it("merges local and remote apps", () => {
            const local = [externalApp({ id: "a", menuOrder: 1 })];
            const remote = remoteRegistry({
                applications: [externalApp({ id: "b", menuOrder: 2 })],
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result.map((a) => a.id)).toEqual(["a", "b"]);
        });

        it("returns empty array when both local and remote are empty", () => {
            const result = resolveApplications({
                localApps: [],
                remoteRegistry: remoteRegistry(),
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result).toEqual([]);
        });

        it("returns only remote apps when local is empty", () => {
            const remote = remoteRegistry({
                applications: [externalApp({ id: "x", menuOrder: 1 })],
            });
            const result = resolveApplications({
                localApps: [],
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result.map((a) => a.id)).toEqual(["x"]);
        });
    });

    describe("duplicate ID handling", () => {
        it("skips remote app with duplicate ID and keeps local", () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            const local = [externalApp({ id: "dup", menuOrder: 1, title: "Local" })];
            const remote = remoteRegistry({
                applications: [externalApp({ id: "dup", menuOrder: 2, title: "Remote" })],
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Local");
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Duplicate application ID "dup"'),
            );

            consoleSpy.mockRestore();
        });

        it("skips duplicate IDs within the local registry itself", () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            const local = [
                externalApp({ id: "dup", menuOrder: 1, title: "First" }),
                externalApp({ id: "dup", menuOrder: 2, title: "Second" }),
            ];
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: undefined,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("First");
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Duplicate application ID "dup"'),
            );

            consoleSpy.mockRestore();
        });
    });

    describe("sorting by menuOrder", () => {
        it("sorts merged apps by menuOrder ascending", () => {
            const local = [externalApp({ id: "c", menuOrder: 30 }), externalApp({ id: "a", menuOrder: 10 })];
            const remote = remoteRegistry({
                applications: [externalApp({ id: "b", menuOrder: 20 })],
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result.map((a) => a.id)).toEqual(["a", "b", "c"]);
        });

        it("preserves insertion order for equal menuOrder", () => {
            const local = [externalApp({ id: "a", menuOrder: 10 }), externalApp({ id: "b", menuOrder: 10 })];
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: undefined,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result.map((a) => a.id)).toEqual(["a", "b"]);
        });
    });

    describe("overrides", () => {
        it("applies overrides to matching apps", () => {
            const local = [externalApp({ id: "a", menuOrder: 10, title: "Original" })];
            const remote = remoteRegistry({
                overrides: {
                    a: { title: "Overridden" },
                },
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result[0].title).toBe("Overridden");
        });

        it("applies menuOrder override and re-sorts", () => {
            const local = [externalApp({ id: "a", menuOrder: 10 }), externalApp({ id: "b", menuOrder: 20 })];
            const remote = remoteRegistry({
                overrides: {
                    a: { menuOrder: 30 },
                },
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result.map((a) => a.id)).toEqual(["b", "a"]);
        });

        it("ignores overrides for apps not in the merged list", () => {
            const local = [externalApp({ id: "a", menuOrder: 10 })];
            const remote = remoteRegistry({
                overrides: {
                    nonexistent: { title: "Ghost" },
                },
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("a");
        });

        it("does not modify apps when overrides is undefined", () => {
            const local = [externalApp({ id: "a", menuOrder: 10, title: "Original" })];
            const remote = remoteRegistry({ overrides: undefined });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result[0].title).toBe("Original");
        });

        it("does not modify apps when overrides is empty", () => {
            const local = [externalApp({ id: "a", menuOrder: 10, title: "Original" })];
            const remote = remoteRegistry({ overrides: {} });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result[0].title).toBe("Original");
        });
    });

    describe("isEnabled filtering", () => {
        it("keeps apps where isEnabled is undefined (default)", () => {
            const local = [externalApp({ id: "a", menuOrder: 10 })];
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: undefined,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result).toHaveLength(1);
        });

        it("keeps apps where isEnabled is true", () => {
            const local = [externalApp({ id: "a", menuOrder: 10, isEnabled: true })];
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: undefined,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result).toHaveLength(1);
        });

        it("removes apps where isEnabled is false", () => {
            const local = [externalApp({ id: "a", menuOrder: 10, isEnabled: false })];
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: undefined,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result).toEqual([]);
        });

        it("disables an app via override", () => {
            const local = [externalApp({ id: "a", menuOrder: 10 }), externalApp({ id: "b", menuOrder: 20 })];
            const remote = remoteRegistry({
                overrides: {
                    a: { isEnabled: false },
                },
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result.map((a) => a.id)).toEqual(["b"]);
        });
    });

    describe("allowedStandardApplications", () => {
        it("returns all apps when allowedStandardApplications is undefined", () => {
            const local = [externalApp({ id: "a", menuOrder: 10 }), externalApp({ id: "b", menuOrder: 20 })];
            const remote = remoteRegistry({ allowedStandardApplications: undefined });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result.map((a) => a.id)).toEqual(["a", "b"]);
        });

        it("filters local apps to only allowed IDs", () => {
            const local = [
                externalApp({ id: "a", menuOrder: 10 }),
                externalApp({ id: "b", menuOrder: 20 }),
                externalApp({ id: "c", menuOrder: 30 }),
            ];
            const remote = remoteRegistry({
                allowedStandardApplications: ["a", "c"],
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result.map((a) => a.id)).toEqual(["a", "c"]);
        });

        it("returns empty when no local apps match allowed list", () => {
            const local = [externalApp({ id: "a", menuOrder: 10 })];
            const remote = remoteRegistry({
                allowedStandardApplications: ["x", "y"],
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result).toEqual([]);
        });

        it("returns only remote apps when allowedStandardApplications is empty array", () => {
            const local = [externalApp({ id: "a", menuOrder: 10 }), externalApp({ id: "b", menuOrder: 20 })];
            const remote = remoteRegistry({
                allowedStandardApplications: [],
                applications: [externalApp({ id: "remote-x", menuOrder: 5 })],
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result.map((a) => a.id)).toEqual(["remote-x"]);
        });

        it("still includes remote apps not in allowed list", () => {
            const local = [externalApp({ id: "a", menuOrder: 10 }), externalApp({ id: "b", menuOrder: 20 })];
            const remote = remoteRegistry({
                allowedStandardApplications: ["a"],
                applications: [externalApp({ id: "remote-x", menuOrder: 15 })],
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result.map((a) => a.id)).toEqual(["a", "remote-x"]);
        });
    });

    describe("requirement filtering", () => {
        // Pass organizationPermissions: null to simulate absent org permissions (no BASE_UI_ACCESS).
        // Omitting organizationPermissions defaults to { BASE_UI_ACCESS: true } so other tests are not
        // affected by the BASE_UI_ACCESS gate.
        function ctxWith(overrides: {
            userSettings?: Record<string, unknown>;
            workspacePermissions?: Record<string, unknown>;
            organizationPermissions?: Partial<IOrganizationPermissions> | null;
            entitlements?: Array<{ name: string; value?: string }>;
        }): IPlatformContext {
            const orgPermissions: IOrganizationPermissions | undefined =
                overrides.organizationPermissions === null
                    ? undefined
                    : { hasBaseUiAccess: true, ...overrides.organizationPermissions };

            const userSettings = {
                userId: "test-user",
                locale: "en-US",
                separators: { thousand: ",", decimal: "." },
                ...overrides.userSettings,
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
                workspacePermissions:
                    overrides.workspacePermissions as IPlatformContext["workspacePermissions"],
                organizationPermissions: orgPermissions,
                entitlements: overrides.entitlements as IPlatformContext["entitlements"],
                whiteLabeling: undefined,
                embeddingMode: "none" as EmbeddingMode,
            };
        }

        it("includes app with no requirements regardless of ctx", () => {
            const local = [externalApp({ id: "a", menuOrder: 1 })];
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: undefined,
                ctx: ctxWith({}),
                scope: "workspace",
            });

            expect(result).toHaveLength(1);
        });

        it("includes app when requirement filtering with empty ctx passes", () => {
            const local = [externalApp({ id: "a", menuOrder: 1 })];
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: undefined,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result).toHaveLength(1);
        });

        describe("requiredSettings", () => {
            it("includes app when settings match", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredSettings: {
                            enableFeature: true,
                        } as unknown as PluggableApplicationRegistryItem["requiredSettings"],
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ userSettings: { enableFeature: true } }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(1);
            });

            it("excludes app when required setting is missing", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredSettings: {
                            enableFeature: true,
                        } as unknown as PluggableApplicationRegistryItem["requiredSettings"],
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ userSettings: {} }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });

            it("includes app when required setting is false and setting is absent", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredSettings: {
                            enableFeature: false,
                        } as unknown as PluggableApplicationRegistryItem["requiredSettings"],
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ userSettings: {} }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(1);
            });

            it("excludes app when required setting has wrong value", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredSettings: {
                            enableFeature: true,
                        } as unknown as PluggableApplicationRegistryItem["requiredSettings"],
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ userSettings: { enableFeature: false } }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });

            it("includes app when $or condition is partially satisfied", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredSettings: {
                            $or: [{ enableA: true }, { enableB: true }],
                        } as unknown as PluggableApplicationRegistryItem["requiredSettings"],
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ userSettings: { enableB: true } }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(1);
            });

            it("excludes app when $or condition has no match", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredSettings: {
                            $or: [{ enableA: true }, { enableB: true }],
                        } as unknown as PluggableApplicationRegistryItem["requiredSettings"],
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ userSettings: {} }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });

            it("includes app when $and condition is fully satisfied", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredSettings: {
                            $and: [{ enableA: true }, { enableB: true }],
                        } as unknown as PluggableApplicationRegistryItem["requiredSettings"],
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ userSettings: { enableA: true, enableB: true } }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(1);
            });

            it("excludes app when $and condition is only partially satisfied", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredSettings: {
                            $and: [{ enableA: true }, { enableB: true }],
                        } as unknown as PluggableApplicationRegistryItem["requiredSettings"],
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ userSettings: { enableA: true } }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });
        });

        describe("requiredWorkspacePermissions", () => {
            it("includes app when workspace permission matches", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredWorkspacePermissions: { canAnalyze: true },
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ workspacePermissions: { canCreateVisualization: true } }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(1);
            });

            it("excludes app when workspace permissions are absent", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredWorkspacePermissions: { canAnalyze: true },
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ workspacePermissions: undefined }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });

            it("excludes app when required permission is false", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredWorkspacePermissions: { canAnalyze: true },
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ workspacePermissions: { canCreateVisualization: false } }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });

            it("includes app when $or workspace permission condition is partially satisfied", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredWorkspacePermissions: {
                            $or: [{ canManageWorkspace: true }, { canAnalyze: true }],
                        },
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ workspacePermissions: { canCreateVisualization: true } }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(1);
            });
        });

        describe("requiredOrganizationPermissions", () => {
            it("includes app when org permission matches", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredOrganizationPermissions: { canManageOrganization: true },
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ organizationPermissions: { canManageOrganization: true } }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(1);
            });

            it("excludes app when required org permission is missing", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredOrganizationPermissions: { canManageOrganization: true },
                    }),
                ];
                // hasBaseUiAccess is present (default), but canManageOrganization is not.
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ organizationPermissions: {} }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });
        });

        describe("requiredEntitlements", () => {
            it("includes app when entitlement is present", () => {
                const local = [
                    externalApp({ id: "a", menuOrder: 1, requiredEntitlements: { PdfExports: true } }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ entitlements: [{ name: "PdfExports" }] }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(1);
            });

            it("includes app when entitlement value matches", () => {
                const local = [
                    externalApp({ id: "a", menuOrder: 1, requiredEntitlements: { Tier: "enterprise" } }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ entitlements: [{ name: "Tier", value: "enterprise" }] }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(1);
            });

            it("excludes app when entitlement is absent", () => {
                const local = [
                    externalApp({ id: "a", menuOrder: 1, requiredEntitlements: { PdfExports: true } }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ entitlements: [] }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });

            it("excludes app when entitlement value does not match", () => {
                const local = [
                    externalApp({ id: "a", menuOrder: 1, requiredEntitlements: { Tier: "enterprise" } }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({ entitlements: [{ name: "Tier", value: "free" }] }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });
        });

        describe("BASE_UI_ACCESS", () => {
            it("hides all local apps when BASE_UI_ACCESS is missing", () => {
                const local = [
                    externalApp({ id: "a", menuOrder: 1 }),
                    externalApp({ id: "b", menuOrder: 2 }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({
                        userSettings: { restrictBaseUi: true },
                        organizationPermissions: null,
                    }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });

            it("hides all local apps when BASE_UI_ACCESS is false", () => {
                const local = [externalApp({ id: "a", menuOrder: 1 })];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({
                        userSettings: { restrictBaseUi: true },
                        organizationPermissions: { hasBaseUiAccess: false },
                    }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });

            it("shows local apps when BASE_UI_ACCESS is true", () => {
                const local = [
                    externalApp({ id: "a", menuOrder: 1 }),
                    externalApp({ id: "b", menuOrder: 2 }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({
                        userSettings: { restrictBaseUi: true },
                        organizationPermissions: { hasBaseUiAccess: true },
                    }),
                    scope: "workspace",
                });

                expect(result.map((a) => a.id)).toEqual(["a", "b"]);
            });

            it("does not filter remote apps when BASE_UI_ACCESS is missing", () => {
                const remote = remoteRegistry({
                    applications: [externalApp({ id: "remote-x", menuOrder: 5 })],
                });
                const result = resolveApplications({
                    localApps: [],
                    remoteRegistry: remote,
                    ctx: ctxWith({ organizationPermissions: null }),
                    scope: "workspace",
                });

                expect(result.map((a) => a.id)).toEqual(["remote-x"]);
            });

            it("skips BASE_UI_ACCESS check when restrictBaseUi is not set", () => {
                const local = [externalApp({ id: "a", menuOrder: 1 })];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: emptyContext(),
                    scope: "workspace",
                });

                expect(result).toHaveLength(1);
            });
        });

        describe("multiple requirements", () => {
            it("includes app when all requirements are satisfied", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredSettings: {
                            enableFeature: true,
                        } as unknown as PluggableApplicationRegistryItem["requiredSettings"],
                        requiredWorkspacePermissions: { canAnalyze: true },
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({
                        userSettings: { enableFeature: true },
                        workspacePermissions: { canCreateVisualization: true },
                    }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(1);
            });

            it("excludes app when only some requirements are satisfied", () => {
                const local = [
                    externalApp({
                        id: "a",
                        menuOrder: 1,
                        requiredSettings: {
                            enableFeature: true,
                        } as unknown as PluggableApplicationRegistryItem["requiredSettings"],
                        requiredWorkspacePermissions: { canAnalyze: true },
                    }),
                ];
                const result = resolveApplications({
                    localApps: local,
                    remoteRegistry: undefined,
                    ctx: ctxWith({
                        userSettings: { enableFeature: true },
                        workspacePermissions: { canCreateVisualization: false },
                    }),
                    scope: "workspace",
                });

                expect(result).toHaveLength(0);
            });
        });
    });

    describe("scope filtering", () => {
        it("returns only organization-scoped apps when scope is 'organization'", () => {
            const local = [
                externalApp({ id: "org-app", menuOrder: 1, applicationScope: "organization" }),
                externalApp({ id: "ws-app", menuOrder: 2, applicationScope: "workspace" }),
            ];
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: undefined,
                ctx: emptyContext(),
                scope: "organization",
            });

            expect(result.map((a) => a.id)).toEqual(["org-app"]);
        });

        it("returns only workspace-scoped apps when scope is 'workspace'", () => {
            const local = [
                externalApp({ id: "org-app", menuOrder: 1, applicationScope: "organization" }),
                externalApp({ id: "ws-app", menuOrder: 2, applicationScope: "workspace" }),
            ];
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: undefined,
                ctx: emptyContext(),
                scope: "workspace",
            });

            expect(result.map((a) => a.id)).toEqual(["ws-app"]);
        });

        it("returns no apps when scope is undefined", () => {
            const local = [
                externalApp({ id: "org-app", menuOrder: 1, applicationScope: "organization" }),
                externalApp({ id: "ws-app", menuOrder: 2, applicationScope: "workspace" }),
            ];
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: undefined,
                ctx: emptyContext(),
                scope: undefined,
            });

            expect(result).toEqual([]);
        });

        it("filters mixed local and remote apps by scope", () => {
            const local = [
                externalApp({ id: "local-org", menuOrder: 1, applicationScope: "organization" }),
                externalApp({ id: "local-ws", menuOrder: 2, applicationScope: "workspace" }),
            ];
            const remote = remoteRegistry({
                applications: [
                    externalApp({ id: "remote-org", menuOrder: 3, applicationScope: "organization" }),
                    externalApp({ id: "remote-ws", menuOrder: 4, applicationScope: "workspace" }),
                ],
            });
            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "organization",
            });

            expect(result.map((a) => a.id)).toEqual(["local-org", "remote-org"]);
        });
    });

    describe("end-to-end scenarios", () => {
        it("applies overrides, disables, filters, and sorts in one pass", () => {
            const local: PluggableApplicationRegistryItem[] = [
                externalApp({ id: "dashboards", menuOrder: 10 }),
                externalApp({ id: "analyze", menuOrder: 20 }),
                externalApp({ id: "metrics", menuOrder: 30 }),
                externalApp({ id: "data", menuOrder: 40 }),
            ];
            const remote = remoteRegistry({
                allowedStandardApplications: ["dashboards", "analyze", "data"],
                overrides: {
                    analyze: { menuOrder: 50 },
                    data: { isEnabled: false },
                },
                applications: [externalApp({ id: "custom", menuOrder: 25 })],
            });

            const result = resolveApplications({
                localApps: local,
                remoteRegistry: remote,
                ctx: emptyContext(),
                scope: "workspace",
            });

            // "metrics" filtered by allowedStandardApplications
            // "data" disabled via override
            // "analyze" reordered to 50
            // "custom" is a remote app (not filtered by allowed list)
            expect(result.map((a) => a.id)).toEqual(["dashboards", "custom", "analyze"]);
        });
    });
});

describe("getApplicationScopeFromPath", () => {
    it("returns 'organization' for /organization", () => {
        expect(getApplicationScopeFromPath("/organization")).toBe("organization");
    });

    it("returns 'organization' for /organization/admin/users", () => {
        expect(getApplicationScopeFromPath("/organization/admin/users")).toBe("organization");
    });

    it("returns 'workspace' for /workspace", () => {
        expect(getApplicationScopeFromPath("/workspace")).toBe("workspace");
    });

    it("returns 'workspace' for /workspace/ws-123/dashboards", () => {
        expect(getApplicationScopeFromPath("/workspace/ws-123/dashboards")).toBe("workspace");
    });

    it("returns undefined for root path", () => {
        expect(getApplicationScopeFromPath("/")).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
        expect(getApplicationScopeFromPath("")).toBeUndefined();
    });

    it("returns undefined for unknown path", () => {
        expect(getApplicationScopeFromPath("/unknown/path")).toBeUndefined();
    });
});
