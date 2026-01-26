// (C) 2020-2026 GoodData Corporation

import { range } from "lodash-es";
import { describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { type IColorPalette, type ITheme } from "@gooddata/sdk-model";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { type IColorMapping, type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { recordedDataFacade } from "../../../../../testUtils/recordings.js";
import { ColorFactory } from "../../_chartOptions/colorFactory.js";
import { HEATMAP_BLUE_COLOR_PALETTE } from "../../_util/color.js";
import { CUSTOM_COLOR_PALETTE } from "../../_util/test/colorPalette.fixture.js";
import { getMVS } from "../../_util/test/helper.js";
import { HeatmapColorStrategy } from "../heatmapColoring.js";

describe("HeatmapColorStrategy", () => {
    it("should return HeatmapColorStrategy strategy with 7 colors from default heatmap color palette", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns as unknown as ScenarioRecording,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "heatmap";

        const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
            undefined,
            undefined,
            viewByAttribute,
            undefined,
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
            const dv = recordedDataFacade(
                ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns as unknown as ScenarioRecording,
            );
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "heatmap";

            const expectedColors: string[] = [
                "rgb(246,225,229)",
                "rgb(237,196,203)",
                "rgb(229,166,176)",
                "rgb(220,137,151)",
                "rgb(212,107,125)",
                "rgb(203,78,99)",
                "rgb(195,49,73)",
            ];

            const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
                CUSTOM_COLOR_PALETTE,
                undefined,
                viewByAttribute,
                undefined,
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
            const dv = recordedDataFacade(
                ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns as unknown as ScenarioRecording,
            );
            const { viewByAttribute, stackByAttribute } = getMVS(dv);
            const type = "heatmap";

            const expectedColors: string[] = [
                "rgb(246,225,229)",
                "rgb(237,196,203)",
                "rgb(229,166,176)",
                "rgb(220,137,151)",
                "rgb(212,107,125)",
                "rgb(203,78,99)",
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
                undefined,
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
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns as unknown as ScenarioRecording,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "heatmap";

        const expectedColors: string[] = [
            "rgb(242,246,230)",
            "rgb(230,237,206)",
            "rgb(217,228,182)",
            "rgb(205,220,158)",
            "rgb(192,211,134)",
            "rgb(180,202,110)",
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
            undefined,
            stackByAttribute,
            dv,
            type,
        );

        expect(colorStrategy).toBeInstanceOf(HeatmapColorStrategy);
        const colors: string[] = range(7).map((index: number) => colorStrategy.getColorByIndex(index));
        expect(colors).toEqual(expectedColors);
    });

    it("should generate dark theme colors from theme chart background", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.Heatmap.MeasureRowsAndColumns as unknown as ScenarioRecording,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "heatmap";

        const expectedColors: string[] = [
            "rgb(33,38,17)",
            "rgb(67,77,34)",
            "rgb(100,116,51)",
            "rgb(134,155,68)",
            "rgb(168,194,86)",
            "rgb(134,161,50)",
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
            undefined,
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
        const Scenarios: Array<[string, ITheme, IColorPalette | undefined, string[]]> = [
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
                    "rgb(2,25,32)",
                    "rgb(5,50,64)",
                    "rgb(8,76,96)",
                    "rgb(11,101,129)",
                    "rgb(14,127,161)",
                    "rgb(17,152,193)",
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
                    "rgb(32,54,61)",
                    "rgb(30,75,88)",
                    "rgb(28,95,116)",
                    "rgb(26,116,143)",
                    "rgb(24,136,171)",
                    "rgb(22,157,198)",
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
                    "rgb(194,226,235)",
                    "rgb(150,214,233)",
                    "rgb(107,202,230)",
                    "rgb(63,190,228)",
                    "rgb(20,178,226)",
                    "rgb(6,132,171)",
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
                    "rgb(229,200,205)",
                    "rgb(220,162,172)",
                    "rgb(212,124,138)",
                    "rgb(203,86,106)",
                    "rgb(195,49,73)",
                    "rgb(147,28,47)",
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
                    "rgb(27,7,10)",
                    "rgb(55,14,20)",
                    "rgb(83,21,31)",
                    "rgb(111,28,41)",
                    "rgb(139,34,52)",
                    "rgb(167,42,62)",
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
                const dv = recordedDataFacade(
                    ReferenceRecordings.Scenarios.Heatmap
                        .MeasureRowsAndColumns as unknown as ScenarioRecording,
                );
                const { viewByAttribute, stackByAttribute } = getMVS(dv);

                const colorStrategy = ColorFactory.getColorStrategy(
                    customColors,
                    undefined,
                    viewByAttribute,
                    undefined,
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
