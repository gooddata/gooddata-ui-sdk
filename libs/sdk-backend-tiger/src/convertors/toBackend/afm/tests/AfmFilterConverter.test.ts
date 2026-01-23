// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    type IFilter,
    type MeasureValueFilterCondition,
    localIdRef,
    newMeasure,
    newMeasureValueFilter,
    newPositiveAttributeFilter,
    newRankingFilter,
} from "@gooddata/sdk-model";

import { convertAfmFilters } from "../AfmFiltersConverter.js";

describe("convertAfmFilters", () => {
    const ratioMeasure = newMeasure("test", (m) => m.localId("ratio").ratio(true));
    const nonRatioMeasure = newMeasure("test", (m) => m.localId("nonRatio").ratio(false));
    const afmMeasures = [ratioMeasure, nonRatioMeasure];

    it("should transform measure based filter of ratio measure", () => {
        const ratioFilter = newMeasureValueFilter("ratio", "GREATER_THAN", 128);
        expect(convertAfmFilters(afmMeasures, [ratioFilter])).toMatchSnapshot();
    });

    it("should not transform measure based filter of non-ratio measure", () => {
        const nonRatioFilter = newRankingFilter(
            "nonRatio",
            [ReferenceMd.IsActive.attribute.displayForm],
            "TOP",
            3,
        );
        expect(convertAfmFilters(afmMeasures, [nonRatioFilter])).toMatchSnapshot();
    });

    it("should keep non-measure based filter", () => {
        const positiveAttributeFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, ["value"]);
        expect(convertAfmFilters(afmMeasures, [positiveAttributeFilter])).toMatchSnapshot();
    });

    it("should convert compound measure value filter (conditions[]) to backend compoundMeasureValueFilter", () => {
        const conditions: MeasureValueFilterCondition[] = [
            { comparison: { operator: "GREATER_THAN", value: 128 } },
            { range: { operator: "BETWEEN", from: 10, to: 20 } },
        ];

        const compoundFilter: IFilter = {
            measureValueFilter: {
                measure: localIdRef("ratio"),
                conditions,
            },
        };

        const result = convertAfmFilters(afmMeasures, [compoundFilter]);

        // compute ratio MVFs are applied on source data (applyOnResult=false) and are re-bound to numerator measure
        expect(result.filters).toMatchObject([
            {
                compoundMeasureValueFilter: {
                    applyOnResult: false,
                    measure: { localIdentifier: "m_test" },
                    conditions: [
                        { comparison: { operator: "GREATER_THAN", value: 128 } },
                        { range: { operator: "BETWEEN", from: 10, to: 20 } },
                    ],
                },
            },
        ]);
    });
});
