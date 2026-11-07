// (C) 2026 GoodData Corporation

// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { type HeadlessModuleRegistryItem, type IUserSettings } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { resolveHeadlessModules } from "./headlessModulesRegistry.js";

function remoteModule(
    id: string,
    overrides: Partial<HeadlessModuleRegistryItem> = {},
): HeadlessModuleRegistryItem {
    return {
        apiVersion: "1.0",
        id,
        remote: { url: `https://localhost/${id}/remoteEntry.js`, scope: id, module: "./headlessModule" },
        ...overrides,
    } as HeadlessModuleRegistryItem;
}

function localModule(id: string): HeadlessModuleRegistryItem {
    return { apiVersion: "1.0", id, local: true };
}

function platformContext(overrides: Partial<IPlatformContext> = {}): IPlatformContext {
    const userSettings: IUserSettings = {
        userId: "test-user",
        locale: "en-US",
        separators: { thousand: ",", decimal: "." },
        restrictBaseUi: true,
    };
    return {
        version: "1.0",
        auth: { type: "contextDeferred" },
        user: { login: "test@example.com", ref: { identifier: "test-user", type: "user" } },
        userSettings,
        settings: { ...userSettings, restrictBaseUi: false },
        whiteLabeling: undefined,
        embeddingMode: "none",
        ...overrides,
    };
}

describe("resolveHeadlessModules", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("lists local modules first and lets a local module win over a remote module with the same id", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const resolved = resolveHeadlessModules(
            [localModule("shared"), localModule("local-only")],
            [remoteModule("remote-only"), remoteModule("shared")],
            platformContext(),
        );
        expect(resolved.map((item) => [item.id, "local" in item])).toEqual([
            ["shared", true],
            ["local-only", true],
            ["remote-only", false],
        ]);
    });

    it("ignores a remote registry value that is not an array, and invalid items", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        expect(resolveHeadlessModules([], { id: "not-an-array" }, platformContext())).toEqual([]);
        const resolved = resolveHeadlessModules(
            [],
            [
                remoteModule("valid"),
                { apiVersion: "2.0", id: "future", remote: { url: "u", scope: "s", module: "m" } },
                { apiVersion: "1.0", id: "no-location" },
                { apiVersion: "1.0", id: "bad-remote", remote: { url: "", scope: "s", module: "m" } },
                { apiVersion: "1.0", id: "null-remote", remote: null },
                { ...remoteModule("string-enabled"), isEnabled: "false" },
                null,
            ],
            platformContext(),
        );
        expect(resolved.map((item) => item.id)).toEqual(["valid"]);
        expect(error).toHaveBeenCalledTimes(7);
    });

    it("drops a remote module that uses the federation scope of an earlier module", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        const first = remoteModule("first");
        const second = remoteModule("second", {
            remote: {
                url: "https://demo-dashboard-plugins.gooddata.com/other/remoteEntry.js",
                scope: "first",
                module: "./headlessModule",
            },
        });
        const resolved = resolveHeadlessModules([], [first, second], platformContext());
        expect(resolved.map((item) => item.id)).toEqual(["first"]);
        expect(error).toHaveBeenCalledTimes(1);
    });

    it("drops a remote module that uses the federation scope of a pluggable application", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        const resolved = resolveHeadlessModules(
            [],
            [remoteModule("gdc_home_ui"), remoteModule("telemetry")],
            platformContext(),
            new Map([["gdc_home_ui", "/organization/remotes/gdc-home-ui/remoteEntry.js"]]),
        );
        expect(resolved.map((item) => item.id)).toEqual(["telemetry"]);
        expect(error).toHaveBeenCalledTimes(1);
    });

    it("lets modules share a federation scope when they use the same URL", () => {
        const sharedRemote = (module: string) => ({
            url: "https://localhost/shared/remoteEntry.js",
            scope: "shared",
            module,
        });
        const resolved = resolveHeadlessModules(
            [],
            [
                remoteModule("first", { remote: sharedRemote("./first") }),
                remoteModule("second", { remote: sharedRemote("./second") }),
                remoteModule("app-container", {
                    remote: {
                        url: "/organization/remotes/gdc-home-ui/remoteEntry.js",
                        scope: "gdc_home_ui",
                        module: "./headless",
                    },
                }),
            ],
            platformContext(),
            new Map([["gdc_home_ui", "/organization/remotes/gdc-home-ui/remoteEntry.js"]]),
        );
        expect(resolved.map((item) => item.id)).toEqual(["first", "second", "app-container"]);
    });

    it("lets an enabled module use the federation scope of a disabled module", () => {
        const resolved = resolveHeadlessModules(
            [],
            [
                remoteModule("old", { isEnabled: false }),
                remoteModule("new", {
                    remote: {
                        url: "https://localhost/new/remoteEntry.js",
                        scope: "old",
                        module: "./headlessModule",
                    },
                }),
            ],
            platformContext(),
        );
        expect(resolved.map((item) => item.id)).toEqual(["new"]);
    });

    it("ignores a local item in the remote registry", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        const resolved = resolveHeadlessModules(
            [],
            [localModule("bundled"), remoteModule("remote-only")],
            platformContext(),
        );
        expect(resolved.map((item) => item.id)).toEqual(["remote-only"]);
        expect(error).toHaveBeenCalledTimes(1);
    });

    it("drops a module with malformed requirements and keeps the others", () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        const resolved = resolveHeadlessModules(
            [],
            [
                { ...remoteModule("malformed"), requiredSettings: { $or: {} } },
                { ...remoteModule("also-malformed"), requiredEntitlements: { $and: null } },
                { ...remoteModule("array-permissions"), requiredOrganizationPermissions: [] },
                { ...remoteModule("string-settings"), requiredSettings: "enableX" },
                remoteModule("valid"),
            ] as unknown,
            platformContext(),
        );
        expect(resolved.map((item) => item.id)).toEqual(["valid"]);
        expect(error).toHaveBeenCalledTimes(2);
    });

    it("drops disabled modules", () => {
        const resolved = resolveHeadlessModules(
            [],
            [remoteModule("on"), remoteModule("off", { isEnabled: false })],
            platformContext(),
        );
        expect(resolved.map((item) => item.id)).toEqual(["on"]);
    });

    it("evaluates requiredSettings against the organization-level user settings", () => {
        const resolved = resolveHeadlessModules(
            [],
            [remoteModule("telemetry", { requiredSettings: { restrictBaseUi: true } })],
            platformContext(),
        );
        expect(resolved.map((item) => item.id)).toEqual(["telemetry"]);
    });

    it("drops modules whose organization permissions are not met", () => {
        const resolved = resolveHeadlessModules(
            [],
            [
                remoteModule("admin-only", {
                    requiredOrganizationPermissions: { canManageOrganization: true },
                }),
            ],
            platformContext({ organizationPermissions: { canManageOrganization: false } }),
        );
        expect(resolved).toEqual([]);
    });

    it("mounts no module in export mode", () => {
        expect(
            resolveHeadlessModules([], [remoteModule("telemetry")], platformContext({ isExportMode: true })),
        ).toEqual([]);
    });
});
