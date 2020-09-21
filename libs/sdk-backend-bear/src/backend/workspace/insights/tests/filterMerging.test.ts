// (C) 2020 GoodData Corporation
import { appendFilters } from "../filterMerging";
import {
    isIdentifierRef,
    newPositiveAttributeFilter,
    newMeasureValueFilter,
    newAbsoluteDateFilter,
    IFilter,
    newAllTimeFilter,
    uriRef,
    newRankingFilter,
} from "@gooddata/sdk-model";

describe("appendFilters", () => {
    const uriResolver: Parameters<typeof appendFilters>[2] = (refs) =>
        Promise.resolve(refs.map((ref) => (isIdentifierRef(ref) ? `/gdc/md/${ref.identifier}` : ref.uri)));

    it("should append attribute filters", async () => {
        const insightFilters = [newPositiveAttributeFilter("foo", ["bar"])];
        const addedFilters = [newPositiveAttributeFilter("baz", ["other"])];

        const actual = await appendFilters(insightFilters, addedFilters, uriResolver);

        expect(actual).toEqual([...insightFilters, ...addedFilters]);
    });

    it("should append measure value filters", async () => {
        const insightFilters = [newMeasureValueFilter("foo", "EQUAL_TO", 42)];
        const addedFilters = [newMeasureValueFilter("bar", "BETWEEN", 0, 100)];

        const actual = await appendFilters(insightFilters, addedFilters, uriResolver);

        expect(actual).toEqual([...insightFilters, ...addedFilters]);
    });

    it("should append ranking filters", async () => {
        const insightFilters = [newRankingFilter("foo", "TOP", 3)];
        const addedFilters = [newRankingFilter("bar", "BOTTOM", 10)];

        const actual = await appendFilters(insightFilters, addedFilters, uriResolver);

        expect(actual).toEqual([...insightFilters, ...addedFilters]);
    });

    it("should append date filters from different dimensions", async () => {
        const insightFilters = [newAbsoluteDateFilter("foo", "2020-01-01", "2020-12-31")];
        const addedFilters = [newAbsoluteDateFilter("bar", "2020-01-01", "2020-12-31")];

        const actual = await appendFilters(insightFilters, addedFilters, uriResolver);

        expect(actual).toEqual([...insightFilters, ...addedFilters]);
    });

    it("should use added date filter if the added filter has same dimension and is NOT all time", async () => {
        const insightFilters = [newAbsoluteDateFilter("foo", "2020-01-01", "2020-12-31")];
        const addedFilters = [newAbsoluteDateFilter("foo", "2010-01-01", "2010-12-31")];

        const actual = await appendFilters(insightFilters, addedFilters, uriResolver);

        expect(actual).toEqual(addedFilters);
    });

    it("should use added date filter if the added filter has same dimension and is NOT all time using different ObjRef type", async () => {
        const insightFilters = [newAbsoluteDateFilter("foo", "2020-01-01", "2020-12-31")];
        const addedFilters = [newAbsoluteDateFilter(uriRef("/gdc/md/foo"), "2010-01-01", "2010-12-31")];

        const actual = await appendFilters(insightFilters, addedFilters, uriResolver);

        expect(actual).toEqual(addedFilters);
    });

    it("should remove date filter if the added filter has same dimension and is all time", async () => {
        const insightFilters = [newAbsoluteDateFilter("foo", "2020-01-01", "2020-12-31")];
        const addedFilters: IFilter[] = [newAllTimeFilter("foo")];

        const actual = await appendFilters(insightFilters, addedFilters, uriResolver);

        expect(actual).toEqual([]);
    });

    it("should remove date filter if the added filter has same dimension and is all time using different ObjRef type", async () => {
        const insightFilters = [newAbsoluteDateFilter("foo", "2020-01-01", "2020-12-31")];
        const addedFilters: IFilter[] = [newAllTimeFilter(uriRef("/gdc/md/foo"))];

        const actual = await appendFilters(insightFilters, addedFilters, uriResolver);

        expect(actual).toEqual([]);
    });
});
