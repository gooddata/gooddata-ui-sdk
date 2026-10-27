// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IInsightMenuItem, type IInsightMenuItemButton } from "../widget/insightMenu/types.js";

import { addEditMenuItem, addExploreMenuItem } from "./useInsightEditorMenuItems.js";

const button = (itemId: string): IInsightMenuItemButton => ({ type: "button", itemId, itemName: itemId });
const separator = (itemId: string): IInsightMenuItem => ({ type: "separator", itemId });
const ids = (items: IInsightMenuItem[]) => items.map((item) => item.itemId);

describe("addExploreMenuItem", () => {
    it("puts the explore item first and separates it from the other items", () => {
        const items = addExploreMenuItem([button("export")], button("explore"));
        expect(ids(items)).toEqual(["explore", "explore-separator", "export"]);
    });

    it("adds no separator in front of a separator", () => {
        const items = addExploreMenuItem([separator("other"), button("export")], button("explore"));
        expect(ids(items)).toEqual(["explore", "other", "export"]);
    });

    it("adds no separator when there are no other items", () => {
        expect(ids(addExploreMenuItem([], button("explore")))).toEqual(["explore"]);
    });

    it("keeps the items when there is no explore item", () => {
        const items = [button("export")];
        expect(addExploreMenuItem(items, undefined)).toBe(items);
    });
});

describe("addEditMenuItem", () => {
    it("puts the edit item before the remove item", () => {
        const items = addEditMenuItem(
            [
                button("ConfigurationPanelSubmenu"),
                separator("InteractionPanelRemoveSeparator"),
                button("InteractionPanelRemove"),
            ],
            button("options-menu-edit-insight"),
        );
        expect(ids(items)).toEqual([
            "ConfigurationPanelSubmenu",
            "InteractionPanelRemoveSeparator",
            "options-menu-edit-insight",
            "edit-insight-separator",
            "InteractionPanelRemove",
        ]);
    });

    it("keeps the items when there is no edit item", () => {
        const items = [button("InteractionPanelRemove")];
        expect(addEditMenuItem(items, undefined)).toBe(items);
    });
});
