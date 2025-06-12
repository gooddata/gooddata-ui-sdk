// (C) 2021-2024 GoodData Corporation
export type { ITranslationsCustomizationContextProviderProps } from "./Context.js";
export { TranslationsCustomizationContextProvider, withTranslationsCustomization } from "./Context.js";
export type { ITranslationsCustomizationProviderProps } from "./TranslationsCustomizationProvider.js";
export { TranslationsCustomizationProvider } from "./TranslationsCustomizationProvider.js";
export {
    pickCorrectInsightWording,
    pickCorrectMetricWording,
    pickCorrectWording,
    removeAllInsightToReportTranslations,
    removeAllWordingTranslationsWithSpecialSuffix,
} from "./utils.js";
