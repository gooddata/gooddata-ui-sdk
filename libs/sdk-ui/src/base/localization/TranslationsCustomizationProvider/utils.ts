// (C) 2007-2022 GoodData Corporation
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

const pickCorrectMetricWordingInner = (
    translations: Record<string, string>,
    isEnabledRenamingMeasureToMetric: boolean,
): Record<string, string> => {
    const modifiedTranslations = {};
    Object.keys(translations).forEach((key) => {
        if (key.includes("._metric") || key.includes("._measure")) {
            const newKey = getNewKey(key, isEnabledRenamingMeasureToMetric ? "._metric" : "._measure");
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
const memoizedPickCorrectMetricWordingInner = memoizeOne(pickCorrectMetricWordingInner);

/**
 * The function to pick correct wording 'measure' or 'metric'
 * @beta
 */
export const pickCorrectMetricWording = (
    translations: Record<string, string>,
    settings?: IWorkspaceSettings,
): Record<string, string> => {
    const isEnabledRenamingMeasureToMetric = !!settings?.enableRenamingMeasureToMetric;

    return memoizedPickCorrectMetricWordingInner(translations, isEnabledRenamingMeasureToMetric);
};

/**
 * @beta
 */
export const pickCorrectWording = (
    translations: Record<string, string>,
    settings?: IWorkspaceSettings,
): Record<string, string> =>
    pickCorrectMetricWording(pickCorrectInsightWording(translations, settings), settings);

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

/**
 * The function to remove all translation keys that contain special suffixes "|report", "|insight", "._measure" or "._metric"
 * @beta
 */
export const removeAllWordingTranslationsWithSpecialSuffix = (
    translations: Record<string, string>,
): Record<string, string> => {
    Object.keys(translations).forEach((key) => {
        if (
            key.includes("|report") ||
            key.includes("|insight") ||
            key.includes("._measure") ||
            key.includes("._metric")
        ) {
            delete translations[key];
        }
    });

    return {
        ...translations,
    };
};
