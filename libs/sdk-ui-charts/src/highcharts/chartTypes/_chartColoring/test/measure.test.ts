// (C) 2020-2022 GoodData Corporation
import { HeaderPredicates } from "@gooddata/sdk-ui";
import { IColorPalette, ITheme } from "@gooddata/sdk-model";
import { ReferenceRecordings, ReferenceMd } from "@gooddata/reference-workspace";

import { getMVS } from "../../_util/test/helper";
import { ColorFactory } from "../../_chartOptions/colorFactory";
import { MeasureColorStrategy } from "../measure";
import { IColorMapping } from "../../../../interfaces";
import { recordedDataFacade } from "../../../../../__mocks__/recordings";
import { TwoColorPalette } from "./color.fixture";
import { getColorsFromStrategy } from "./helper";

describe("MeasureColorStrategy", () => {
    describe("derived measure color", () => {
        const dv = recordedDataFacade(ReferenceRecordings.Scenarios.BarChart.ViewByDateAndPoPMeasure);
        const { viewByAttribute, stackByAttribute } = getMVS(dv);
        const type = "column";
        const colorMapping: IColorMapping[] = [
            {
                // first measure; no other measure derived from this;
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
            {
                // second measure; is master; derived measure follows
                predicate: HeaderPredicates.localIdentifierMatch(ReferenceMd.Won),
                color: {
                    type: "rgb",
                    value: {
                        r: 50,
                        g: 50,
                        b: 50,
                    },
                },
            },
        ];

        it("should return a lighter color for derived measure, based on master measure", () => {
            const colorStrategy = ColorFactory.getColorStrategy(
                TwoColorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );
            const updatedPalette = getColorsFromStrategy(colorStrategy);
            expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
            expect(updatedPalette).toEqual(["rgb(0,0,0)", "rgb(50,50,50)", "rgb(173,173,173)"]);
        });

        it("should return a lighter color for derived measure, based on master measure when light based theme is provided", () => {
            const colorStrategy = ColorFactory.getColorStrategy(
                TwoColorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
            );
            const updatedPalette = getColorsFromStrategy(colorStrategy);
            expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
            expect(updatedPalette).toEqual(["rgb(0,0,0)", "rgb(50,50,50)", "rgb(173,173,173)"]);
        });

        it("should return a darker color for derived measure, based on master measure when dark based theme is provided", () => {
            const darkBasedTheme: ITheme = {
                palette: {
                    complementary: {
                        c0: "#000",
                        c9: "#fff",
                    },
                },
            };
            const colorStrategy = ColorFactory.getColorStrategy(
                TwoColorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                type,
                darkBasedTheme,
            );
            const updatedPalette = getColorsFromStrategy(colorStrategy);

            expect(colorStrategy).toBeInstanceOf(MeasureColorStrategy);
            expect(updatedPalette).toEqual(["rgb(0,0,0)", "rgb(50,50,50)", "rgb(20,20,20)"]);
        });
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
