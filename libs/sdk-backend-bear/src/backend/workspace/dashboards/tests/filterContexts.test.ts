// (C) 2021-2022 GoodData Corporation
import {
    idRef,
    isIdentifierRef,
    ObjRef,
    uriRef,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardAttributeFilterParent,
    IDashboardDateFilter,
    IFilterContext,
} from "@gooddata/sdk-model";

import { sanitizeFilterContext } from "../filterContexts";

describe("sanitizeFilterContext", () => {
    function getFilterContext(filters: FilterContextItem[]): IFilterContext {
        return {
            description: "",
            filters,
            identifier: "some-id",
            ref: idRef("some-id"),
            title: "",
            uri: "/gdc/md/some-id",
        };
    }

    function getDateFilter(dataSet?: ObjRef): IDashboardDateFilter {
        return {
            dateFilter: {
                granularity: "GDC.time.date",
                type: "relative",
                from: -5,
                to: 5,
                dataSet,
            },
        };
    }

    function getAttributeFilter(
        displayForm: ObjRef,
        filterElementsBy: IDashboardAttributeFilterParent[] = [],
    ): IDashboardAttributeFilter {
        return {
            attributeFilter: {
                attributeElements: { uris: [] },
                displayForm,
                negativeSelection: false,
                filterElementsBy,
            },
        };
    }

    const objRefsToUrisMock: Parameters<typeof sanitizeFilterContext>[1] = (refs) =>
        Promise.resolve(refs.map((ref) => (isIdentifierRef(ref) ? `/gdc/md/${ref.identifier}` : ref.uri)));

    it("should return the original filter context if it has no filters", async () => {
        const input = getFilterContext([]);
        const expected = input;
        const actual = await sanitizeFilterContext(input, objRefsToUrisMock);

        expect(actual).toEqual(expected);
    });

    it("should handle date filter without dateDataset specified", async () => {
        const input = getFilterContext([getDateFilter()]);
        const expected = input;
        const actual = await sanitizeFilterContext(input, objRefsToUrisMock);

        expect(actual).toEqual(expected);
    });

    it("should handle date filter with dateDataset specified using uriRef", async () => {
        const input = getFilterContext([getDateFilter(uriRef("some-uri"))]);
        const expected = input;
        const actual = await sanitizeFilterContext(input, objRefsToUrisMock);

        expect(actual).toEqual(expected);
    });

    it("should handle date filter with dateDataset specified using idRef", async () => {
        const input = getFilterContext([getDateFilter(idRef("some-id"))]);
        const expected = getFilterContext([getDateFilter(uriRef("/gdc/md/some-id"))]);
        const actual = await sanitizeFilterContext(input, objRefsToUrisMock);

        expect(actual).toEqual(expected);
    });

    it("should handle attribute filter with uriRef", async () => {
        const input = getFilterContext([getAttributeFilter(uriRef("some-uri"))]);
        const expected = input;
        const actual = await sanitizeFilterContext(input, objRefsToUrisMock);

        expect(actual).toEqual(expected);
    });

    it("should handle attribute filter with idRef", async () => {
        const input = getFilterContext([getAttributeFilter(idRef("some-id"))]);
        const expected = getFilterContext([getAttributeFilter(uriRef("/gdc/md/some-id"))]);
        const actual = await sanitizeFilterContext(input, objRefsToUrisMock);

        expect(actual).toEqual(expected);
    });

    it("should handle attribute filter with filterElementsBy with idRefs in it", async () => {
        const input = getFilterContext([
            getAttributeFilter(uriRef("/gdc/md/some-id"), [
                {
                    filterLocalIdentifier: "aaa",
                    over: { attributes: [idRef("over-id")] },
                },
            ]),
        ]);
        const expected = getFilterContext([
            getAttributeFilter(uriRef("/gdc/md/some-id"), [
                {
                    filterLocalIdentifier: "aaa",
                    over: { attributes: [uriRef("/gdc/md/over-id")] },
                },
            ]),
        ]);
        const actual = await sanitizeFilterContext(input, objRefsToUrisMock);

        expect(actual).toEqual(expected);
    });

    // tests that the logic can handle different number of filters and resolved uris
    it("should handle date filter with no dataSet followed by attribute filter with idRef", async () => {
        const input = getFilterContext([getDateFilter(), getAttributeFilter(idRef("some-id"))]);
        const expected = getFilterContext([getDateFilter(), getAttributeFilter(uriRef("/gdc/md/some-id"))]);
        const actual = await sanitizeFilterContext(input, objRefsToUrisMock);

        expect(actual).toEqual(expected);
    });
});
