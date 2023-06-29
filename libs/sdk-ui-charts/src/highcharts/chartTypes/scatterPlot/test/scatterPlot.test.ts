// (C) 2020-2023 GoodData Corporation

import { getMVS } from "../../_util/test/helper.js";
import { IColorMapping } from "../../../../interfaces/index.js";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { ColorFactory } from "../../_chartOptions/colorFactory.js";
import { CUSTOM_COLOR_PALETTE } from "../../_util/test/colorPalette.fixture.js";
import { ScatterPlotColorStrategy } from "../scatterPlotColoring.js";
import { ReferenceRecordings, ReferenceMd } from "@gooddata/reference-workspace";
import range from "lodash/range.js";
import { recordedDataFacade } from "../../../../../__mocks__/recordings.js";
import { describe, it, expect } from "vitest";

describe("ScatterPlotColorStrategy", () => {
    it("should create palette with same color from first measure for all attribute elements", () => {
        const dv = recordedDataFacade(
            ReferenceRecordings.Scenarios.ScatterPlot.XAndYAxisMeasuresAndAttribute,
        );
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
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
            stackByAttribute,
            dv,
            type,
        );

        expect(colorStrategy).toBeInstanceOf(ScatterPlotColorStrategy);
        expect(colorStrategy.getColorAssignment().length).toEqual(1);
        range(6).map((itemIndex) => {
            expect(colorStrategy.getColorByIndex(itemIndex)).toEqual(expectedColor);
        });
    });
});
