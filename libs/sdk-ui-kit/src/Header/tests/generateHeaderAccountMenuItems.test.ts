// (C) 2021-2025 GoodData Corporation
import { generateHeaderAccountMenuItems } from "../generateHeaderAccountMenuItems.js";
import { getWorkspacePermissionsMock } from "./mock.js";
import { describe, it, expect } from "vitest";

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
