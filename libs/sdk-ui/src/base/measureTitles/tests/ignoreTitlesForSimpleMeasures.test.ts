// (C) 2007-2023 GoodData Corporation
import { IInsight, insightMeasures, idMatchMeasure } from "@gooddata/sdk-model";
import { ignoreTitlesForSimpleMeasures } from "../ignoreTitlesForSimpleMeasures.js";
import { insightWithComplexArithmeticMeasureTree } from "../../../../__mocks__/fixtures.js";
import { describe, expect, it } from "vitest";

describe("measureTitleHelper", () => {
    describe("ignoreTitlesForSimpleMeasures", () => {
        function getInfoFromMeasure(
            insight: IInsight,
            localIdentifier: string,
            infoKey: string,
        ): string | undefined {
            const measures = insightMeasures(insight);
            const matchingMeasure: any = measures.find(idMatchMeasure(localIdentifier));

            return matchingMeasure === undefined ? undefined : matchingMeasure.measure[infoKey];
        }

        it.each(["m1", "m2"])(
            'should delete title of the measure which is simple and has localIdentifier "%s"',
            (value: string) => {
                const result = ignoreTitlesForSimpleMeasures(insightWithComplexArithmeticMeasureTree);
                expect(getInfoFromMeasure(result, value, "title")).toBeUndefined();
            },
        );

        it("should preserve all measures' aliases", () => {
            const result = ignoreTitlesForSimpleMeasures(insightWithComplexArithmeticMeasureTree);
            expect(getInfoFromMeasure(result, "m3", "alias")).toEqual("AD Queries");
            expect(getInfoFromMeasure(result, "m4", "alias")).toEqual("KD Queries");
        });

        it("should not delete a measure's title if the measure is non-simple", () => {
            const result = ignoreTitlesForSimpleMeasures(insightWithComplexArithmeticMeasureTree);
            expect(getInfoFromMeasure(result, "m1_pop", "title")).toEqual("M1 Pop Measure Title");
            expect(getInfoFromMeasure(result, "m1_previous_period", "title")).toEqual(
                "M1 Previous Measure Title",
            );
            expect(
                getInfoFromMeasure(result, "arithmetic_measure_created_from_simple_measures", "title"),
            ).toEqual("Arithmetic sum(m1, m2) Measure Title");
            expect(
                getInfoFromMeasure(
                    result,
                    "arithmetic_measure_created_from_renamed_simple_measures",
                    "title",
                ),
            ).toEqual("Arithmetic sum(m3, m4) Measure Title");
        });
    });
});
