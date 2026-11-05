// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IAttributeWithReferences } from "@gooddata/sdk-backend-spi";
import {
    type FilterContextItem,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type ObjRef,
    idRef,
    uriRef,
} from "@gooddata/sdk-model";

import { mergeDashboardOverrideFilters, resolveOverrideFiltersByTab } from "./overrideFiltersAcrossTabs.js";

const region = idRef("region", "displayForm");
const product = idRef("product", "displayForm");

function regionFilter(localIdentifier: string, uris: string[]): IDashboardAttributeFilter {
    return {
        attributeFilter: {
            displayForm: region,
            attributeElements: { uris },
            negativeSelection: false,
            localIdentifier,
            selectionMode: "multi",
        },
    };
}

function productFilter(localIdentifier: string, uris: string[]): FilterContextItem {
    return {
        attributeFilter: {
            displayForm: product,
            attributeElements: { uris },
            negativeSelection: false,
            localIdentifier,
            selectionMode: "multi",
        },
    };
}

function thisYear(localIdentifier?: string): IDashboardDateFilter {
    return {
        dateFilter: {
            type: "relative",
            granularity: "GDC.time.year",
            from: 0,
            to: 0,
            ...(localIdentifier ? { localIdentifier } : {}),
        },
    };
}

function tab(localIdentifier: string, filters: FilterContextItem[]) {
    return {
        localIdentifier,
        title: localIdentifier,
        filterContext: { filters },
    };
}

describe("resolveOverrideFiltersByTab", () => {
    const savedA = [regionFilter("a_region", ["east"]), productFilter("a_product", ["stored"])];
    const savedB = [regionFilter("b_region", ["west-saved"])];
    const embedFilters = [thisYear("b_date"), regionFilter("b_region", ["west"])];

    it("keeps embed filters on the tab the link opens on and leaves the other tabs unchanged", () => {
        const resolved = resolveOverrideFiltersByTab(
            [tab("tab-A", savedA), tab("tab-B", savedB)],
            embedFilters,
            "tab-B",
            false,
        );

        expect(resolved["tab-B"]).toBe(embedFilters);
        expect(resolved["tab-A"]).toBeUndefined();
    });

    it("writes the embedded date and attribute filters onto the other tab's own filters", () => {
        const tabs = [tab("tab-A", savedA), tab("tab-B", savedB)];
        const resolved = resolveOverrideFiltersByTab(tabs, embedFilters, "tab-B", true);

        const mergedA = mergeDashboardOverrideFilters(savedA, resolved["tab-A"] ?? [], {});
        const mergedB = mergeDashboardOverrideFilters(savedB, resolved["tab-B"] ?? [], {});

        expect(mergedB.mergedFilters).toEqual([thisYear("b_date"), regionFilter("b_region", ["west"])]);
        // Tab A keeps its own identifiers, so its charts still receive the Region filter.
        expect(mergedA.mergedFilters).toEqual([
            thisYear(),
            regionFilter("a_region", ["west"]),
            productFilter("a_product", ["stored"]),
        ]);
    });

    it("keeps the other tab's common date identifier when that tab already has one", () => {
        const savedWithDate = [thisYear("a_date"), ...savedA];
        const resolved = resolveOverrideFiltersByTab(
            [tab("tab-A", savedWithDate), tab("tab-B", savedB)],
            embedFilters,
            "tab-B",
            true,
        );

        const merged = mergeDashboardOverrideFilters(savedWithDate, resolved["tab-A"] ?? [], {});

        expect(merged.mergedFilters[0]).toEqual(thisYear("a_date"));
        expect((merged.mergedFilters[1] as IDashboardAttributeFilter).attributeFilter.localIdentifier).toBe(
            "a_region",
        );
    });

    it("does not copy a text filter onto a list filter", () => {
        const textOverride: FilterContextItem = {
            matchAttributeFilter: {
                displayForm: region,
                operator: "contains",
                literal: "west",
                negativeSelection: false,
                localIdentifier: "b_region",
            },
        };
        const resolved = resolveOverrideFiltersByTab(
            [
                tab("tab-A", [regionFilter("a_region", ["east"])]),
                tab("tab-B", [regionFilter("b_region", ["east"])]),
            ],
            [textOverride],
            "tab-B",
            true,
        );

        expect(resolved["tab-A"]).toEqual([]);
    });

    describe("display form reference form", () => {
        const regionId = idRef("region", "displayForm");
        const regionUri = uriRef("/region");
        const regionLabel = {
            type: "displayForm",
            id: "region",
            uri: "/region",
            ref: regionId,
        } as IAttributeDisplayFormMetadataObject;
        const attributes = [
            {
                attribute: {
                    ref: idRef("region.attr", "attribute"),
                    displayForms: [regionLabel],
                },
            },
        ] as IAttributeWithReferences[];
        const directions = [
            ["identifier source and uri target", regionId, regionUri],
            ["uri source and identifier target", regionUri, regionId],
        ] as const;

        function listFilter(localIdentifier: string, displayForm: ObjRef, uris: string[]): FilterContextItem {
            return {
                attributeFilter: {
                    displayForm,
                    attributeElements: { uris },
                    negativeSelection: false,
                    localIdentifier,
                    selectionMode: "multi",
                },
            };
        }

        function matchFilter(
            localIdentifier: string,
            displayForm: ObjRef,
            literal: string,
        ): FilterContextItem {
            return {
                matchAttributeFilter: {
                    displayForm,
                    operator: "contains",
                    literal,
                    negativeSelection: false,
                    localIdentifier,
                },
            };
        }

        function arbitraryFilter(
            localIdentifier: string,
            displayForm: ObjRef,
            values: string[],
        ): FilterContextItem {
            return {
                arbitraryAttributeFilter: {
                    displayForm,
                    values,
                    negativeSelection: false,
                    localIdentifier,
                },
            };
        }

        // Filters are the same filter only when they show the same label by the same reference.
        // A display form referenced by identifier on one tab and by uri on the other is another
        // label, so the override stays on its own tab and the other tab keeps its saved value.
        it.each(directions)(
            "does not mirror a list filter onto a display form in another reference form (%s)",
            (_label, sourceForm, targetForm) => {
                const saved = [listFilter("a_region", targetForm, ["east"])];
                const resolved = resolveOverrideFiltersByTab(
                    [tab("tab-A", saved), tab("tab-B", [listFilter("b_region", sourceForm, ["east"])])],
                    [listFilter("b_region", sourceForm, ["west"])],
                    "tab-B",
                    true,
                    attributes,
                );

                expect(resolved["tab-A"]).toEqual([]);

                const merged = mergeDashboardOverrideFilters(saved, resolved["tab-A"] ?? [], {});

                expect(merged.mergedFilters).toEqual(saved);
            },
        );

        it.each(directions)(
            "does not mirror a match filter onto a display form in another reference form (%s)",
            (_label, sourceForm, targetForm) => {
                const saved = [matchFilter("a_region", targetForm, "east")];
                const resolved = resolveOverrideFiltersByTab(
                    [tab("tab-A", saved), tab("tab-B", [matchFilter("b_region", sourceForm, "east")])],
                    [matchFilter("b_region", sourceForm, "west")],
                    "tab-B",
                    true,
                    attributes,
                );

                expect(resolved["tab-A"]).toEqual([]);

                const merged = mergeDashboardOverrideFilters(saved, resolved["tab-A"] ?? [], {});

                expect(merged.mergedFilters).toEqual(saved);
            },
        );

        it.each(directions)(
            "does not mirror an arbitrary filter onto a display form in another reference form (%s)",
            (_label, sourceForm, targetForm) => {
                const saved = [arbitraryFilter("a_region", targetForm, ["east"])];
                const resolved = resolveOverrideFiltersByTab(
                    [tab("tab-A", saved), tab("tab-B", [arbitraryFilter("b_region", sourceForm, ["east"])])],
                    [arbitraryFilter("b_region", sourceForm, ["west"])],
                    "tab-B",
                    true,
                    attributes,
                );

                expect(resolved["tab-A"]).toEqual([]);

                const merged = mergeDashboardOverrideFilters(saved, resolved["tab-A"] ?? [], {});

                expect(merged.mergedFilters).toEqual(saved);
            },
        );
    });
});

describe("mergeDashboardOverrideFilters", () => {
    it("applies a common date override when the saved filter is all time", () => {
        const saved = [regionFilter("b_region", [])];
        const overrides = [thisYear(), regionFilter("b_region", ["west"])];

        const merged = mergeDashboardOverrideFilters(saved, overrides, {});

        expect(merged.mergedFilters).toEqual([thisYear(), regionFilter("b_region", ["west"])]);
    });

    it("keeps the saved common date identifier when the override uses another one", () => {
        const saved = [thisYear("saved_date"), regionFilter("b_region", [])];
        const overrides = [thisYear("embed_date"), regionFilter("b_region", ["west"])];

        const merged = mergeDashboardOverrideFilters(saved, overrides, {});

        expect(merged.mergedFilters[0]).toEqual(thisYear("saved_date"));
    });

    it("does not apply a common date override to a hidden date filter", () => {
        const lastYear: IDashboardDateFilter = {
            dateFilter: {
                type: "relative",
                granularity: "GDC.time.year",
                from: -1,
                to: -1,
                localIdentifier: "saved_date",
            },
        };
        const merged = mergeDashboardOverrideFilters([lastYear], [thisYear("embed_date")], {
            dateFilterConfig: { filterName: "Date range", mode: "hidden" },
        });

        expect(merged.mergedFilters).toEqual([lastYear]);
    });
});
