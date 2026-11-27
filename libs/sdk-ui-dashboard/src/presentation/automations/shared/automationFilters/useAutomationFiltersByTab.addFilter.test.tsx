// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { act, renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type FilterContextItem, type ICatalogAttribute, idRef } from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../model/store/filtering/types.js";
import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { AUTOMATIONS_CONTEXT } from "../../tests/shared.test.helpers.js";

import { useAutomationFiltersByTab } from "./useAutomationFilters.js";

const CITY_DISPLAY_FORM = idRef("df-city", "displayForm");

const CITY_FILTER: FilterContextItem = {
    attributeFilter: {
        localIdentifier: "city",
        displayForm: CITY_DISPLAY_FORM,
        negativeSelection: true,
        attributeElements: { uris: [] },
    },
};

const CITY_ATTRIBUTE = {
    type: "attribute",
    attribute: { title: "City", ref: idRef("attr-city", "attribute") },
    defaultDisplayForm: { ref: CITY_DISPLAY_FORM },
    displayForms: [{ ref: CITY_DISPLAY_FORM }],
} as unknown as ICatalogAttribute;

const tab = (tabId: string): IAutomationFiltersTab =>
    ({
        tabId,
        tabTitle: tabId,
        availableFilters: [CITY_FILTER],
        selectableFilters: [CITY_FILTER],
        defaultSelectedFilters: [],
        lockedFilters: [],
        hiddenFilters: [],
    }) as unknown as IAutomationFiltersTab;

const TABS = [tab("tabA"), tab("tabB")];

const wrapper = ({ children }: { children: ReactNode }) => (
    <IntlProvider
        locale="en-US"
        messages={{ "automationFilters.announcement.filterAdded": "Filter {title} added." }}
    >
        <AutomationsContextProvider value={{ ...AUTOMATIONS_CONTEXT, catalogAttributes: [CITY_ATTRIBUTE] }}>
            {children}
        </AutomationsContextProvider>
    </IntlProvider>
);

describe("useAutomationFiltersByTab adding a filter", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = "";
    });

    it("moves focus to the add button of the same tab and announces the added filter", () => {
        const onFiltersByTabChange = vi.fn();
        const { result } = renderHook(
            () =>
                useAutomationFiltersByTab({
                    filtersByTab: TABS,
                    editedFiltersByTab: { tabA: [], tabB: [] },
                    onFiltersByTabChange,
                    onStoreFiltersChange: vi.fn(),
                }),
            { wrapper },
        );

        const tabAButton = document.createElement("button");
        const tabBButton = document.createElement("button");
        document.body.append(tabAButton, tabBButton);
        result.current.setTabAddFilterButtonRefs("tabA", tabAButton);
        result.current.setTabAddFilterButtonRefs("tabB", tabBButton);
        // The closed dropdown leaves focus on the body.
        expect(document.activeElement).toBe(document.body);

        act(() => {
            result.current.handleTabFilterAdd("tabA", CITY_DISPLAY_FORM, [CITY_ATTRIBUTE], []);
        });
        act(() => {
            vi.runAllTimers();
        });

        expect(onFiltersByTabChange).toHaveBeenCalledWith({ tabA: [CITY_FILTER], tabB: [] });
        expect(document.activeElement).toBe(tabAButton);
        expect(result.current.filterAnnouncement).toBe("Filter City added.");
    });

    it("announces again when the same filter is added to another tab", () => {
        const { result } = renderHook(
            () =>
                useAutomationFiltersByTab({
                    filtersByTab: TABS,
                    editedFiltersByTab: { tabA: [], tabB: [] },
                    onFiltersByTabChange: vi.fn(),
                    onStoreFiltersChange: vi.fn(),
                }),
            { wrapper },
        );

        act(() => {
            result.current.handleTabFilterAdd("tabA", CITY_DISPLAY_FORM, [CITY_ATTRIBUTE], []);
        });
        act(() => {
            vi.runAllTimers();
        });
        expect(result.current.filterAnnouncement).toBe("Filter City added.");

        act(() => {
            result.current.handleTabFilterAdd("tabB", CITY_DISPLAY_FORM, [CITY_ATTRIBUTE], []);
        });
        // The live region is emptied first, so the identical message is a content change.
        expect(result.current.filterAnnouncement).toBe("");

        act(() => {
            vi.runAllTimers();
        });
        expect(result.current.filterAnnouncement).toBe("Filter City added.");
    });
});
