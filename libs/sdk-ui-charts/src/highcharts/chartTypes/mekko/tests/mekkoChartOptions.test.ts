// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DataViewFacade, VisualizationTypes } from "@gooddata/sdk-ui";

import { type IUnwrappedAttributeHeadersWithItems } from "../../../typings/mess.js";
import { type ISeriesItem } from "../../../typings/unsafe.js";
import {
    collapseMekkoViewByItems,
    dropZeroWidthMekkoColumns,
    isMekkoPercentBlockedByNegatives,
} from "../mekkoChartOptions.js";

const series = (points: Array<{ y?: number; z?: number }>): ISeriesItem =>
    ({ data: points }) as unknown as ISeriesItem;

describe("isMekkoPercentBlockedByNegatives", () => {
    it("is true for a Mekko whose series include a negative value", () => {
        expect(
            isMekkoPercentBlockedByNegatives(VisualizationTypes.MEKKO, [series([{ y: -1 }, { y: 5 }])]),
        ).toBe(true);
    });

    it("is false for a Mekko with only non-negative values", () => {
        expect(
            isMekkoPercentBlockedByNegatives(VisualizationTypes.MEKKO, [series([{ y: 1 }, { y: 5 }])]),
        ).toBe(false);
    });

    it("is false for non-Mekko chart types even with negative values", () => {
        expect(isMekkoPercentBlockedByNegatives(VisualizationTypes.COLUMN, [series([{ y: -1 }])])).toBe(
            false,
        );
    });

    it("is false for undefined type / series", () => {
        expect(isMekkoPercentBlockedByNegatives(undefined, undefined)).toBe(false);
    });
});

describe("dropZeroWidthMekkoColumns", () => {
    it("returns inputs unchanged when no column has zero width", () => {
        const input = [series([{ z: 2 }, { z: 3 }])];
        const categories = ["a", "b"];

        const result = dropZeroWidthMekkoColumns(input, categories);

        expect(result.series).toBe(input);
        expect(result.categories).toBe(categories);
    });

    it("drops zero-width columns from every series and the categories in lockstep", () => {
        const input = [series([{ z: 2 }, { z: 0 }, { z: 3 }]), series([{ z: 2 }, { z: 0 }, { z: 3 }])];
        const categories = ["a", "b", "c"];

        const result = dropZeroWidthMekkoColumns(input, categories);

        expect(result.categories).toEqual(["a", "c"]);
        expect(result.series.map((s) => s.data)).toEqual([
            [{ z: 2 }, { z: 3 }],
            [{ z: 2 }, { z: 3 }],
        ]);
    });

    it("keeps negative-width columns (only zero is dropped) so validateData can reject them", () => {
        const input = [series([{ z: -1 }, { z: 0 }])];
        const categories = ["neg", "zero"];

        const result = dropZeroWidthMekkoColumns(input, categories);

        expect(result.categories).toEqual(["neg"]);
        expect(result.series[0].data).toEqual([{ z: -1 }]);
    });

    it("returns inputs unchanged when the first series has no data", () => {
        const input = [series([])];
        const categories: string[] = [];

        const result = dropZeroWidthMekkoColumns(input, categories);

        expect(result.series).toBe(input);
        expect(result.categories).toBe(categories);
    });
});

describe("collapseMekkoViewByItems", () => {
    const viewBy = (...names: string[]): IUnwrappedAttributeHeadersWithItems =>
        ({
            localIdentifier: "view",
            items: names.map((name) => ({ attributeHeaderItem: { name, uri: `/${name}` } })),
        }) as unknown as IUnwrappedAttributeHeadersWithItems;

    const measureGroupDescriptor = (measureCount: number) => ({
        measureGroupHeader: {
            items: Array.from({ length: measureCount }, (_, index) => ({
                measureHeaderItem: { localIdentifier: `m${index}` },
            })),
        },
    });

    const attributeDescriptor = { attributeHeader: { localIdentifier: "view" } };

    const dvWithViewByDimensionHeaders = (headers: unknown[]): DataViewFacade =>
        ({
            meta: () => ({ dimensions: () => [{ headers: [] }, { headers }] }),
        }) as unknown as DataViewFacade;

    it("collapses view × measure interleaved items to one item per view value", () => {
        const dv = dvWithViewByDimensionHeaders([attributeDescriptor, measureGroupDescriptor(2)]);

        const result = collapseMekkoViewByItems(dv, viewBy("A", "A", "B", "B"));

        expect(result?.items.map((item) => item.attributeHeaderItem.name)).toEqual(["A", "B"]);
        expect(result?.localIdentifier).toBe("view");
    });

    it("returns items unchanged when the view-by dimension holds no measure group (non-stacked layout)", () => {
        const dv = dvWithViewByDimensionHeaders([attributeDescriptor]);
        const viewByAttribute = viewBy("A", "B");

        expect(collapseMekkoViewByItems(dv, viewByAttribute)).toBe(viewByAttribute);
    });

    it("returns items unchanged with a single measure (stride 1)", () => {
        const dv = dvWithViewByDimensionHeaders([attributeDescriptor, measureGroupDescriptor(1)]);
        const viewByAttribute = viewBy("A", "B");

        expect(collapseMekkoViewByItems(dv, viewByAttribute)).toBe(viewByAttribute);
    });

    it("passes through an undefined view-by attribute", () => {
        const dv = dvWithViewByDimensionHeaders([measureGroupDescriptor(2)]);

        expect(collapseMekkoViewByItems(dv, undefined)).toBeUndefined();
    });
});
