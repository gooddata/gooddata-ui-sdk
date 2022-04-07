// (C) 2020-2022 GoodData Corporation

import { getMVS } from "../../_util/test/helper";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { ColorFactory } from "../../_chartOptions/colorFactory";
import { HeatmapColorStrategy } from "../heatmapColoring";
import { CUSTOM_COLOR_PALETTE } from "../../_util/test/colorPalette.fixture";
import { IColorMapping } from "../../../../interfaces";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import range from "lodash/range";
import { recordedDataFacade } from "../../../../../__mocks__/recordings";
import { HEATMAP_BLUE_COLOR_PALETTE } from "../../_util/color";
import { IColorPalette, ITheme } from "@gooddata/sdk-model";

describe("HeatmapColorStrategy", () => {
    it("should return HeatmapColorStrategy strategy with 7 colors from default heatmap color palette", () => {
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns);
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
            expect(colorStrategy.getColorByIndex(colorIndex)).toEqual(HEATMAP_BLUE_COLOR_PALETTE[colorIndex]),
        );
    });

    it(
        "should return HeatmapColorStrategy strategy with 7 colors" +
            " based on the first color from custom palette",
        () => {
            const dv = recordedDataFacade(ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns);
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
            const colors: string[] = range(7).map((index: number) => colorStrategy.getColorByIndex(index));
            expect(colors).toEqual(expectedColors);
        },
    );

    it(
        "should return HeatmapColorStrategy strategy with 7 colors" +
            " based on the first color from custom palette when color mapping given but not applicable",
        () => {
            const dv = recordedDataFacade(ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns);
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
            const colors: string[] = range(7).map((index: number) => colorStrategy.getColorByIndex(index));
            expect(colors).toEqual(expectedColors);
        },
    );

    it("should return HeatmapColorStrategy with properly applied mapping", () => {
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns);
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
                predicate: HeaderPredicates.localIdentifierMatch(ReferenceMd.Amount),
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

    it("should generate dark theme colors from theme chart background", () => {
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns);
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "heatmap";

        const expectedColors: string[] = [
            "rgb(0,0,0)",
            "rgb(42,48,21)",
            "rgb(84,97,43)",
            "rgb(126,145,64)",
            "rgb(168,194,86)",
            "rgb(143,169,59)",
            "rgb(118,145,33)",
        ];
        const colorMapping: IColorMapping[] = [
            {
                predicate: HeaderPredicates.localIdentifierMatch(ReferenceMd.Amount),
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
            {
                chart: {
                    backgroundColor: "#000",
                },
            },
        );

        expect(colorStrategy).toBeInstanceOf(HeatmapColorStrategy);
        const colors: string[] = range(7).map((index: number) => colorStrategy.getColorByIndex(index));
        expect(colors).toEqual(expectedColors);
    });

    describe("theme", () => {
        const Scenarios: Array<[string, ITheme, IColorPalette, string[]]> = [
            [
                "dark theme colors from theme chart background",
                {
                    palette: {
                        complementary: {
                            c0: "#222",
                            c9: "#fff",
                        },
                    },
                    chart: {
                        backgroundColor: "#000",
                    },
                },
                undefined,
                [
                    "rgb(0,0,0)",
                    "rgb(3,29,37)",
                    "rgb(6,59,75)",
                    "rgb(10,89,113)",
                    "rgb(13,118,150)",
                    "rgb(16,148,188)",
                    "rgb(20,178,226)",
                ],
            ],
            [
                "dark theme colors from theme complementary palette",
                {
                    palette: {
                        complementary: {
                            c0: "#222",
                            c9: "#fff",
                        },
                    },
                },
                undefined,
                [
                    "rgb(34,34,34)",
                    "rgb(31,58,66)",
                    "rgb(29,82,98)",
                    "rgb(27,106,130)",
                    "rgb(24,130,162)",
                    "rgb(22,153,193)",
                    "rgb(20,178,226)",
                ],
            ],
            [
                "light theme colors from light theme complementary palette",
                {
                    palette: {
                        complementary: {
                            c0: "#eee",
                            c9: "#000",
                        },
                    },
                },
                undefined,
                [
                    "rgb(238,238,238)",
                    "rgb(183,223,235)",
                    "rgb(129,208,232)",
                    "rgb(74,193,229)",
                    "rgb(20,178,226)",
                    "rgb(10,144,185)",
                    "rgb(0,110,144)",
                ],
            ],
            [
                "light theme colors from light theme complementary palette and custom colors",
                {
                    palette: {
                        complementary: {
                            c0: "#eee",
                            c9: "#000",
                        },
                    },
                },
                CUSTOM_COLOR_PALETTE,
                [
                    "rgb(238,238,238)",
                    "rgb(227,190,196)",
                    "rgb(216,143,155)",
                    "rgb(205,96,114)",
                    "rgb(195,49,73)",
                    "rgb(159,33,53)",
                    "rgb(124,18,34)",
                ],
            ],
            [
                "dark theme colors from dark theme complementary palette and custom colors",
                {
                    palette: {
                        complementary: {
                            c0: "#000",
                            c9: "#fff",
                        },
                    },
                },
                CUSTOM_COLOR_PALETTE,
                [
                    "rgb(0,0,0)",
                    "rgb(32,8,12)",
                    "rgb(65,16,24)",
                    "rgb(97,24,36)",
                    "rgb(130,32,48)",
                    "rgb(162,40,60)",
                    "rgb(195,49,73)",
                ],
            ],
            [
                "HEATMAP_BLUE_COLOR_PALETTE from white theme complementary palette",
                {
                    palette: {
                        complementary: {
                            c0: "#fff",
                            c9: "#000",
                        },
                    },
                },
                undefined,
                HEATMAP_BLUE_COLOR_PALETTE,
            ],
        ];

        it.each(Scenarios)(
            "should return %s when input is %s",
            (_desc, theme, customColors, expectedColors) => {
                const dv = recordedDataFacade(ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns);
                const { viewByAttribute, stackByAttribute } = getMVS(dv);

                const colorStrategy = ColorFactory.getColorStrategy(
                    customColors,
                    undefined,
                    viewByAttribute,
                    stackByAttribute,
                    dv,
                    "heatmap",
                    theme,
                );

                expect(colorStrategy).toBeInstanceOf(HeatmapColorStrategy);
                const colors: string[] = range(7).map((index: number) =>
                    colorStrategy.getColorByIndex(index),
                );
                expect(colors).toEqual(expectedColors);
            },
        );
    });
});
