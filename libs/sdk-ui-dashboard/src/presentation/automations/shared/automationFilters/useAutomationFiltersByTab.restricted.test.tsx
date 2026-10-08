// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import type { IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IDashboardAttributeFilterConfig,
    idRef,
    newAllTimeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { selectAutomationFiltersByTab } from "../../../../model/store/filtering/dashboardFilterSelectors.js";
import type { IAutomationFiltersTab } from "../../../../model/store/filtering/types.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { AUTOMATIONS_CONTEXT } from "../../tests/shared.test.helpers.js";

import { getDefaultSelectedFiltersByTabForExistingAutomation } from "./hooks/useDefaultSelectedFiltersForExistingAutomation.js";
import { useAutomationFiltersByTab } from "./useAutomationFilters.js";

const attributeFilter = (localIdentifier: string): FilterContextItem => ({
    attributeFilter: {
        localIdentifier,
        displayForm: idRef(`df-${localIdentifier}`, "displayForm"),
        negativeSelection: false,
        attributeElements: { uris: [`/${localIdentifier}`] },
    },
});

const COMMON_DATE = newAllTimeDashboardDateFilter(undefined, "commonDate");
const LOCKED_RESTRICTED = attributeFilter("city");
const HIDDEN_RESTRICTED = attributeFilter("county");
const RESTRICTED = [LOCKED_RESTRICTED, HIDDEN_RESTRICTED];

const TAB_A_CONFIGS: IDashboardAttributeFilterConfig[] = [
    { localIdentifier: "city", mode: "readonly" },
    { localIdentifier: "county", mode: "hidden" },
];

const forbidden = (localIdentifier: string): IUnavailableDashboardReference => ({
    ref: idRef(`df-${localIdentifier}`, "displayForm"),
    type: "displayForm",
    reason: "forbidden",
});

// The combiner is called directly, so the tabs are exactly what the dashboard hands the dialog.
const filtersByTabCombiner = (
    selectAutomationFiltersByTab as unknown as { resultFunc: (...args: unknown[]) => IAutomationFiltersTab[] }
).resultFunc;

const TABS = filtersByTabCombiner(
    [
        { localIdentifier: "tabA", title: "A" },
        { localIdentifier: "tabB", title: "B" },
    ],
    { tabA: [COMMON_DATE, LOCKED_RESTRICTED, HIDDEN_RESTRICTED], tabB: [COMMON_DATE] },
    [forbidden("city"), forbidden("county")],
    {},
    {},
    { tabA: TAB_A_CONFIGS, tabB: [] },
    {},
);

// Saved by an author who can read both filters: the visible ones, plus the hidden one.
const AUTOMATION = {
    metadata: {
        visibleFiltersByTab: {
            tabA: [
                { localIdentifier: "commonDate", isAllTimeDateFilter: true },
                { localIdentifier: "city", isAllTimeDateFilter: false },
            ],
            tabB: [{ localIdentifier: "commonDate", isAllTimeDateFilter: true }],
        },
    },
    exportDefinitions: [
        {
            requestPayload: {
                type: "dashboard",
                content: {
                    filtersByTab: {
                        tabA: [COMMON_DATE, LOCKED_RESTRICTED, HIDDEN_RESTRICTED],
                        tabB: [COMMON_DATE],
                    },
                },
            },
        },
    ],
} as unknown as IAutomationMetadataObject;

const isFilterRestricted = (filter: FilterContextItem) => RESTRICTED.includes(filter);

describe("useAutomationFiltersByTab with a stored hidden restricted filter", () => {
    it("reports the locked restricted filter of the tab, not the hidden one", () => {
        const editedFiltersByTab = getDefaultSelectedFiltersByTabForExistingAutomation(
            AUTOMATION,
            { tabA: TABS[0].availableFilters, tabB: TABS[1].availableFilters },
            "commonDate",
            isFilterRestricted,
        );

        const wrapper = ({ children }: { children: ReactNode }) => (
            <IntlProvider locale="en-US" messages={{}}>
                <AutomationsContextProvider
                    value={{
                        ...AUTOMATIONS_CONTEXT,
                        attributeFilterConfigsByTab: { tabA: TAB_A_CONFIGS, tabB: [] },
                        isFilterRestricted,
                    }}
                >
                    {children}
                </AutomationsContextProvider>
            </IntlProvider>
        );

        const { result } = renderHook(
            () =>
                useAutomationFiltersByTab({
                    filtersByTab: TABS,
                    editedFiltersByTab,
                    onFiltersByTabChange: vi.fn(),
                    onStoreFiltersChange: vi.fn(),
                }),
            { wrapper },
        );

        const [tabA, tabB] = result.current.processedFiltersByTab ?? [];
        expect(tabA.restrictedFilterCount).toBe(1);
        expect(tabA.visibleFilters).toEqual([COMMON_DATE]);
        expect(tabB.restrictedFilterCount).toBe(0);
    });
});
