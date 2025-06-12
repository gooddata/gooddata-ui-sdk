// (C) 2021-2022 GoodData Corporation
import { getAccountMenuFeatureFlagsMock, getWorkspacePermissionsMock } from "./mock.js";
import {
    generateHeaderMenuItemsGroups,
    HEADER_ITEM_ID_DASHBOARDS,
    HEADER_ITEM_ID_KPIS,
} from "../generateHeaderMenuItemsGroups.js";
import { activateHeaderMenuItems } from "../activateHeaderMenuItems.js";
import { IHeaderMenuItem } from "../typings.js";
import { describe, it, expect, beforeAll } from "vitest";

describe("activateHeaderMenuItems", () => {
    let items: IHeaderMenuItem[][];

    function findAllActiveIds(all: IHeaderMenuItem[][]): string[] {
        return all.reduce((acc: string[], current) => {
            acc.push(...current.filter((item) => item.isActive).map((item) => item.key));
            return acc;
        }, []);
    }

    beforeAll(() => {
        items = generateHeaderMenuItemsGroups(
            getAccountMenuFeatureFlagsMock(true, true, false, true, true, "enterprise", false),
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            "TestDashboardId",
            "TestTabId",
            false,
            false,
        );
    });

    it("nothing is active", () => {
        const changed = activateHeaderMenuItems(items, []);

        expect(findAllActiveIds(changed)).toEqual([]);
    });

    it("activate only one item", () => {
        const changed = activateHeaderMenuItems(items, [HEADER_ITEM_ID_DASHBOARDS]);

        expect(findAllActiveIds(changed)).toEqual([HEADER_ITEM_ID_DASHBOARDS]);
    });

    it("activate more items", () => {
        const changed = activateHeaderMenuItems(items, [HEADER_ITEM_ID_DASHBOARDS, HEADER_ITEM_ID_KPIS]);

        expect(findAllActiveIds(changed)).toEqual([HEADER_ITEM_ID_DASHBOARDS, HEADER_ITEM_ID_KPIS]);
    });
});
