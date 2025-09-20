// (C) 2007-2025 GoodData Corporation

import { defaultImport } from "default-import";
import memoize from "memoize-one";

import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const memoizeOne = defaultImport(memoize);

const getNewKey = (key: string, stringToRemove: string) => key.replace(stringToRemove, "");

/**
 * @internal
 */
export const pickCorrectMetricWordingInner = (
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
): Record<string, string> => pickCorrectMetricWording(translations, settings);

/**
 * The function to remove all translation keys that contain special suffixes "._measure" or "._metric"
 * @beta
 */
export const removeAllWordingTranslationsWithSpecialSuffix = (
    translations: Record<string, string>,
): Record<string, string> =>
    Object.fromEntries(
        Object.entries(translations).filter(
            ([key]) => !key.includes("._measure") && !key.includes("._metric"),
        ),
    );
