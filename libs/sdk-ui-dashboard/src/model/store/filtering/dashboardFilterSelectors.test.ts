// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, idRef } from "@gooddata/sdk-model";

import {
    selectExecutableDashboardFilters,
    selectRestrictedDashboardFilterCount,
    selectRestrictedDashboardFilterLocalIdentifiers,
    selectRestrictedDashboardFilterLocalIdentifiersForTab,
} from "./dashboardFilterSelectors.js";

// The combiners are called directly so we don't have to build the full dashboard state.
const combinerOf = (selector: unknown) =>
    (selector as { resultFunc: (...args: never[]) => any }).resultFunc as (...args: any[]) => any;

const restrictedLabel = idRef("restricted-label", "displayForm");

function attributeFilter(localIdentifier: string, displayForm = idRef("label", "displayForm")) {
    return {
        attributeFilter: {
            displayForm,
            negativeSelection: false,
            attributeElements: { uris: [] },
            localIdentifier,
        },
    } as FilterContextItem;
}

const visibleFilter = attributeFilter("visible");
const forbiddenFilter = attributeFilter("forbidden", restrictedLabel);
const unavailable: IUnavailableDashboardReference[] = [
    { ref: restrictedLabel, type: "displayForm", reason: "forbidden" },
];

describe("restricted filter selectors", () => {
    it("keeps restricted filters out of the executable ones", () => {
        const filters = [visibleFilter, forbiddenFilter];

        expect(combinerOf(selectExecutableDashboardFilters)(filters, unavailable)).toEqual([visibleFilter]);
        expect(combinerOf(selectExecutableDashboardFilters)(filters, [])).toEqual(filters);
    });

    it("collects local identifiers of the restricted filters, for the active tab and a given tab", () => {
        expect([...combinerOf(selectRestrictedDashboardFilterLocalIdentifiers)([forbiddenFilter])]).toEqual([
            "forbidden",
        ]);

        const restrictedByTab = { "tab-1": [], "tab-2": [forbiddenFilter] };
        const forTab = (tabId: string) =>
            combinerOf(selectRestrictedDashboardFilterLocalIdentifiersForTab(tabId))(restrictedByTab);

        expect([...forTab("tab-2")]).toEqual(["forbidden"]);
        expect([...forTab("tab-1")]).toEqual([]);
        expect([...forTab("unknown-tab")]).toEqual([]);
    });

    it("counts the restricted filters the viewer would otherwise see, but not the hidden ones", () => {
        const count = (attributeFilterConfigs: { localIdentifier: string; mode: string }[]) =>
            combinerOf(selectRestrictedDashboardFilterCount)(
                [forbiddenFilter],
                undefined,
                [],
                attributeFilterConfigs,
                [],
            );

        expect(count([])).toBe(1);
        expect(count([{ localIdentifier: "forbidden", mode: "active" }])).toBe(1);
        expect(count([{ localIdentifier: "forbidden", mode: "hidden" }])).toBe(0);
    });

    it("counts a restricted measure value filter unless the author hid that one too", () => {
        const forbiddenMeasureValueFilter = {
            dashboardMeasureValueFilter: { measure: idRef("metric"), localIdentifier: "forbidden-mvf" },
        } as FilterContextItem;
        const count = (measureValueFilterConfigs: { localIdentifier: string; mode: string }[]) =>
            combinerOf(selectRestrictedDashboardFilterCount)(
                [forbiddenMeasureValueFilter],
                undefined,
                [],
                [],
                measureValueFilterConfigs,
            );

        expect(count([])).toBe(1);
        expect(count([{ localIdentifier: "forbidden-mvf", mode: "hidden" }])).toBe(0);
    });
});
