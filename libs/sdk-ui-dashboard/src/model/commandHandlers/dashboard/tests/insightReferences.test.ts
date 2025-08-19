// (C) 2021-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { insightReferences } from "../common/insightReferences.js";

describe("insight references check", () => {
    it("empty", () => {
        const results = insightReferences();
        expect(results).toEqual([]);
    });

    it("insight only", () => {
        const results = insightReferences({
            type: "IDashboardLayout",
            sections: [
                {
                    type: "IDashboardLayoutSection",
                    items: [
                        {
                            type: "IDashboardLayoutItem",
                            size: { xl: { gridWidth: 20, gridHeight: 20 } },
                            widget: {
                                type: "insight",
                                insight: idRef("i1"),
                                ref: idRef("i1-ref"),
                                drills: [],
                                title: "",
                                description: "",
                                ignoreDashboardFilters: [],
                            },
                        },
                    ],
                },
            ],
        });
        expect(results).toEqual([{ identifier: "i1" }]);
    });

    it("insight and insight with insight drills", () => {
        const results = insightReferences({
            type: "IDashboardLayout",
            sections: [
                {
                    type: "IDashboardLayoutSection",
                    items: [
                        {
                            type: "IDashboardLayoutItem",
                            size: { xl: { gridWidth: 20, gridHeight: 20 } },
                            widget: {
                                type: "insight",
                                insight: idRef("i1"),
                                ref: idRef("i1-ref"),
                                drills: [],
                                title: "",
                                description: "",
                                ignoreDashboardFilters: [],
                            },
                        },
                        {
                            type: "IDashboardLayoutItem",
                            size: { xl: { gridWidth: 20, gridHeight: 20 } },
                            widget: {
                                type: "insight",
                                insight: idRef("i2"),
                                ref: idRef("i2-ref"),
                                drills: [
                                    {
                                        type: "drillToInsight",
                                        target: idRef("i3"),
                                        origin: { type: "drillFromMeasure", measure: idRef("test") },
                                        transition: "pop-up",
                                    },
                                ],
                                title: "",
                                description: "",
                                ignoreDashboardFilters: [],
                            },
                        },
                    ],
                },
            ],
        });
        expect(results).toEqual([{ identifier: "i1" }, { identifier: "i2" }, { identifier: "i3" }]);
    });
});
