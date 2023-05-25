// (C) 2021-2022 GoodData Corporation
export {
    ITranslationsCustomizationContextProviderProps,
    TranslationsCustomizationContextProvider,
    withTranslationsCustomization,
} from "./Context.js";
export {
    ITranslationsCustomizationProviderProps,
    TranslationsCustomizationProvider,
} from "./TranslationsCustomizationProvider.js";
export {
    pickCorrectInsightWording,
    pickCorrectMetricWording,
    pickCorrectWording,
    removeAllInsightToReportTranslations,
    removeAllWordingTranslationsWithSpecialSuffix,
} from "./utils.js";
