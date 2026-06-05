// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { generateHeaderAccountMenuItems } from "../generateHeaderAccountMenuItems.js";

import { getWorkspacePermissionsMock } from "./mock.js";

describe("generateHeaderAccountMenuItems", () => {
    it("should return workspace link and logout item if feature flag is on and permission is available", () => {
        const items = generateHeaderAccountMenuItems(
            getWorkspacePermissionsMock(true, true, true),
            "TestWorkspaceId",
            { enableWorkspaceSettingsAppHeaderMenuItem: true },
        );
        expect(items).toEqual([
            {
                className: "s-workspace-settings",
                key: "gs.header.workspaceSettings",
                href: "/workspaces/TestWorkspaceId/settings",
            },
            { className: "s-logout", key: "gs.header.logout" },
        ]);
    });

    it("should prefix the workspace settings link with the host base path when the shell application is enabled", () => {
        const items = generateHeaderAccountMenuItems(
            getWorkspacePermissionsMock(true, true, true),
            "TestWorkspaceId",
            { enableWorkspaceSettingsAppHeaderMenuItem: true, enableShellApplication: true },
        );
        expect(items).toEqual([
            {
                className: "s-workspace-settings",
                key: "gs.header.workspaceSettings",
                href: "/organization/settings/workspaces/TestWorkspaceId/settings",
            },
            { className: "s-logout", key: "gs.header.logout" },
        ]);
    });

    it("should return only logout item when workspace settings feature flag is on but permission is not available", () => {
        const items = generateHeaderAccountMenuItems(
            getWorkspacePermissionsMock(true, true, false),
            "TestWorkspaceId",
            { enableWorkspaceSettingsAppHeaderMenuItem: true },
        );
        expect(items).toEqual([{ className: "s-logout", key: "gs.header.logout" }]);
    });

    it("should return only logout item when workspace settings feature flag is off and permission is not available", () => {
        const items = generateHeaderAccountMenuItems(
            getWorkspacePermissionsMock(true, true, true),
            "TestWorkspaceId",
        );
        expect(items).toEqual([{ className: "s-logout", key: "gs.header.logout" }]);
    });
});
