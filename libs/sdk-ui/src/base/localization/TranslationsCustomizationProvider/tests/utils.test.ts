// (C) 2021-2025 GoodData Corporation

import { pickCorrectMetricWording, removeAllWordingTranslationsWithSpecialSuffix } from "../utils.js";
import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { ITranslations } from "../../messagesMap.js";
import { describe, expect, it } from "vitest";

const mockMetricTranslation: ITranslations = {
    "mock.translation._measure": "Measure",
    "mock.translation._metric": "Metric",
};

describe("pickCorrectMetricWording", () => {
    const settings: IWorkspaceSettings = {
        workspace: "workspace",
    };

    it.each([
        ["measure", false],
        ["metric", true],
        ["metric", undefined], // default should be true
    ])(
        "should return translations with %s when enableRenamingMeasureToMetric is set to %s",
        (_value: string, enableRenamingMeasureToMetric: boolean | undefined) => {
            const result = pickCorrectMetricWording(mockMetricTranslation, {
                ...settings,
                enableRenamingMeasureToMetric,
            });

            expect(result).toMatchSnapshot();
        },
    );
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
