// (C) 2007-2025 GoodData Corporation
import { beforeAll, describe, expect, it } from "vitest";

import { OverTimeComparisonTypes } from "../../interfaces/OverTimeComparison.js";
import { resolveMessages } from "../../localization/messagesMap.js";
import { DerivedMeasureTitleSuffixFactory } from "../DerivedMeasureTitleSuffixFactory.js";

describe("DerivedMeasureTitleSuffixFactory", () => {
    let messages: Record<string, string> = {};
    beforeAll(async () => {
        messages = await resolveMessages("en-US");
    });
    describe("getSuffix", () => {
        it("should return empty string for unknown over time comparison type", () => {
            const suffixFactory = new DerivedMeasureTitleSuffixFactory("en-US", messages);
            const suffix = suffixFactory.getSuffix(OverTimeComparisonTypes.NOTHING);
            expect(suffix).toEqual("");
        });

        it("should return correct suffix for PoP over time comparison type", () => {
            const suffixFactory = new DerivedMeasureTitleSuffixFactory("en-US", messages);
            const suffix = suffixFactory.getSuffix(OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR);
            expect(suffix).toEqual(" - SP year ago");
        });

        it("should return correct suffix for previous period over time comparison type", () => {
            const suffixFactory = new DerivedMeasureTitleSuffixFactory("en-US", messages);
            const suffix = suffixFactory.getSuffix(OverTimeComparisonTypes.PREVIOUS_PERIOD);
            expect(suffix).toEqual(" - period ago");
        });
    });
});
