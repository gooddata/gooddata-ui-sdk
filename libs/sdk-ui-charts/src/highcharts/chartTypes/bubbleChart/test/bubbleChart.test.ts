// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceData, ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { HeaderPredicates } from "@gooddata/sdk-ui";

import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { type IColorMapping } from "../../../../interfaces/index.js";
import { ColorFactory } from "../../_chartOptions/colorFactory.js";
import { CUSTOM_COLOR_PALETTE } from "../../_util/test/colorPalette.fixture.js";
import { getMVS } from "../../_util/test/helper.js";
import { BubbleChartColorStrategy } from "../bubbleChartColoring.js";

describe("BubbleChartStrategy", () => {
    it("should create palette with color from first measure", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.BubbleChart.XAxisMeasure as unknown as ScenarioRecording,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "bubble";

        const expectedColors = ["rgb(0,0,0)"];
        const colorMapping: IColorMapping[] = [
            {
                predicate: HeaderPredicates.localIdentifierMatch(ReferenceMd.Amount),
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
            undefined,
            stackByAttribute,
            dv,
            type,
        );

        expect(colorStrategy).toBeInstanceOf(BubbleChartColorStrategy);
        expect(colorStrategy.getColorAssignment().length).toEqual(1);
        expect(colorStrategy.getColorByIndex(0)).toEqual(expectedColors[0]);
    });

    it("should create palette with color for each attribute element", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.BubbleChart
                .XAndYAxisAndSizeMeasuresWithViewBy as unknown as ScenarioRecording,
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
            undefined,
            stackByAttribute,
            dv,
            type,
        );

        expect(colorStrategy).toBeInstanceOf(BubbleChartColorStrategy);
        expect(colorStrategy.getColorAssignment().length).toEqual(6);
        expect(colorStrategy.getColorByIndex(0)).toEqual(expectedColors[0]);
    });
});
