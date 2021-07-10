// (C) 2021 GoodData Corporation

import { newArithmeticMeasure, newMeasure, newPopMeasure } from "@gooddata/sdk-model";
import { filterMeasuresForAvailabilityQuery } from "../availableItemsQueryUtils";

describe("filterMeasuresForAvailabilityQuery", () => {
    const simpleMeasure1 = newMeasure("foo");
    const simpleMeasure2 = newMeasure("bar");

    const arithmeticMeasure = newArithmeticMeasure([simpleMeasure1, simpleMeasure2], "ratio");

    it("should remove arithmetic measure", () => {
        expect(
            filterMeasuresForAvailabilityQuery([simpleMeasure1, simpleMeasure2, arithmeticMeasure]),
        ).toEqual([simpleMeasure1, simpleMeasure2]);
    });

    it("should remove PoP measure derived from arithmetic measure", () => {
        const derived = newPopMeasure(arithmeticMeasure, "some-attr");

        expect(
            filterMeasuresForAvailabilityQuery([simpleMeasure1, simpleMeasure2, arithmeticMeasure, derived]),
        ).toEqual([simpleMeasure1, simpleMeasure2]);
    });

    it("should remove PoP measure derived from a measure that is not in the list", () => {
        const derived = newPopMeasure("non-existent-local-id", "some-attr");

        expect(filterMeasuresForAvailabilityQuery([simpleMeasure1, simpleMeasure2, derived])).toEqual([
            simpleMeasure1,
            simpleMeasure2,
        ]);
    });
});
