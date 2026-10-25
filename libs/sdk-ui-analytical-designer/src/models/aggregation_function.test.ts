// (C) 2007-2026 GoodData Corporation

import { type IntlShape } from "react-intl";
// @vitest-environment node
import { describe, expect, it } from "vitest";

import { getTranslatedApplicableAggregationFunctions } from "./aggregation_function.js";

describe("aggregationFunction", () => {
    const FACT = "fact";
    const ATTRIBUTE = "attribute";
    const MAX_AGGREGATION = {
        functionName: "max",
        applicableTo: FACT,
    };
    const COUNT_AGGREGATION = {
        functionName: "count",
        applicableTo: ATTRIBUTE,
    };

    const aggregations = [MAX_AGGREGATION, COUNT_AGGREGATION];

    const formatMessage = ({ id }: { id: string }) => id;

    it("should translate and filter by applicability", () => {
        const result = getTranslatedApplicableAggregationFunctions(
            FACT,
            formatMessage as IntlShape["formatMessage"],
            aggregations,
        );

        expect(result).toEqual([
            {
                ...MAX_AGGREGATION,
                title: "aggregations.title.max",
            },
        ]);
    });
});
