// (C) 2020 GoodData Corporation

import { getMVS } from "../../test/helper";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { ColorFactory } from "../../colorFactory";
import { HeatmapColorStrategy } from "../heatmap";
import { CUSTOM_COLOR_PALETTE } from "../../test/colorPalette.fixture";
import { IColorMapping } from "../../../../interfaces";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { ReferenceLdm, ReferenceRecordings } from "@gooddata/reference-workspace";
import range = require("lodash/range");
import { recordedDataFacade } from "../../../../../__mocks__/recordings";
import { HEATMAP_BLUE_COLOR_PALETTE } from "../../../utils/color";

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
