// (C) 2021 GoodData Corporation

import { pickCorrectInsightWording, removeAllInsightToReportTranslations } from "../utils";
import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { ITranslations } from "../../../localization/IntlWrapper";

const mockTranslation: ITranslations = {
    "mock.translation|insight": "Insight",
    "mock.translation|report": "Report",
};

describe("pickCorrectInsightWording", () => {
    const settings: IWorkspaceSettings = {
        workspace: "workspace",
    };

    it.each([
        ["insight", false],
        ["report", true],
    ])(
        "should return translations with %s when enableInsightToReport is set to %s",
        (_value: string, enableInsightToReport: boolean) => {
            const result = pickCorrectInsightWording(mockTranslation, {
                ...settings,
                enableInsightToReport,
            });

            expect(result).toMatchSnapshot();
        },
    );
});

describe("removeAllInsightToReportTranslations", () => {
    const mockTranslationWithoutExtraWords: ITranslations = {
        "mock.translation": "Insight",
    };
    it("should remove all insight to report words", () => {
        const result = removeAllInsightToReportTranslations({
            ...mockTranslationWithoutExtraWords,
            ...mockTranslation,
        });
        expect(result).toMatchObject(mockTranslationWithoutExtraWords);
    });
});
