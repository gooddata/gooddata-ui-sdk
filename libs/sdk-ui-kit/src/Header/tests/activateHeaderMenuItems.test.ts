// (C) 2021-2025 GoodData Corporation

import { beforeAll, describe, expect, it } from "vitest";

import { getAccountMenuFeatureFlagsMock, getWorkspacePermissionsMock } from "./mock.js";
import { activateHeaderMenuItems } from "../activateHeaderMenuItems.js";
import { HEADER_ITEM_ID_KPIS_NEW, generateHeaderMenuItemsGroups } from "../generateHeaderMenuItemsGroups.js";
import { type IHeaderMenuItem } from "../typings.js";

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
            getAccountMenuFeatureFlagsMock(true, "enterprise"),
            getWorkspacePermissionsMock(true, true),
            true,
            "TestWorkspaceId",
            false,
            false,
        );
    });

    it("nothing is active", () => {
        const changed = activateHeaderMenuItems(items, []);

        expect(findAllActiveIds(changed)).toEqual([]);
    });

    it("activate only one item", () => {
        const changed = activateHeaderMenuItems(items, [HEADER_ITEM_ID_KPIS_NEW]);

        expect(findAllActiveIds(changed)).toEqual([HEADER_ITEM_ID_KPIS_NEW]);
    });
});
