// (C) 2007-2020 GoodData Corporation
import { DefaultColorPalette, HeaderPredicates } from "@gooddata/sdk-ui";
import {
    AttributeColorStrategy,
    BubbleChartColorStrategy,
    ColorFactory,
    HeatmapColorStrategy,
    IColorStrategy,
    isValidMappedColor,
    MeasureColorStrategy,
    ScatterPlotColorStrategy,
    TreemapColorStrategy,
} from "../colorFactory";

import { getMVS } from "./helper";

import { getRgbString, HEATMAP_BLUE_COLOR_PALETTE } from "../../utils/color";
import { IResultAttributeHeader } from "@gooddata/sdk-backend-spi";
import { IColor, IColorPalette, IColorPaletteItem, RgbType } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces";
import { CUSTOM_COLOR_PALETTE } from "./colorPalette.fixture";
import { recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceData, ReferenceLdm, ReferenceRecordings } from "@gooddata/reference-workspace";
import range = require("lodash/range");

function getColorsFromStrategy(strategy: IColorStrategy): string[] {
    const res: string[] = [];

    for (let i = 0; i < strategy.getFullColorAssignment().length; i++) {
        res.push(strategy.getColorByIndex(i));
    }

    return res;
}

describe("isValidMappedColor", () => {
    const colorPalette: IColorPalette = [
        {
            guid: "01",
            fill: {
                r: 195,
                g: 49,
                b: 73,
            },
        },
    ];

    it("should return true if color item is in palette", () => {
        const colorItem: IColor = {
            type: "guid",
            value: "01",
        };

        expect(isValidMappedColor(colorItem, colorPalette)).toBeTruthy();
    });

    it("should return false if color item is not in palette", () => {
        const colorItem: IColor = {
            type: "guid",
            value: "xx",
        };

        expect(isValidMappedColor(colorItem, colorPalette)).toBeFalsy();
    });

    it("should return true if color item is rgb", () => {
        const colorItem: IColor = {
            type: "rgb",
            value: {
                r: 255,
                g: 0,
                b: 0,
            },
        };

        expect(isValidMappedColor(colorItem, colorPalette)).toBeTruthy();
    });
});

describe("ColorFactory", () => {
    const TwoColorPalette = [
        {
            guid: "01",
            fill: {
                r: 50,
                g: 50,
                b: 50,
            },
        },
        {
            guid: "02",
            fill: {
                r: 100,
                g: 100,
                b: 100,
            },
        },
    ];

    const RgbPalette = [
        {
            guid: "red",
            fill: {
                r: 255,
                g: 0,
                b: 0,
            },
        },
        {
            guid: "green",
            fill: {
                r: 0,
                g: 255,
                b: 0,
            },
        },
        {
            guid: "blue",
            fill: {
                r: 0,
                g: 0,
                b: 255,
            },
        },
    ];

    describe("AttributeColorStrategy", () => {
        it("should return AttributeColorStrategy with two colors from default color palette", () => {
            const dv = recordedDataView(
                ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy,
            );
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bar";
            const colorPalette: IColorPalette = undefined;

            const colorStrategy = ColorFactory.getColorStrategy(
                colorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(AttributeColorStrategy);
            expect(updatedPalette).toEqual(
                DefaultColorPalette.slice(0, 2).map((defaultColorPaletteItem: IColorPaletteItem) =>
                    getRgbString(defaultColorPaletteItem),
                ),
            );
        });

        it("should return AttributeColorStrategy with two colors from custom color palette", () => {
            const dv = recordedDataView(
                ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy,
            );
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bar";

            const colorStrategy = ColorFactory.getColorStrategy(
                RgbPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(AttributeColorStrategy);
            expect(updatedPalette).toEqual(
                RgbPalette.slice(0, 2).map((defaultColorPaletteItem: IColorPaletteItem) =>
                    getRgbString(defaultColorPaletteItem),
                ),
            );
        });

        it("should return AttributeColorStrategy with properly applied mapping", () => {
            const dv = recordedDataView(
                ReferenceRecordings.Scenarios.BarChart.SingleMeasureWithViewByAndStackBy,
            );
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bar";
            const colorMapping: IColorMapping[] = [
                {
                    predicate: HeaderPredicates.attributeItemNameMatch(ReferenceData.Region.EastCoast.title),
                    color: {
                        type: "guid",
                        value: "blue",
                    },
                },
                {
                    predicate: (headerItem: IResultAttributeHeader) =>
                        headerItem.attributeHeaderItem && headerItem.attributeHeaderItem.uri === "invalid",
                    color: {
                        type: "rgb" as RgbType,
                        value: {
                            r: 0,
                            g: 0,
                            b: 0,
                        },
                    },
                },
                {
                    predicate: HeaderPredicates.uriMatch(ReferenceData.Region.WestCoast.uri),
                    color: {
                        type: "rgb" as RgbType,
                        value: {
                            r: 0,
                            g: 0,
                            b: 1,
                        },
                    },
                },
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                RgbPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(AttributeColorStrategy);
            expect(updatedPalette).toEqual(["rgb(0,0,255)", "rgb(0,0,1)"]);
        });
    });

    describe("MeasureColorStrategy", () => {
        it("should return a lighter color for derived measure, based on master measure", () => {
            const dv = recordedDataView(ReferenceRecordings.Scenarios.BarChart.ViewByDateAndPoPMeasure);
            // const dv = fixtures.barChartWithPopMeasureAndViewByAttribute;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";

            const colorStrategy = ColorFactory.getColorStrategy(
                TwoColorPalette,
                [
                    {
                        // first measure; no other measure derived from this;
                        predicate: HeaderPredicates.localIdentifierMatch(ReferenceLdm.Amount),
                        color: {
                            type: "rgb",
                            value: {
                                r: 0,
                                g: 0,
                                b: 0,
                            },
                        },
                    },
                    {
                        // second measure; is master; derived measure follows
                        predicate: HeaderPredicates.localIdentifierMatch(ReferenceLdm.Won),
                        color: {
                            type: "rgb",
                            value: {
                                r: 50,
                                g: 50,
                                b: 50,
                            },
                        },
                    },
                ],
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);
            expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
            expect(updatedPalette).toEqual(["rgb(0,0,0)", "rgb(50,50,50)", "rgb(173,173,173)"]);
        });

        it("should rotate colors from original palette and generate lighter colors for derived measure", () => {
            /*
             * recording has four non-derived measures and PoP mixed in
             *
             * - simple (amount)
             * - simple (won)
             * - pop (derived from won)
             * - arithmetic
             * - arithmetic
             *
             */
            const dv = recordedDataView(ReferenceRecordings.Scenarios.BarChart.FourMeasuresAndPoP);

            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";

            const colorStrategy = ColorFactory.getColorStrategy(
                TwoColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
            expect(updatedPalette).toEqual([
                "rgb(50,50,50)",
                "rgb(100,100,100)",
                "rgb(193,193,193)",
                "rgb(50,50,50)",
                "rgb(100,100,100)",
            ]);
        });

        it("should just return the original palette if there are no pop measures shorten to cover all legend items", () => {
            const dv = recordedDataView(ReferenceRecordings.Scenarios.BarChart.SingleMeasure);
            const { measureGroup, viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";
            const colorPalette: IColorPalette = undefined;

            const colorStrategy = ColorFactory.getColorStrategy(
                colorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const itemsCount = measureGroup.items.length;
            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(itemsCount).toEqual(updatedPalette.length);
        });

        it("should return only non-derived measures in getColorAssignment", () => {
            const dv = recordedDataView(ReferenceRecordings.Scenarios.BarChart.ViewByDateAndPoPMeasure);
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";

            const colorStrategy = ColorFactory.getColorStrategy(
                TwoColorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            expect(colorStrategy.getColorAssignment().length).toEqual(2);
        });
    });

    describe("TreemapColorStrategy", () => {
        it("should return TreemapColorStrategy strategy with two colors from default color palette", () => {
            const dv = recordedDataView(ReferenceRecordings.Scenarios.Treemap.SingleMeasureViewByAndSegment);
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "treemap";
            const colorPalette: IColorPalette = undefined;

            const colorStrategy = ColorFactory.getColorStrategy(
                colorPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(TreemapColorStrategy);
            expect(updatedPalette).toEqual(
                DefaultColorPalette.slice(0, 1).map((defaultColorPaletteItem: IColorPaletteItem) =>
                    getRgbString(defaultColorPaletteItem),
                ),
            );
        });

        it("should return TreemapColorStrategy with properly applied mapping", () => {
            const dv = recordedDataView(ReferenceRecordings.Scenarios.Treemap.SingleMeasureViewByAndSegment);
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "treemap";

            const colorMapping: IColorMapping[] = [
                {
                    predicate: HeaderPredicates.localIdentifierMatch(ReferenceLdm.Amount),
                    color: {
                        type: "guid",
                        value: "02",
                    },
                },
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                TwoColorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(TreemapColorStrategy);
            expect(updatedPalette).toEqual(["rgb(100,100,100)"]);
        });
    });

    describe("HeatmapColorStrategy", () => {
        it("should return HeatmapColorStrategy strategy with 7 colors from default heatmap color palette", () => {
            const dv = recordedDataView(ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns);
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "heatmap";

            const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
                undefined,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            expect(colorStrategy).toBeInstanceOf(HeatmapColorStrategy);
            range(7).map((colorIndex: number) =>
                expect(colorStrategy.getColorByIndex(colorIndex)).toEqual(
                    HEATMAP_BLUE_COLOR_PALETTE[colorIndex],
                ),
            );
        });

        it(
            "should return HeatmapColorStrategy strategy with 7 colors" +
                " based on the first color from custom palette",
            () => {
                const dv = recordedDataView(ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns);
                const { viewByAttribute, stackByAttribute } = getMVS(dv);
                const type = "heatmap";

                const expectedColors: string[] = [
                    "rgb(255,255,255)",
                    "rgb(245,220,224)",
                    "rgb(235,186,194)",
                    "rgb(225,152,164)",
                    "rgb(215,117,133)",
                    "rgb(205,83,103)",
                    "rgb(195,49,73)",
                ];

                const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
                    CUSTOM_COLOR_PALETTE,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    dv,
                    type,
                );

                expect(colorStrategy).toBeInstanceOf(HeatmapColorStrategy);
                const colors: string[] = range(7).map((index: number) =>
                    colorStrategy.getColorByIndex(index),
                );
                expect(colors).toEqual(expectedColors);
            },
        );

        it(
            "should return HeatmapColorStrategy strategy with 7 colors" +
                " based on the first color from custom palette when color mapping given but not applicable",
            () => {
                const dv = recordedDataView(ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns);
                const { viewByAttribute, stackByAttribute } = getMVS(dv);
                const type = "heatmap";

                const expectedColors: string[] = [
                    "rgb(255,255,255)",
                    "rgb(245,220,224)",
                    "rgb(235,186,194)",
                    "rgb(225,152,164)",
                    "rgb(215,117,133)",
                    "rgb(205,83,103)",
                    "rgb(195,49,73)",
                ];

                const inapplicableColorMapping: IColorMapping[] = [
                    {
                        predicate: () => false,
                        color: {
                            type: "guid",
                            value: "02",
                        },
                    },
                ];

                const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
                    CUSTOM_COLOR_PALETTE,
                    inapplicableColorMapping,
                    viewByAttribute,
                    stackByAttribute,
                    dv,
                    type,
                );

                expect(colorStrategy).toBeInstanceOf(HeatmapColorStrategy);
                const colors: string[] = range(7).map((index: number) =>
                    colorStrategy.getColorByIndex(index),
                );
                expect(colors).toEqual(expectedColors);
            },
        );

        it("should return HeatmapColorStrategy with properly applied mapping", () => {
            const dv = recordedDataView(ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns);
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "heatmap";

            const expectedColors: string[] = [
                "rgb(255,255,255)",
                "rgb(240,244,226)",
                "rgb(226,234,198)",
                "rgb(211,224,170)",
                "rgb(197,214,142)",
                "rgb(182,204,114)",
                "rgb(168,194,86)",
            ];
            const colorMapping: IColorMapping[] = [
                {
                    predicate: HeaderPredicates.localIdentifierMatch(ReferenceLdm.Amount),
                    color: {
                        type: "guid",
                        value: "02",
                    },
                },
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            expect(colorStrategy).toBeInstanceOf(HeatmapColorStrategy);
            const colors: string[] = range(7).map((index: number) => colorStrategy.getColorByIndex(index));
            expect(colors).toEqual(expectedColors);
        });
    });

    describe("BubbleChartStrategy", () => {
        it("should create palette with color from first measure", () => {
            const dv = recordedDataView(ReferenceRecordings.Scenarios.BubbleChart.XAxisMeasure);
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bubble";

            const expectedColors = ["rgb(0,0,0)"];
            const colorMapping: IColorMapping[] = [
                {
                    predicate: HeaderPredicates.localIdentifierMatch(ReferenceLdm.Amount),
                    color: {
                        type: "rgb",
                        value: {
                            r: 0,
                            g: 0,
                            b: 0,
                        },
                    },
                },
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            expect(colorStrategy).toBeInstanceOf(BubbleChartColorStrategy);
            expect(colorStrategy.getColorAssignment().length).toEqual(1);
            expect(colorStrategy.getColorByIndex(0)).toEqual(expectedColors[0]);
        });

        it("should create palette with color for each attribute element", () => {
            const dv = recordedDataView(
                ReferenceRecordings.Scenarios.BubbleChart.XAndYAxisAndSizeMeasuresWithViewBy,
            );
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bubble";

            const expectedColors = ["rgb(0,0,0)"];
            const colorMapping: IColorMapping[] = [
                {
                    predicate: HeaderPredicates.uriMatch(ReferenceData.ProductName.CompuSci.uri),
                    color: {
                        type: "rgb",
                        value: {
                            r: 0,
                            g: 0,
                            b: 0,
                        },
                    },
                },
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            expect(colorStrategy).toBeInstanceOf(BubbleChartColorStrategy);
            expect(colorStrategy.getColorAssignment().length).toEqual(6);
            expect(colorStrategy.getColorByIndex(0)).toEqual(expectedColors[0]);
        });
    });

    describe("ScatterPlotColorStrategy", () => {
        it("should create palette with same color from first measure for all attribute elements", () => {
            const dv = recordedDataView(
                ReferenceRecordings.Scenarios.ScatterPlot.XAndYAxisMeasuresAndAttribute,
            );
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "scatter";

            const expectedColor = "rgb(0,0,0)";
            const colorMapping: IColorMapping[] = [
                {
                    predicate: HeaderPredicates.localIdentifierMatch(ReferenceLdm.Amount),
                    color: {
                        type: "rgb",
                        value: {
                            r: 0,
                            g: 0,
                            b: 0,
                        },
                    },
                },
            ];

            const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            expect(colorStrategy).toBeInstanceOf(ScatterPlotColorStrategy);
            expect(colorStrategy.getColorAssignment().length).toEqual(1);
            range(6).map(itemIndex => {
                expect(colorStrategy.getColorByIndex(itemIndex)).toEqual(expectedColor);
            });
        });
    });
});
