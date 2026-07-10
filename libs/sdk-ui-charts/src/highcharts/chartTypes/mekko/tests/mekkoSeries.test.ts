// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DataValue, type IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";
import { type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { type IUnwrappedAttributeHeadersWithItems } from "../../../typings/mess.js";
import { getMekkoSeries } from "../mekkoSeries.js";

const dvWith = (data: DataValue[][]): DataViewFacade =>
    ({ rawData: () => ({ twoDimData: () => data }) }) as unknown as DataViewFacade;

const measureGroup = (
    ...measures: [name: string, format: string][]
): IMeasureGroupDescriptor["measureGroupHeader"] =>
    ({
        items: measures.map(([name, format], index) => ({
            measureHeaderItem: { localIdentifier: `m${index}`, name, format },
        })),
    }) as IMeasureGroupDescriptor["measureGroupHeader"];

const attribute = (...itemNames: string[]): IUnwrappedAttributeHeadersWithItems =>
    ({
        items: itemNames.map((name) => ({ attributeHeaderItem: { name, uri: `/${name}` } })),
    }) as unknown as IUnwrappedAttributeHeadersWithItems;

const colorStrategy = { getColorByIndex: (index: number) => `color-${index}` } as IColorStrategy;

// ISeriesItemConfig.data is loosely typed (IPointData with an index signature); give points a shape.
const points = (series: { data?: unknown }): Array<{ y?: number | null; z?: number }> =>
    (series.data ?? []) as Array<{ y?: number | null; z?: number }>;

const widthAndHeight = measureGroup(["Width", "#,##0"], ["Height", "$#,##0"]);

function getSeries(
    data: DataValue[][],
    mg: IMeasureGroupDescriptor["measureGroupHeader"],
    viewBy: IUnwrappedAttributeHeadersWithItems | null,
    stackBy: IUnwrappedAttributeHeadersWithItems | null,
) {
    return getMekkoSeries(dvWith(data), mg, viewBy, stackBy, colorStrategy, "(empty)", undefined, undefined);
}

describe("getMekkoSeries", () => {
    it("returns no series without measures or data", () => {
        expect(getSeries([], widthAndHeight, attribute("A"), null)).toEqual([]);
        expect(getSeries([["1"]], measureGroup(), attribute("A"), null)).toEqual([]);
    });

    describe("stacked (rows = stack segments, view-major measure-innermost cells)", () => {
        // Layout [[stackBy], [viewBy, MeasureGroup]]: MeasureGroup is the LAST header in its
        // dimension, so measures vary fastest: [v0_width, v0_height, v1_width, v1_height].
        const data: DataValue[][] = [
            ["10", "100", "20", "200"], // segment S1
            ["30", "300", "40", "400"], // segment S2
        ];

        it("reads Height from the second cell of each view column and sums Width across segments into a shared z", () => {
            const series = getSeries(data, widthAndHeight, attribute("A", "B"), attribute("S1", "S2"));

            expect(series).toEqual([
                {
                    name: "S1",
                    legendIndex: 0,
                    seriesIndex: 0,
                    color: "color-0",
                    data: [
                        { y: 100, z: 40, format: "$#,##0", name: "A" },
                        { y: 200, z: 60, format: "$#,##0", name: "B" },
                    ],
                },
                {
                    name: "S2",
                    legendIndex: 1,
                    seriesIndex: 1,
                    color: "color-1",
                    data: [
                        { y: 300, z: 40, format: "$#,##0", name: "A" },
                        { y: 400, z: 60, format: "$#,##0", name: "B" },
                    ],
                },
            ]);
        });

        it("treats a missing (null) Width cell as 0 in the column total", () => {
            const withNulls: DataValue[][] = [
                [null, "100", "20", "200"],
                ["30", "300", null, "400"],
            ];

            const series = getSeries(withNulls, widthAndHeight, attribute("A", "B"), attribute("S1", "S2"));

            expect(points(series[0]).map((p) => p.z)).toEqual([30, 20]);
            expect(points(series[1]).map((p) => p.z)).toEqual([30, 20]);
        });

        it("falls back to equal-width columns (z = 1) with a single (Height-only) measure", () => {
            const singleMeasureData: DataValue[][] = [
                ["100", "200"],
                ["300", "400"],
            ];

            const series = getSeries(
                singleMeasureData,
                measureGroup(["Height", "$#,##0"]),
                attribute("A", "B"),
                attribute("S1", "S2"),
            );

            expect(series[0].data).toEqual([
                { y: 100, z: 1, format: "$#,##0", name: "A" },
                { y: 200, z: 1, format: "$#,##0", name: "B" },
            ]);
        });
    });

    describe("non-stacked (rows = measures)", () => {
        it("builds one series with Width row as z and Height row as y", () => {
            // Layout [[MeasureGroup], [viewBy]]: row 0 = Width measure, row 1 = Height measure.
            const data: DataValue[][] = [
                ["10", "20"],
                ["100", "200"],
            ];

            const series = getSeries(data, widthAndHeight, attribute("A", "B"), null);

            expect(series).toEqual([
                {
                    name: "Height",
                    legendIndex: 0,
                    seriesIndex: 0,
                    color: "color-0",
                    data: [
                        { y: 100, z: 10, format: "$#,##0", name: "A" },
                        { y: 200, z: 20, format: "$#,##0", name: "B" },
                    ],
                },
            ]);
        });

        it("falls back to z = 1 with a single measure", () => {
            const series = getSeries(
                [["100", "200"]],
                measureGroup(["Height", "$#,##0"]),
                attribute("A", "B"),
                null,
            );

            expect(points(series[0]).map((p) => [p.y, p.z])).toEqual([
                [100, 1],
                [200, 1],
            ]);
        });
    });
});
