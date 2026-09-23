// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type FilterContextItem, type ICatalogAttribute, idRef } from "@gooddata/sdk-model";

import { AutomationsContextProvider } from "../../contexts/AutomationsContext.js";
import { AUTOMATIONS_CONTEXT } from "../../tests/shared.test.helpers.js";

import { useAutomationFilters } from "./useAutomationFilters.js";

const attributeFilter = (localIdentifier: string): FilterContextItem => ({
    attributeFilter: {
        localIdentifier,
        displayForm: idRef(`df-${localIdentifier}`),
        negativeSelection: false,
        attributeElements: { uris: [`/${localIdentifier}`] },
    },
});

// getCatalogAttributesByFilters matches on displayForms[].ref alone.
const catalogAttribute = (localIdentifier: string) =>
    ({ displayForms: [{ ref: idRef(`df-${localIdentifier}`) }] }) as ICatalogAttribute;

const MESSAGES = {
    "automationFilters.announcement.restrictedFiltersRemoved": "Restricted filters removed.",
};

const READABLE = attributeFilter("readable");
const RESTRICTED = attributeFilter("restricted");
const READABLE_ATTRIBUTE = catalogAttribute("readable");
const RESTRICTED_ATTRIBUTE = catalogAttribute("restricted");

function renderAutomationFilters(
    selectedFilters: FilterContextItem[],
    onFiltersChange = vi.fn(),
    hiddenLocalIdentifiers: string[] = [],
) {
    const wrapper = ({ children }: { children: ReactNode }) => (
        <IntlProvider locale="en-US" messages={MESSAGES}>
            <AutomationsContextProvider
                value={{
                    ...AUTOMATIONS_CONTEXT,
                    catalogAttributes: [READABLE_ATTRIBUTE, RESTRICTED_ATTRIBUTE],
                    attributeFilterConfigs: hiddenLocalIdentifiers.map((localIdentifier) => ({
                        localIdentifier,
                        mode: "hidden" as const,
                    })),
                    isFilterRestricted: (filter) => filter === RESTRICTED,
                }}
            >
                {children}
            </AutomationsContextProvider>
        </IntlProvider>
    );

    const { result } = renderHook(
        () =>
            useAutomationFilters({
                availableFilters: [READABLE, RESTRICTED],
                selectedFilters,
                onFiltersChange,
                onStoreFiltersChange: vi.fn(),
            }),
        { wrapper },
    );

    return { result, onFiltersChange };
}

describe("useAutomationFilters with restricted filters", () => {
    it("reports a restricted filter as a count and keeps it out of the rendered ones", () => {
        const { result } = renderAutomationFilters([READABLE, RESTRICTED]);

        expect(result.current.visibleFilters).toEqual([READABLE]);
        expect(result.current.restrictedFilterCount).toBe(1);
    });

    it("removes every restricted filter from the selection at once", () => {
        const { result, onFiltersChange } = renderAutomationFilters([READABLE, RESTRICTED]);

        result.current.handleRemoveRestrictedFilters();

        expect(onFiltersChange).toHaveBeenCalledWith([READABLE]);
    });

    it("keeps a removed restricted filter out of the add-filter dropdown", () => {
        const { result } = renderAutomationFilters([RESTRICTED]);

        expect(result.current.attributes).toEqual([READABLE_ATTRIBUTE]);
    });

    it("still reports a restricted filter the author hid after it was stored", () => {
        const { result } = renderAutomationFilters([READABLE, RESTRICTED], vi.fn(), ["restricted"]);

        expect(result.current.visibleFilters).toEqual([READABLE]);
        expect(result.current.restrictedFilterCount).toBe(1);
    });

    it("reports nothing to add when the only unselected filter is restricted", () => {
        const { result } = renderAutomationFilters([READABLE]);

        expect(result.current.attributes).toEqual([]);
        expect(result.current.hasFiltersToAdd).toBe(false);
    });
});
