// (C) 2020-2026 GoodData Corporation

import { range } from "lodash-es";
import { describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { type ScenarioRecording } from "@gooddata/sdk-backend-mockingbird";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { type IColorMapping, type IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import { recordedDataFacade } from "../../../../../testUtils/recordings.js";
import { ColorFactory } from "../../_chartOptions/colorFactory.js";
import { CUSTOM_COLOR_PALETTE } from "../../_util/test/colorPalette.fixture.js";
import { getMVS } from "../../_util/test/helper.js";
import { ScatterPlotColorStrategy } from "../scatterPlotColoring.js";

describe("ScatterPlotColorStrategy", () => {
    it("should create palette with same color from first measure for all attribute elements", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.ScatterPlot
                .XAndYAxisMeasuresAndAttribute as unknown as ScenarioRecording,
        );
        const { viewByAttribute } = getMVS(dv);
        const type = "scatter";

        const expectedColor = "rgb(0,0,0)";
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

        const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
            CUSTOM_COLOR_PALETTE,
            colorMapping,
            viewByAttribute,
            undefined,
            undefined,
            dv,
            type,
        );

        expect(colorStrategy).toBeInstanceOf(ScatterPlotColorStrategy);
        expect(colorStrategy.getColorAssignment().length).toEqual(1);
        range(1).map((itemIndex) => {
            expect(colorStrategy.getColorByIndex(itemIndex)).toEqual(expectedColor);
        });
    });

    it("should create palette with different colors from all segmentBy attribute elements", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.ScatterPlot
                .XAndYAxisMeasuresAttributeAndSegmentation as unknown as ScenarioRecording,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "scatter";

        const colorMapping: IColorMapping[] = [];

        const colorStrategy: IColorStrategy = ColorFactory.getColorStrategy(
            CUSTOM_COLOR_PALETTE,
            colorMapping,
            viewByAttribute,
            undefined,
            stackByAttribute,
            dv,
            type,
        );

        expect(colorStrategy).toBeInstanceOf(ScatterPlotColorStrategy);
        expect(colorStrategy.getColorAssignment().length).toEqual(20);
        range(20).map((itemIndex) => {
            expect(colorStrategy.getColorByIndex(itemIndex)).toMatchSnapshot();
        });
    });
});
