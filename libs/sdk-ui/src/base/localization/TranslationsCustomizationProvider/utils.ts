// (C) 2007-2021 GoodData Corporation
import memoizeOne from "memoize-one";
import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";

const getNewKey = (key: string, stringToRemove: string) => key.replace(stringToRemove, "");

const pickCorrectInsightWordingInner = (
    translations: Record<string, string>,
    isEnabledInsightToReport: boolean,
): Record<string, string> => {
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

/**
 * Even this simple translations-reference-based cache is very effective as most of the time the 'translations'
 * objects come from some static constant.
 */
const memoizedPickCorrectInsightWordingInner = memoizeOne(pickCorrectInsightWordingInner);

/**
 * @beta
 */
export const pickCorrectInsightWording = (
    translations: Record<string, string>,
    settings?: IWorkspaceSettings,
): Record<string, string> => {
    const isEnabledInsightToReport = !!settings?.enableInsightToReport;

    return memoizedPickCorrectInsightWordingInner(translations, isEnabledInsightToReport);
};

/**
 * @beta
 */
export const removeAllInsightToReportTranslations = (
    translations: Record<string, string>,
): Record<string, string> => {
    Object.keys(translations).forEach((key) => {
        if (key.includes("|report") || key.includes("|insight")) {
            delete translations[key];
        }
    });
    return {
        ...translations,
    };
};
