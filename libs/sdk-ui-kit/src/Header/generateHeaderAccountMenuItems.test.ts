// (C) 2021-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IGenerateHeaderAccountMenuItemsOptions,
    generateHeaderAccountMenuItems,
} from "./generateHeaderAccountMenuItems.js";
import { makeWorkspacePermissions } from "./Header.test.helpers.js";

const requiredOptions = {
    featureFlags: {},
    currentLanguage: "en-US",
} satisfies IGenerateHeaderAccountMenuItemsOptions;

describe("generateHeaderAccountMenuItems", () => {
    it("should return workspace link and logout item if feature flag is on and permission is available", () => {
        const items = generateHeaderAccountMenuItems(makeWorkspacePermissions({ canManageProject: true }), {
            ...requiredOptions,
            workspaceId: "TestWorkspaceId",
            featureFlags: { enableWorkspaceSettingsAppHeaderMenuItem: true },
        });
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
        const items = generateHeaderAccountMenuItems(makeWorkspacePermissions(), {
            ...requiredOptions,
            featureFlags: { enableWorkspaceSettingsAppHeaderMenuItem: true },
        });
        expect(items).toEqual([{ className: "s-logout", key: "gs.header.logout" }]);
    });

    it("should return only logout item when workspace settings feature flag is off and permission is not available", () => {
        const items = generateHeaderAccountMenuItems(makeWorkspacePermissions(), requiredOptions);
        expect(items).toEqual([{ className: "s-logout", key: "gs.header.logout" }]);
    });
});
