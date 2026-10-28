// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type FilterContextItem, type IDashboard, idRef } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

import { preloadAttributeFiltersData } from "./index.js";

const ctx = {} as DashboardContext;

const attributeFilter = (displayForm: string): FilterContextItem => ({
    attributeFilter: {
        displayForm: idRef(displayForm, "displayForm"),
        attributeElements: { uris: [] },
        negativeSelection: true,
        localIdentifier: displayForm,
    },
});

const dashboard = (filters: FilterContextItem[]) =>
    ({
        tabs: [{ localIdentifier: "tab", title: "Tab", filterContext: { filters } }],
    }) as unknown as IDashboard;

const preloaded = {
    refs: [idRef("region", "displayForm"), idRef("product", "displayForm")],
    attributesWithReferences: [],
};

function runUntilDone(dashboardToPreload: IDashboard, preloadedAttributes?: typeof preloaded) {
    const saga = preloadAttributeFiltersData(ctx, dashboardToPreload, preloadedAttributes);
    // the selection of the unavailable objects
    saga.next();
    return saga.next([]);
}

describe("preloadAttributeFiltersData", () => {
    it("reuses the attributes loaded during the initialization when they cover every filter", () => {
        const step = runUntilDone(dashboard([attributeFilter("region")]), preloaded);

        expect(step.done).toBe(true);
    });

    it("loads the attributes when a filter uses a display form the initialization did not load", () => {
        const step = runUntilDone(dashboard([attributeFilter("region"), attributeFilter("city")]), preloaded);

        expect(step.done).toBe(false);
    });

    it("loads the attributes when the initialization loaded none", () => {
        const step = runUntilDone(dashboard([attributeFilter("region")]));

        expect(step.done).toBe(false);
    });
});
