// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade, VisualizationTypes } from "@gooddata/sdk-ui";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";

import { getYAxes } from "./chartAxes.js";

interface IMeasureSpec {
    localIdentifier: string;
    name: string;
    format?: string;
}

function buildMeasureGroup(measures: IMeasureSpec[]): IMeasureGroupDescriptor["measureGroupHeader"] {
    return {
        items: measures.map((measure) => ({
            measureHeaderItem: {
                localIdentifier: measure.localIdentifier,
                name: measure.name,
                format: measure.format ?? "#,##0.00",
            },
        })),
    } as IMeasureGroupDescriptor["measureGroupHeader"];
}

// dv is only consulted by the scatter/bubble branch, which these line-chart cases never reach.
const dv = {} as DataViewFacade;

const getLineChartYAxisLabel = (
    measures: IMeasureSpec[],
    configOverrides: Partial<IChartConfig> = {},
): string => {
    const config = { type: VisualizationTypes.LINE, ...configOverrides } as IChartConfig;
    const [yAxis] = getYAxes(dv, config, buildMeasureGroup(measures), undefined);
    return yAxis.label;
};

const REVENUE: IMeasureSpec = { localIdentifier: "revenue", name: "Revenue" };
const TARGET: IMeasureSpec = { localIdentifier: "target", name: "Target" };
const COSTS: IMeasureSpec = { localIdentifier: "costs", name: "Costs" };

describe("getYAxes default (single-axis) Y axis title", () => {
    it("shows the measure name for a single measure", () => {
        expect(getLineChartYAxisLabel([REVENUE])).toBe("Revenue");
    });

    it("prefers an explicit yLabel override over the measure name", () => {
        expect(getLineChartYAxisLabel([REVENUE], { yLabel: "Custom title" })).toBe("Custom title");
    });

    it("hides the title when multiple regular measures are plotted", () => {
        expect(getLineChartYAxisLabel([REVENUE, COSTS])).toBe("");
    });

    describe("with a control (threshold) measure", () => {
        const enabled = { thresholdMeasures: [TARGET.localIdentifier] };

        it("shows the single regular measure's title, ignoring the control measure", () => {
            expect(getLineChartYAxisLabel([REVENUE, TARGET], enabled)).toBe("Revenue");
        });

        it("picks the regular measure regardless of its position in the bucket", () => {
            expect(getLineChartYAxisLabel([TARGET, REVENUE], enabled)).toBe("Revenue");
        });

        it("shows the title when only one regular measure remains among several control measures", () => {
            expect(
                getLineChartYAxisLabel([REVENUE, TARGET, COSTS], {
                    thresholdMeasures: [TARGET.localIdentifier, COSTS.localIdentifier],
                }),
            ).toBe("Revenue");
        });

        it("still respects the yLabel override", () => {
            expect(getLineChartYAxisLabel([REVENUE, TARGET], { ...enabled, yLabel: "Custom title" })).toBe(
                "Custom title",
            );
        });

        it("hides the title when more than one regular measure remains", () => {
            expect(getLineChartYAxisLabel([REVENUE, COSTS, TARGET], enabled)).toBe("");
        });

        it("keeps threshold-excluded measures counted as regular measures", () => {
            // COSTS opts out of threshold styling, so it still renders as a normal line and must keep
            // counting - with two regular measures plotted the title stays hidden.
            expect(
                getLineChartYAxisLabel([REVENUE, COSTS, TARGET], {
                    thresholdMeasures: [TARGET.localIdentifier],
                    thresholdExcludedMeasures: [COSTS.localIdentifier],
                }),
            ).toBe("");
        });

        it("also applies to combo charts", () => {
            const config = { type: VisualizationTypes.COMBO, ...enabled } as IChartConfig;
            const [yAxis] = getYAxes(dv, config, buildMeasureGroup([REVENUE, TARGET]), undefined);
            expect(yAxis.label).toBe("Revenue");
        });

        it("does not exclude the control measure for non-line/combo chart types", () => {
            const config = {
                type: VisualizationTypes.COLUMN,
                ...enabled,
            } as IChartConfig;
            const [yAxis] = getYAxes(dv, config, buildMeasureGroup([REVENUE, TARGET]), undefined);
            expect(yAxis.label).toBe("");
        });
    });
});

describe("getYAxes for Mekko", () => {
    const WIDTH: IMeasureSpec = { localIdentifier: "width", name: "Width", format: "#,##0" };
    const HEIGHT: IMeasureSpec = { localIdentifier: "height", name: "Height", format: "$#,##0" };
    const config = { type: VisualizationTypes.MEKKO } as IChartConfig;

    const dvWithEmptyBuckets = (emptyBuckets: string[]): DataViewFacade =>
        ({
            def: () => ({ isBucketEmpty: (localId: string) => emptyBuckets.includes(localId) }),
        }) as unknown as DataViewFacade;

    it("labels and formats the Y axis by the Height measure when both measures are present", () => {
        const [yAxis] = getYAxes(dvWithEmptyBuckets([]), config, buildMeasureGroup([WIDTH, HEIGHT]), null);
        expect(yAxis).toMatchObject({ label: "Height", format: "$#,##0" });
    });

    it("labels the Y axis by a lone Height measure", () => {
        const [yAxis] = getYAxes(
            dvWithEmptyBuckets([BucketNames.MEASURES]),
            config,
            buildMeasureGroup([HEIGHT]),
            null,
        );
        expect(yAxis).toMatchObject({ label: "Height", format: "$#,##0" });
    });

    it("keeps the Y axis unlabeled with a lone Width measure (fallback height only)", () => {
        const [yAxis] = getYAxes(
            dvWithEmptyBuckets([BucketNames.SECONDARY_MEASURES]),
            config,
            buildMeasureGroup([WIDTH]),
            null,
        );
        expect(yAxis).toMatchObject({ label: "", format: undefined });
    });

    it("prefers the explicit yLabel override", () => {
        const [yAxis] = getYAxes(
            dvWithEmptyBuckets([]),
            { ...config, yLabel: "Custom title" } as IChartConfig,
            buildMeasureGroup([WIDTH, HEIGHT]),
            null,
        );
        expect(yAxis.label).toBe("Custom title");
    });

    it("does not throw on an empty measure group (no metrics yet)", () => {
        const [yAxis] = getYAxes(
            dvWithEmptyBuckets([BucketNames.MEASURES, BucketNames.SECONDARY_MEASURES]),
            config,
            buildMeasureGroup([]),
            null,
        );
        expect(yAxis).toMatchObject({ label: "", format: undefined });
    });
});
