// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, type IdentifierRef, idRef } from "@gooddata/sdk-model";

import {
    selectAllDashboardFiltersWithoutCrossFiltering,
    selectAutomationAvailableDashboardFilters,
    selectAutomationDefaultSelectedFilters,
    selectExecutableDashboardFilters,
    selectReportedRestrictedDashboardFilters,
    selectRestrictedDashboardFilterCount,
    selectRestrictedDashboardFilterLocalIdentifiers,
    selectRestrictedDashboardFilterLocalIdentifiersForTab,
} from "./dashboardFilterSelectors.js";

// The combiners are called directly so we don't have to build the full dashboard state.
const combinerOf = (selector: unknown) =>
    (selector as { resultFunc: (...args: never[]) => any }).resultFunc as (...args: any[]) => any;

const restrictedLabel = idRef("restricted-label", "displayForm");

function attributeFilter(
    localIdentifier: string,
    displayForm = idRef("label", "displayForm"),
    negativeSelection = false,
) {
    return {
        attributeFilter: {
            displayForm,
            negativeSelection,
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

    it("reports the restricted filters the viewer would otherwise see, but not the hidden ones", () => {
        const reported = (attributeFilterConfigs: { localIdentifier: string; mode: string }[]) =>
            combinerOf(selectReportedRestrictedDashboardFilters)(
                [forbiddenFilter],
                undefined,
                [],
                attributeFilterConfigs,
                [],
            );

        expect(reported([])).toEqual([forbiddenFilter]);
        expect(reported([{ localIdentifier: "forbidden", mode: "active" }])).toEqual([forbiddenFilter]);
        expect(reported([{ localIdentifier: "forbidden", mode: "hidden" }])).toEqual([]);
    });

    it("reports a restricted measure value filter unless the author hid that one too", () => {
        const forbiddenMeasureValueFilter = {
            dashboardMeasureValueFilter: { measure: idRef("metric"), localIdentifier: "forbidden-mvf" },
        } as FilterContextItem;
        const reported = (measureValueFilterConfigs: { localIdentifier: string; mode: string }[]) =>
            combinerOf(selectReportedRestrictedDashboardFilters)(
                [forbiddenMeasureValueFilter],
                undefined,
                [],
                [],
                measureValueFilterConfigs,
            );

        expect(reported([])).toEqual([forbiddenMeasureValueFilter]);
        expect(reported([{ localIdentifier: "forbidden-mvf", mode: "hidden" }])).toEqual([]);
    });

    it("counts what it reports", () => {
        expect(combinerOf(selectRestrictedDashboardFilterCount)([forbiddenFilter])).toBe(1);
        expect(combinerOf(selectRestrictedDashboardFilterCount)([])).toBe(0);
    });
});

// negativeSelection with no elements is the "all values" noop
const allValuesFilter = (localIdentifier: string, displayForm?: IdentifierRef) =>
    attributeFilter(localIdentifier, displayForm, true);

describe("automation filter selectors", () => {
    it("keeps a restricted filter available to an automation, unlike the executable ones", () => {
        const automationFilters = combinerOf(selectAllDashboardFiltersWithoutCrossFiltering)(
            [visibleFilter, forbiddenFilter],
            [],
        );
        expect(automationFilters).toEqual(expect.arrayContaining([visibleFilter, forbiddenFilter]));

        expect(
            combinerOf(selectAutomationAvailableDashboardFilters)(automationFilters, undefined, [], []),
        ).toEqual(expect.arrayContaining([visibleFilter, forbiddenFilter]));
    });

    it("leaves a restricted filter out of a new automation's preselection", () => {
        const emptyReadable = allValuesFilter("empty-readable");
        const emptyForbidden = allValuesFilter("empty-forbidden", restrictedLabel);

        expect(
            combinerOf(selectAutomationDefaultSelectedFilters)(
                [visibleFilter, forbiddenFilter, emptyReadable, emptyForbidden],
                unavailable,
            ),
        ).toEqual([visibleFilter]);
    });
});
