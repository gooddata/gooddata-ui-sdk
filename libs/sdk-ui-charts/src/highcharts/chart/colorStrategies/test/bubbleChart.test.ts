// (C) 2020 GoodData Corporation

import { recordedDataView } from "@gooddata/sdk-backend-mockingbird";
import { getMVS } from "../../test/helper";
import { IColorMapping } from "../../../../interfaces";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { ColorFactory } from "../../colorFactory";
import { CUSTOM_COLOR_PALETTE } from "../../test/colorPalette.fixture";
import { BubbleChartColorStrategy } from "../bubbleChart";
import { ReferenceRecordings, ReferenceLdm, ReferenceData } from "@gooddata/reference-workspace";

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
