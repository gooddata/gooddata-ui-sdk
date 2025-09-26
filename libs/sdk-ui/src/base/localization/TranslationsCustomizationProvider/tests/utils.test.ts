// (C) 2021-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ITranslations } from "../../messagesMap.js";
import { pickCorrectMetricWording, removeAllWordingTranslationsWithSpecialSuffix } from "../utils.js";

const mockMetricTranslation: ITranslations = {
    "mock.translation._measure": "Measure",
    "mock.translation._metric": "Metric",
};

describe("pickCorrectMetricWording", () => {
    it("should return translations with metric", () => {
        const result = pickCorrectMetricWording(mockMetricTranslation);

        expect(result).toMatchSnapshot();
    });
});

describe("removeAllWordingTranslationsWithSpecialSuffix", () => {
    const mockTranslationWithoutExtraWords: ITranslations = {
        "mock.translation": "Translation",
        "mock.translation.metric": "Standard",
    };

    it("should remove all measure and metric suffix words", () => {
        const result = removeAllWordingTranslationsWithSpecialSuffix({
            ...mockTranslationWithoutExtraWords,
            ...mockMetricTranslation,
            "mock.translation.metric._measure": "Measure",
            "mock.translation.metric._metric": "Metric",
        });
        expect(result).toMatchObject(mockTranslationWithoutExtraWords);
    });
});
