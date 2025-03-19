// (C) 2007-2024 GoodData Corporation
import memoize from "memoize-one";
import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { defaultImport } from "default-import";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const memoizeOne = defaultImport(memoize);

const getNewKey = (key: string, stringToRemove: string) => key.replace(stringToRemove, "");

const pickCorrectInsightWordingInner = (
    translations: Record<string, string>,
    isEnabledInsightToReport: boolean,
): Record<string, string> => {
    const modifiedTranslations: Record<string, string> = {};
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
    const modifiedTranslations: Record<string, string> = {};
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
    const isEnabledRenamingMeasureToMetric = settings?.enableRenamingMeasureToMetric ?? true;

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
): Record<string, string> =>
    Object.fromEntries(
        Object.entries(translations).filter(([key]) => !key.includes("|report") && !key.includes("|insight")),
    );

/**
 * The function to remove all translation keys that contain special suffixes "|report", "|insight", "._measure" or "._metric"
 * @beta
 */
export const removeAllWordingTranslationsWithSpecialSuffix = (
    translations: Record<string, string>,
): Record<string, string> =>
    Object.fromEntries(
        Object.entries(translations).filter(
            ([key]) =>
                !key.includes("|report") &&
                !key.includes("|insight") &&
                !key.includes("._measure") &&
                !key.includes("._metric"),
        ),
    );
