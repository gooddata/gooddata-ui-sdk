// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, idRef, uriRef } from "@gooddata/sdk-model";

import {
    getRestrictedDashboardFilters,
    isDashboardFilterCopyRestricted,
    isDashboardFilterUsingRestrictedObject,
    isDashboardObjectRestricted,
} from "./restrictedFilterUtils.js";

const labelRef = idRef("label", "displayForm");
const dataSetRef = idRef("dataset", "dataSet");
const measureRef = idRef("measure", "measure");
const computedAttributeRef = idRef("tier", "computedAttribute");

const forbidden = (
    ref: IUnavailableDashboardReference["ref"],
    type: IUnavailableDashboardReference["type"],
): IUnavailableDashboardReference[] => [{ ref, type, reason: "forbidden" }];

const asFilter = (filter: unknown) => filter as FilterContextItem;
const attributeFilter = asFilter({ attributeFilter: { displayForm: labelRef, localIdentifier: "a" } });
const computedAttributeFilter = asFilter({
    attributeFilter: { displayForm: computedAttributeRef, localIdentifier: "ca" },
});
const dateFilter = asFilter({ dateFilter: { type: "relative", dataSet: dataSetRef, localIdentifier: "d" } });
const measureValueFilter = asFilter({
    dashboardMeasureValueFilter: { measure: measureRef, localIdentifier: "m" },
});
const attributeRef = idRef("attribute", "attribute");
const measureValueFilterForAttributes = (dimensionality: unknown[]) =>
    asFilter({ dashboardMeasureValueFilter: { measure: measureRef, localIdentifier: "m", dimensionality } });
const commonDateFilter = asFilter({ dateFilter: { type: "relative", localIdentifier: "common" } });
const factRef = idRef("fact", "fact");
const limitedFilter = (validateElementsBy: unknown[]) =>
    asFilter({
        attributeFilter: {
            displayForm: idRef("other", "displayForm"),
            localIdentifier: "l",
            validateElementsBy,
        },
    });

const readableLabel = idRef("readable", "displayForm");
const chainFilter = (localIdentifier: string, displayForm: unknown, parents: string[] = []) =>
    asFilter({
        attributeFilter: {
            displayForm,
            localIdentifier,
            filterElementsBy: parents.map((filterLocalIdentifier) => ({
                filterLocalIdentifier,
                over: { attributes: [] },
            })),
        },
    });
const restrictedLocalIdentifiers = (
    filters: FilterContextItem[],
    unavailableObjects: IUnavailableDashboardReference[],
) =>
    getRestrictedDashboardFilters(filters, unavailableObjects).map(
        (filter) =>
            (filter as { attributeFilter: { localIdentifier: string } }).attributeFilter.localIdentifier,
    );

describe("isDashboardObjectRestricted", () => {
    it("matches only a forbidden object of the same type and ref", () => {
        expect(isDashboardObjectRestricted(labelRef, "displayForm", forbidden(labelRef, "displayForm"))).toBe(
            true,
        );
        expect(isDashboardObjectRestricted(labelRef, "dataSet", forbidden(labelRef, "displayForm"))).toBe(
            false,
        );
        expect(
            isDashboardObjectRestricted(labelRef, "displayForm", forbidden(dataSetRef, "displayForm")),
        ).toBe(false);
        expect(
            isDashboardObjectRestricted(labelRef, "displayForm", [
                { ref: labelRef, type: "displayForm", reason: "notFound" },
            ]),
        ).toBe(false);
    });
});

describe("isDashboardFilterUsingRestrictedObject", () => {
    it("resolves every filter type against the object it filters by", () => {
        expect(
            isDashboardFilterUsingRestrictedObject(attributeFilter, forbidden(labelRef, "displayForm")),
        ).toBe(true);
        expect(
            isDashboardFilterUsingRestrictedObject(attributeFilter, forbidden(dataSetRef, "dataSet")),
        ).toBe(false);
        expect(
            isDashboardFilterUsingRestrictedObject(measureValueFilter, forbidden(measureRef, "measure")),
        ).toBe(true);
        expect(
            isDashboardFilterUsingRestrictedObject(
                computedAttributeFilter,
                forbidden(computedAttributeRef, "computedAttribute"),
            ),
        ).toBe(true);
    });

    it("treats a measure value filter as restricted when an item it is computed for is restricted", () => {
        const filter = measureValueFilterForAttributes([labelRef, attributeRef, computedAttributeRef]);

        expect(isDashboardFilterUsingRestrictedObject(filter, forbidden(labelRef, "displayForm"))).toBe(true);
        expect(isDashboardFilterUsingRestrictedObject(filter, forbidden(attributeRef, "attribute"))).toBe(
            true,
        );
        expect(
            isDashboardFilterUsingRestrictedObject(
                filter,
                forbidden(computedAttributeRef, "computedAttribute"),
            ),
        ).toBe(true);
        expect(isDashboardFilterUsingRestrictedObject(filter, forbidden(dataSetRef, "dataSet"))).toBe(false);
        expect(
            isDashboardFilterUsingRestrictedObject(filter, [
                { ref: attributeRef, type: "attribute", reason: "notFound" },
            ]),
        ).toBe(false);
    });

    it("treats an attribute filter as restricted when an item limiting its values is restricted", () => {
        const filter = limitedFilter([measureRef, factRef, attributeRef]);

        expect(isDashboardFilterUsingRestrictedObject(filter, forbidden(measureRef, "measure"))).toBe(true);
        expect(isDashboardFilterUsingRestrictedObject(filter, forbidden(factRef, "fact"))).toBe(true);
        // "Count of" an attribute
        expect(isDashboardFilterUsingRestrictedObject(filter, forbidden(attributeRef, "attribute"))).toBe(
            true,
        );
        expect(isDashboardFilterUsingRestrictedObject(filter, forbidden(labelRef, "displayForm"))).toBe(
            false,
        );
    });

    it("matches configuration items of every ref shape", () => {
        const untypedAttributeRef = { identifier: "attribute" };
        const attributeUriRef = uriRef("/objects/attribute");

        expect(
            isDashboardFilterUsingRestrictedObject(
                measureValueFilterForAttributes([untypedAttributeRef]),
                forbidden(attributeRef, "attribute"),
            ),
        ).toBe(true);
        expect(
            isDashboardFilterUsingRestrictedObject(
                limitedFilter([attributeUriRef]),
                forbidden(attributeUriRef, "attribute"),
            ),
        ).toBe(true);
        // a typed ref still has to agree on the type of the forbidden object
        expect(
            isDashboardFilterUsingRestrictedObject(
                limitedFilter([idRef("attribute", "fact")]),
                forbidden(untypedAttributeRef, "attribute"),
            ),
        ).toBe(false);
    });

    it("treats date filters as unrestricted, the backend never restricts a date dataset", () => {
        expect(isDashboardFilterUsingRestrictedObject(dateFilter, forbidden(dataSetRef, "dataSet"))).toBe(
            false,
        );
        expect(
            isDashboardFilterUsingRestrictedObject(commonDateFilter, forbidden(dataSetRef, "dataSet")),
        ).toBe(false);
    });
});

describe("getRestrictedDashboardFilters", () => {
    // A -> B -> C: B is a child of A, C a child of B
    const chain = (labelA: unknown, labelB: unknown, labelC: unknown) => [
        chainFilter("A", labelA),
        chainFilter("B", labelB, ["A"]),
        chainFilter("C", labelC, ["B"]),
    ];
    const restrictedLabel = forbidden(labelRef, "displayForm");

    it("restricts the children of a restricted filter, transitively", () => {
        expect(
            restrictedLocalIdentifiers(chain(labelRef, readableLabel, readableLabel), restrictedLabel),
        ).toEqual(["A", "B", "C"]);
    });

    it("never restricts a parent of a restricted filter", () => {
        expect(
            restrictedLocalIdentifiers(chain(readableLabel, labelRef, readableLabel), restrictedLabel),
        ).toEqual(["B", "C"]);
        expect(
            restrictedLocalIdentifiers(chain(readableLabel, readableLabel, labelRef), restrictedLabel),
        ).toEqual(["C"]);
    });

    it("restricts a child of any of its restricted parents", () => {
        const filters = [
            chainFilter("A", labelRef),
            chainFilter("B", readableLabel),
            chainFilter("C", readableLabel, ["B", "A"]),
        ];

        expect(restrictedLocalIdentifiers(filters, restrictedLabel)).toEqual(["A", "C"]);
    });

    it("ends on parent links that form a cycle", () => {
        const filters = [
            chainFilter("A", readableLabel, ["C"]),
            chainFilter("B", labelRef, ["A"]),
            chainFilter("C", readableLabel, ["B"]),
            chainFilter("D", readableLabel),
        ];

        expect(restrictedLocalIdentifiers(filters, restrictedLabel)).toEqual(["A", "B", "C"]);
        expect(restrictedLocalIdentifiers(filters, [])).toEqual([]);
    });
});

describe("isDashboardFilterCopyRestricted", () => {
    it("matches a copy by the restricted local identifier or by the object it uses", () => {
        const child = chainFilter("B", readableLabel, ["A"]);

        expect(isDashboardFilterCopyRestricted(child, new Set(["B"]), [])).toBe(true);
        // the copy keeps a link to a restricted parent the dashboard may have dropped since
        expect(isDashboardFilterCopyRestricted(child, new Set(["A"]), [])).toBe(true);
        expect(isDashboardFilterCopyRestricted(child, new Set(["X"]), [])).toBe(false);
        expect(
            isDashboardFilterCopyRestricted(attributeFilter, new Set(), forbidden(labelRef, "displayForm")),
        ).toBe(true);
    });
});
