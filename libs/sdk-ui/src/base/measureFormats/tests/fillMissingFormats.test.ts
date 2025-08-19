// (C) 2007-2025 GoodData Corporation
import { describe, expect, it } from "vitest";

import { IInsight, idMatchMeasure, insightMeasures, measureFormat } from "@gooddata/sdk-model";

import { insightWithMultipleMeasureBucketsAndFormats } from "../../../../__mocks__/fixtures.js";
import { fillMissingFormats } from "../fillMissingFormats.js";

describe("fillMissingFormats", () => {
    function getMeasureFormat(insight: IInsight, localIdentifier: string): string | undefined {
        const measures = insightMeasures(insight);
        const matchingMeasure = measures.find(idMatchMeasure(localIdentifier));

        return matchingMeasure === undefined ? undefined : measureFormat(matchingMeasure);
    }

    it("should fill format on measure that has property `computeRatio` nad not format", () => {
        const result = fillMissingFormats(insightWithMultipleMeasureBucketsAndFormats);

        expect(getMeasureFormat(result, "count")).toBe(undefined);
        expect(getMeasureFormat(result, "count_format")).toBe("#0x");
        expect(getMeasureFormat(result, "count_relative")).toBe("#,##0.00%");
    });
});
