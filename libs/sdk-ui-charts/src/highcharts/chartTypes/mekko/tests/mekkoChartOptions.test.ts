// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IMeasureDescriptor, type IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade, VisualizationTypes } from "@gooddata/sdk-ui";

import { type IUnwrappedAttributeHeadersWithItems } from "../../../typings/mess.js";
import { type ISeriesItem } from "../../../typings/unsafe.js";
import {
    collapseMekkoViewByItems,
    dropZeroWidthMekkoColumns,
    getMekkoEffectiveConfig,
    getMekkoMeasures,
    getMekkoWidthOnlyYAxisProps,
    isMekkoPercentBlockedByNegatives,
} from "../mekkoChartOptions.js";

const series = (points: Array<{ y?: number; z?: number }>): ISeriesItem =>
    ({ data: points }) as unknown as ISeriesItem;

const dvWithEmptyBuckets = (emptyBuckets: string[]): DataViewFacade =>
    ({
        def: () => ({ isBucketEmpty: (localId: string) => emptyBuckets.includes(localId) }),
    }) as unknown as DataViewFacade;

const measureGroup = (...names: string[]): IMeasureGroupDescriptor["measureGroupHeader"] =>
    ({
        items: names.map(
            (name, index) =>
                ({ measureHeaderItem: { localIdentifier: `m${index}`, name } }) as IMeasureDescriptor,
        ),
    }) as IMeasureGroupDescriptor["measureGroupHeader"];

describe("getMekkoMeasures", () => {
    it("assigns Width to the first and Height to the last item with two measures", () => {
        const { width, height } = getMekkoMeasures(dvWithEmptyBuckets([]), measureGroup("Width", "Height"));
        expect(width?.measureHeaderItem.name).toBe("Width");
        expect(height?.measureHeaderItem.name).toBe("Height");
    });

    it("assigns a lone measure by its bucket", () => {
        const widthOnly = getMekkoMeasures(
            dvWithEmptyBuckets([BucketNames.SECONDARY_MEASURES]),
            measureGroup("Width"),
        );
        expect(widthOnly.width?.measureHeaderItem.name).toBe("Width");
        expect(widthOnly.height).toBeUndefined();

        const heightOnly = getMekkoMeasures(
            dvWithEmptyBuckets([BucketNames.MEASURES]),
            measureGroup("Height"),
        );
        expect(heightOnly.width).toBeUndefined();
        expect(heightOnly.height?.measureHeaderItem.name).toBe("Height");
    });

    it("keeps the height-only treatment for a lone measure without bucket information", () => {
        const { width, height } = getMekkoMeasures(
            dvWithEmptyBuckets([BucketNames.MEASURES, BucketNames.SECONDARY_MEASURES]),
            measureGroup("Solo"),
        );
        expect(width).toBeUndefined();
        expect(height?.measureHeaderItem.name).toBe("Solo");
    });

    it("returns no measures for an empty measure group", () => {
        expect(getMekkoMeasures(dvWithEmptyBuckets([BucketNames.MEASURES]), measureGroup())).toEqual({
            height: undefined,
        });
    });
});

describe("getMekkoEffectiveConfig", () => {
    it("passes non-mekko config through unchanged", () => {
        const config = { type: VisualizationTypes.COLUMN, stackMeasuresToPercent: true };
        expect(getMekkoEffectiveConfig(config, dvWithEmptyBuckets([BucketNames.STACK]))).toBe(config);
    });

    it("drops stale stackMeasures* without a Stack By bucket", () => {
        const config = {
            type: VisualizationTypes.MEKKO,
            stackMeasures: true,
            stackMeasuresToPercent: true,
        };
        expect(getMekkoEffectiveConfig(config, dvWithEmptyBuckets([BucketNames.STACK]))).toMatchObject({
            stackMeasures: false,
            stackMeasuresToPercent: false,
        });
    });

    it("locks 100% stacking for width-only with Stack By", () => {
        const config = { type: VisualizationTypes.MEKKO };
        expect(
            getMekkoEffectiveConfig(config, dvWithEmptyBuckets([BucketNames.SECONDARY_MEASURES])),
        ).toMatchObject({ stackMeasuresToPercent: true });
    });

    it("keeps the user's stacking choice with both measures and Stack By", () => {
        const config = { type: VisualizationTypes.MEKKO, stackMeasuresToPercent: false };
        expect(getMekkoEffectiveConfig(config, dvWithEmptyBuckets([]))).toBe(config);
    });
});

describe("getMekkoWidthOnlyYAxisProps", () => {
    it("pins and hides the axis in the width-only non-stacked state, overriding saved controls", () => {
        expect(getMekkoWidthOnlyYAxisProps(true, false, { visible: true, min: "5" })).toEqual({
            min: "0",
            max: "1",
            visible: false,
        });
    });

    it("keeps saved axis props otherwise", () => {
        const yAxisProps = { min: "5" };
        expect(getMekkoWidthOnlyYAxisProps(true, true, yAxisProps)).toBe(yAxisProps);
        expect(getMekkoWidthOnlyYAxisProps(false, false, yAxisProps)).toBe(yAxisProps);
    });
});

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
