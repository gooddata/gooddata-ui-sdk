// (C) 2007-2019 GoodData Corporation
import { DefaultColorPalette } from "@gooddata/sdk-ui";
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

import * as fixtures from "../../../../__mocks__/fixtures";
import { IMeasureDescriptor, IResultAttributeHeader } from "@gooddata/sdk-backend-spi";
import { IColor, RgbType, IColorPalette, IColorPaletteItem } from "@gooddata/sdk-model";
import range = require("lodash/range");
import { IColorMapping } from "../../Config";
import { CUSTOM_COLOR_PALETTE } from "./colorPalette.fixture";

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
    const customPalette = [
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
        {
            guid: "03",
            fill: {
                r: 150,
                g: 150,
                b: 150,
            },
        },
        {
            guid: "04",
            fill: {
                r: 200,
                g: 200,
                b: 200,
            },
        },
    ];

    describe("AttributeColorStrategy", () => {
        it("should return AttributeColorStrategy with two colors from default color palette", () => {
            const dv = fixtures.barChartWithStackByAndViewByAttributes;
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
            const dv = fixtures.barChartWithStackByAndViewByAttributes;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bar";
            const colorPalette = [
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
                colorPalette
                    .slice(0, 2)
                    .map((defaultColorPaletteItem: IColorPaletteItem) =>
                        getRgbString(defaultColorPaletteItem),
                    ),
            );
        });

        it("should return AttributeColorStrategy with properly applied mapping", () => {
            const dv = fixtures.barChartWithStackByAndViewByAttributes;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bar";
            const colorPalette = [
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
            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: IResultAttributeHeader) =>
                        headerItem.attributeHeaderItem &&
                        headerItem.attributeHeaderItem.uri ===
                            "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1024/elements?id=1225",
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
                    predicate: (headerItem: IResultAttributeHeader) =>
                        headerItem.attributeHeaderItem &&
                        headerItem.attributeHeaderItem.uri ===
                            "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1024/elements?id=1237",
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
                colorPalette,
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
        it("should return a palette with a lighter color for each pop measure based on it`s source measure", () => {
            const dv = fixtures.barChartWithPopMeasureAndViewByAttribute;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";

            const colorStrategy = ColorFactory.getColorStrategy(
                customPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);
            expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
            expect(updatedPalette).toEqual(["rgb(173,173,173)", "rgb(50,50,50)"]);
        });

        it("should return a palette with a lighter color for each previous period based on it`s source measure", () => {
            const dv = fixtures.barChartWithPreviousPeriodMeasure;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";

            const colorStrategy = ColorFactory.getColorStrategy(
                customPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);
            expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
            expect(updatedPalette).toEqual(["rgb(173,173,173)", "rgb(50,50,50)"]);
        });

        it("should rotate colors from original palette and generate lighter PoP colors", () => {
            const dv = fixtures.barChartWithPopMeasureAndViewByAttributeX6;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";

            const colorStrategy = ColorFactory.getColorStrategy(
                customPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
            expect(updatedPalette).toEqual([
                "rgb(173,173,173)",
                "rgb(50,50,50)",
                "rgb(193,193,193)",
                "rgb(100,100,100)",
                "rgb(213,213,213)",
                "rgb(150,150,150)",
                "rgb(233,233,233)",
                "rgb(200,200,200)",
                "rgb(173,173,173)",
                "rgb(50,50,50)",
                "rgb(193,193,193)",
                "rgb(100,100,100)",
            ]);
        });

        it("should rotate colors from original palette and generate lighter previous period measures", () => {
            const dv = fixtures.barChartWithPreviousPeriodMeasureX6;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";

            const colorStrategy = ColorFactory.getColorStrategy(
                customPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);

            expect(updatedPalette).toEqual([
                "rgb(173,173,173)",
                "rgb(50,50,50)",
                "rgb(193,193,193)",
                "rgb(100,100,100)",
                "rgb(213,213,213)",
                "rgb(150,150,150)",
                "rgb(233,233,233)",
                "rgb(200,200,200)",
                "rgb(173,173,173)",
                "rgb(50,50,50)",
                "rgb(193,193,193)",
                "rgb(100,100,100)",
            ]);
        });

        it("should just return the original palette if there are no pop measures shorten to cover all legend items", () => {
            const dv = fixtures.barChartWithoutAttributes;
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

        it("should return MeasureColorStrategy with properly applied mapping", () => {
            const dv = fixtures.barChartWithPopMeasureAndViewByAttributeX6;

            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";
            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: IMeasureDescriptor) =>
                        headerItem.measureHeaderItem.localIdentifier === "amountMeasure_1",
                    color: {
                        type: "guid",
                        value: "02",
                    },
                },
                {
                    predicate: (headerItem: IMeasureDescriptor) =>
                        headerItem.measureHeaderItem.localIdentifier === "amountPopMeasure_1",
                    color: {
                        type: "guid",
                        value: "03",
                    },
                },
                {
                    predicate: (headerItem: IMeasureDescriptor) =>
                        headerItem.measureHeaderItem.localIdentifier === "amountMeasure_2",
                    color: {
                        type: "guid",
                        value: "03",
                    },
                },
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                customPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
            expect(updatedPalette).toEqual([
                "rgb(193,193,193)",
                "rgb(100,100,100)",
                "rgb(213,213,213)",
                "rgb(150,150,150)",
                "rgb(213,213,213)",
                "rgb(150,150,150)",
                "rgb(233,233,233)",
                "rgb(200,200,200)",
                "rgb(173,173,173)",
                "rgb(50,50,50)",
                "rgb(193,193,193)",
                "rgb(100,100,100)",
            ]);
        });

        it("should return only non-derived measures in getColorAssignment", () => {
            const dv = fixtures.barChartWithPopMeasureAndViewByAttributeX6;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "column";

            const colorStrategy = ColorFactory.getColorStrategy(
                customPalette,
                undefined,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );

            expect(colorStrategy.getColorAssignment().length).toEqual(6);
        });
    });

    describe("TreemapColorStrategy", () => {
        it("should return TreemapColorStrategy strategy with two colors from default color palette", () => {
            const dv = fixtures.treemapWithMetricViewByAndStackByAttribute;
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
            const dv = fixtures.treemapWithMetricViewByAndStackByAttribute;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "treemap";

            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: IMeasureDescriptor) =>
                        headerItem.measureHeaderItem.localIdentifier === "amountMetric",
                    color: {
                        type: "guid",
                        value: "02",
                    },
                },
            ];

            const colorStrategy = ColorFactory.getColorStrategy(
                customPalette,
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
            const dv = fixtures.heatMapWithMetricRowColumn;
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
                const dv = fixtures.heatMapWithMetricRowColumn;
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
                const dv = fixtures.heatMapWithMetricRowColumn;
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
            const dv = fixtures.heatMapWithMetricRowColumn;
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
                    predicate: (headerItem: IMeasureDescriptor) =>
                        headerItem.measureHeaderItem.localIdentifier === "amountMeasure",
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
            const dv = fixtures.bubbleChartWith3Metrics;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bubble";

            const expectedColors = ["rgb(0,0,0)"];
            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: IMeasureDescriptor) =>
                        headerItem.measureHeaderItem.localIdentifier === "784a5018a51049078e8f7e86247e08a3",
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
            const dv = fixtures.bubbleChartWith3MetricsAndAttribute;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "bubble";

            const expectedColors = ["rgb(0,0,0)"];
            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: IResultAttributeHeader) =>
                        headerItem.attributeHeaderItem.uri ===
                        "/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/1025/elements?id=1224",
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
            expect(colorStrategy.getColorAssignment().length).toEqual(20);
            expect(colorStrategy.getColorByIndex(0)).toEqual(expectedColors[0]);
        });
    });

    describe("ScatterPlotColorStrategy", () => {
        it("should create palette with same color from first measure for all attribute elements", () => {
            const dv = fixtures.scatterPlotWith2MetricsAndAttribute;
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "scatter";

            const expectedColor = "rgb(0,0,0)";
            const colorMapping: IColorMapping[] = [
                {
                    predicate: (headerItem: IMeasureDescriptor) =>
                        headerItem.measureHeaderItem.localIdentifier === "33bd337ed5534fd383861f11ff657b23",
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
