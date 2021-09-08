// (C) 2007-2021 GoodData Corporation
import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";

const getNewKey = (key: string, stringToRemove: string) => key.replace(stringToRemove, "");

/**
 * @beta
 */
export const pickCorrectInsightWording = (
    translations: Record<string, string>,
    settings?: IWorkspaceSettings,
): Record<string, string> => {
    const isEnabledInsightToReport = !!settings?.enableInsightToReport;
    const modifiedTranslations = {};
    Object.keys(translations).forEach((key) => {
        if (key.includes("|report") || key.includes("|insight")) {
            const newKey = getNewKey(key, isEnabledInsightToReport ? "|report" : "|insight");
            modifiedTranslations[newKey] = translations[key];
        }
    });
    return {
        ...translations,
        ...modifiedTranslations,
    };
};
