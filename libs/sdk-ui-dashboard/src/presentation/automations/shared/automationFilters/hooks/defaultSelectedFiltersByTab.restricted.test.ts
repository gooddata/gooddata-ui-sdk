// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type FilterContextItem, type IAutomationMetadataObject, idRef } from "@gooddata/sdk-model";

import { getDefaultSelectedFiltersByTabForExistingAutomation } from "./useDefaultSelectedFiltersForExistingAutomation.js";

const attributeFilter = (localIdentifier: string): FilterContextItem => ({
    attributeFilter: {
        localIdentifier,
        displayForm: idRef(`df-${localIdentifier}`),
        negativeSelection: false,
        attributeElements: { uris: [`/${localIdentifier}`] },
    },
});

const READABLE = attributeFilter("readable");
const RESTRICTED = attributeFilter("restricted");

// The author hid both before the automation was saved, so neither has a visible-filter entry;
// only the export definition still carries them.
const automation = {
    metadata: { visibleFiltersByTab: { tab1: [] } },
    exportDefinitions: [
        {
            requestPayload: {
                type: "dashboard",
                content: { filtersByTab: { tab1: [READABLE, RESTRICTED] } },
            },
        },
    ],
} as unknown as IAutomationMetadataObject;

const selectionFor = (isFilterRestricted: (filter: FilterContextItem) => boolean) =>
    getDefaultSelectedFiltersByTabForExistingAutomation(automation, {}, undefined, isFilterRestricted);

describe("getDefaultSelectedFiltersByTabForExistingAutomation with restricted filters", () => {
    it("keeps a stored restricted filter that has no visible-filter entry", () => {
        expect(selectionFor((filter) => filter === RESTRICTED)).toEqual({ tab1: [RESTRICTED] });
    });

    it("leaves a readable one to be re-derived from the dashboard", () => {
        expect(selectionFor(() => false)).toEqual({});
    });
});
