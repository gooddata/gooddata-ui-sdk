// (C) 2020 GoodData Corporation

import { getMVS } from "../../_util/test/helper";
import { ColorFactory } from "../../_chartOptions/colorFactory";
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { MeasureColorStrategy } from "../measure";
import { IColorPalette } from "@gooddata/sdk-model";
import { TwoColorPalette } from "./color.fixture";
import { getColorsFromStrategy } from "./helper";
import { ReferenceRecordings, ReferenceLdm } from "@gooddata/reference-workspace";
import { recordedDataFacade } from "../../../../../__mocks__/recordings";

describe("MeasureColorStrategy", () => {
    it("should return a lighter color for derived measure, based on master measure", () => {
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.BarChart.ViewByDateAndPoPMeasure);
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
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.BarChart.FourMeasuresAndPoP);

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
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.BarChart.SingleMeasure);
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
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.BarChart.ViewByDateAndPoPMeasure);
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
