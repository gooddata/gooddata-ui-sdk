// (C) 2023-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";

import { recordedDataFacade } from "../../../../../testUtils/recordings.js";
import { type IChartConfig } from "../../../../interfaces/chartConfig.js";
import { type IUnwrappedAttributeHeadersWithItems } from "../../../typings/mess.js";
import { type IAxis, type IUnsafeHighchartsTooltipPoint } from "../../../typings/unsafe.js";
import { getMVS } from "../../_util/test/helper.js";
import {
    generateDescriptionHeatmapFn,
    generateDescriptionScatterPlotFn,
    generateDescriptionTreemapFn,
    generateDescriptionXYFn,
    getTooltipWaterfallChart,
} from "../chartTooltips.js";

function attribute(name: string): IUnwrappedAttributeHeadersWithItems {
    return { formOf: { name } } as unknown as IUnwrappedAttributeHeadersWithItems;
}

function axis(label: string, format?: string): IAxis {
    return { label, format };
}

interface IMockDescriptionPoint {
    name?: string;
    x?: number;
    y?: number;
    z?: number;
    value?: number | null;
    format?: string;
    parent?: string;
    segmentName?: string;
    category?: string | { name?: string; parent?: { name?: string } };
    series?: {
        name?: string;
        xAxis?: { axisTitle?: { textStr?: string } };
        points?: Array<{ id?: string; name?: string }>;
    };
}

function point(mock: IMockDescriptionPoint): IMockDescriptionPoint {
    return mock;
}

describe("chartTooltips", () => {
    describe("getTooltipWaterfallChart", () => {
        const chartConfig: Partial<IChartConfig> = {
            separators: {
                decimal: ".",
                thousand: ",",
            },
        };
        const normalDataPoint: Partial<IUnsafeHighchartsTooltipPoint> = {
            color: "rgb(0,193,141)",
            borderColor: "rgb(0,193,141)",
            id: "highcharts-h5pzvxn-64",
            name: "Grants",
            format: "#,##0",
            y: 553495299,
            series: {
                name: "Sum of Amount",
            },
        };

        const totalDataPoint: Partial<IUnsafeHighchartsTooltipPoint> = {
            color: "rgb(136,219,244)",
            borderColor: "rgb(136,219,244)",
            id: "highcharts-h5pzvxn-45",
            name: "Total",
            format: "#,##0",
            y: 553495299,
            isSum: true,
            series: {
                name: "Sum of Amount",
            },
        };
        const maxItemWidth = 320;

        it("should render the tooltip for normal data point with the expected format", () => {
            const dv = recordedDataFacade(
                ReferenceRecordings.Scenarios.WaterfallChart
                    .SingleMeasureWithViewBy as unknown as ScenarioRecording,
            );
            const { viewByAttribute } = getMVS(dv);
            const tooltipRenderer = getTooltipWaterfallChart(viewByAttribute, chartConfig);
            const tooltipContent = tooltipRenderer(normalDataPoint, maxItemWidth, undefined);

            expect(tooltipContent).toMatchSnapshot();
            expect(tooltipContent).toContain(normalDataPoint.series!.name);
            expect(tooltipContent).toContain(normalDataPoint.name);
        });

        it("should render the tooltip for total data point with the expected format", () => {
            const dv = recordedDataFacade(
                ReferenceRecordings.Scenarios.WaterfallChart
                    .SingleMeasureWithViewBy as unknown as ScenarioRecording,
            );
            const { viewByAttribute } = getMVS(dv);
            const tooltipRenderer = getTooltipWaterfallChart(viewByAttribute, chartConfig);
            const tooltipContent = tooltipRenderer(totalDataPoint, maxItemWidth, undefined);

            expect(tooltipContent).toMatchSnapshot();
            expect(tooltipContent).not.toContain(totalDataPoint.series!.name);
            expect(tooltipContent).toContain(totalDataPoint.name);
        });

        it("should render the tooltip for normal data point when only metrics with the expected format", () => {
            const dv = recordedDataFacade(
                ReferenceRecordings.Scenarios.WaterfallChart.MultiMeasures as unknown as ScenarioRecording,
            );
            const { viewByAttribute } = getMVS(dv);
            const tooltipRenderer = getTooltipWaterfallChart(viewByAttribute, chartConfig);
            const tooltipContent = tooltipRenderer(normalDataPoint, maxItemWidth, undefined);

            expect(tooltipContent).toMatchSnapshot();
            expect(tooltipContent).not.toContain(normalDataPoint.series!.name);
            expect(tooltipContent).toContain(normalDataPoint.name);
        });

        it("should render the tooltip for total data point when only metrics with the expected format", () => {
            const dv = recordedDataFacade(
                ReferenceRecordings.Scenarios.WaterfallChart.MultiMeasures as unknown as ScenarioRecording,
            );
            const { viewByAttribute } = getMVS(dv);
            const tooltipRenderer = getTooltipWaterfallChart(viewByAttribute, chartConfig);
            const tooltipContent = tooltipRenderer(totalDataPoint, maxItemWidth, undefined);

            expect(tooltipContent).toMatchSnapshot();
            expect(tooltipContent).not.toContain(totalDataPoint.series!.name);
            expect(tooltipContent).toContain(totalDataPoint.name);
        });
    });

    describe("generateDescriptionXYFn", () => {
        it("includes the attribute title, x/y and z when present", () => {
            const describePoint = generateDescriptionXYFn(
                attribute("City"),
                [axis("Amount", "#,##0")],
                [axis("Win Rate", "0%")],
                [axis("Population", "#,##0")],
            );
            const description = describePoint(
                point({
                    name: "Boston",
                    x: 100,
                    y: 0.5,
                    z: 2000,
                }),
            );

            expect(description).toBe("City: Boston, Amount: 100, Win Rate: 50%, Population: 2,000.");
        });

        it("omits the z part when z is not finite", () => {
            const describePoint = generateDescriptionXYFn(
                undefined,
                [axis("Amount")],
                [axis("Win Rate")],
                undefined,
            );
            const description = describePoint(point({ name: "Boston", x: 100, y: 0.5, z: undefined }));

            expect(description).toBe("Boston, Amount: 100, Win Rate: 0.5.");
        });
    });

    describe("generateDescriptionScatterPlotFn", () => {
        it("announces both the segment and the attribute, each with its own title", () => {
            const describePoint = generateDescriptionScatterPlotFn(
                attribute("Product"),
                attribute("City"),
                [axis("Amount")],
                [axis("Win Rate")],
            );
            const description = describePoint(
                point({
                    name: "CompuSci",
                    segmentName: "Boston",
                    x: 100,
                    y: 0.5,
                }),
            );

            expect(description).toBe("City: Boston, Product: CompuSci, Amount: 100, Win Rate: 0.5.");
        });

        it("omits the segment part when there is no segment attribute", () => {
            const describePoint = generateDescriptionScatterPlotFn(
                attribute("Product"),
                undefined,
                [axis("Amount")],
                [axis("Win Rate")],
            );
            const description = describePoint(point({ name: "CompuSci", x: 100, y: 0.5 }));

            expect(description).toBe("Product: CompuSci, Amount: 100, Win Rate: 0.5.");
        });
    });

    describe("generateDescriptionHeatmapFn", () => {
        it("announces the row/column categories and the formatted value", () => {
            const describePoint = generateDescriptionHeatmapFn(
                [axis("Product")],
                [axis("City")],
                [
                    ["CompuSci", "Educationly"],
                    ["Boston", "Prague"],
                ],
                "#,##0",
                undefined,
            );
            const description = describePoint(
                point({
                    x: 0,
                    y: 1,
                    value: 42,
                    series: { name: "Amount", xAxis: {} },
                    category: "CompuSci",
                }),
            );

            expect(description).toBe("City: Prague, Product: CompuSci, Amount: 42.");
        });

        it("does not announce the row index as the value for a cell with no data", () => {
            const describePoint = generateDescriptionHeatmapFn(
                [axis("Product")],
                [axis("City")],
                [
                    ["CompuSci", "Educationly"],
                    ["Boston", "Prague"],
                ],
                "#,##0",
                undefined,
            );
            // y=1 would previously leak in as "1" once value fell back to point.y
            const description = describePoint(
                point({
                    x: 0,
                    y: 1,
                    value: null,
                    series: { name: "Amount", xAxis: {} },
                    category: "CompuSci",
                }),
            );

            expect(description).not.toContain(": 1.");
        });
    });

    describe("generateDescriptionTreemapFn", () => {
        it("returns an empty description for a root point with no value", () => {
            const describePoint = generateDescriptionTreemapFn(undefined, undefined, [axis("Amount")]);
            const description = describePoint(point({ value: null, series: { name: "Amount" } }));

            expect(description).toBe("");
        });

        it("announces attribute and segment together for a View By + Segment By hierarchy", () => {
            const describePoint = generateDescriptionTreemapFn(attribute("Product"), attribute("City"), [
                axis("Amount"),
            ]);
            const seriesPoints = [{ id: "0", name: "Boston" }];
            const description = describePoint(
                point({
                    name: "CompuSci",
                    value: 42,
                    format: "#,##0",
                    parent: "0",
                    series: { name: "Amount", points: seriesPoints },
                }),
            );

            expect(description).toBe("Product: Boston, City: CompuSci, Amount: 42.");
        });

        it("uses the parent measure name as the value label for a no-View, multiple-measures hierarchy", () => {
            const describePoint = generateDescriptionTreemapFn(undefined, attribute("City"), [axis("")]);
            // No viewByAttribute: parentPoint represents the measure this leaf belongs to, not a segment.
            const seriesPoints = [{ id: "0", name: "Win Rate" }];
            const description = describePoint(
                point({
                    name: "Boston",
                    value: 42,
                    format: "#,##0",
                    parent: "0",
                    series: { name: "Amount, Win Rate", points: seriesPoints },
                }),
            );

            expect(description).toBe("City: Boston, Win Rate: 42.");
        });
    });
});
