// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { getDefaultInsightEditMenuItems } from "./getDefaultInsightEditMenuItems.js";

const widget: IInsightWidget = {
    type: "insight",
    insight: idRef("insight-1", "insight"),
    ref: idRef("widget-1"),
    uri: "/widget-1",
    identifier: "widget-1",
    title: "Confidential revenue",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

const dependencies = {
    intl: { formatMessage: ({ id }: { id: string }) => id } as never,
    dispatch: vi.fn(),
    eventDispatch: vi.fn(),
};

describe("getDefaultInsightEditMenuItems", () => {
    it("offers removal alone for a widget whose insight the editor cannot read", () => {
        const items = getDefaultInsightEditMenuItems(widget, {
            ...dependencies,
            includeConfigurations: false,
            includeInteractions: false,
        });

        // a restricted widget gets one entry, and no separator that would imply a missing one
        expect(items.map((item) => item.itemId)).toEqual(["InteractionPanelRemove"]);
    });

    it("keeps configuration and interactions for a readable one", () => {
        const items = getDefaultInsightEditMenuItems(widget, dependencies);

        expect(items.map((item) => item.itemId)).toEqual([
            "ConfigurationPanelSubmenu",
            "InteractionPanelSubmenu",
            "InteractionPanelRemoveSeparator",
            "InteractionPanelRemove",
        ]);
    });
});
