// (C) 2021-2022 GoodData Corporation
export {
    ITranslationsCustomizationContextProviderProps,
    TranslationsCustomizationContextProvider,
    withTranslationsCustomization,
} from "./Context";
export {
    ITranslationsCustomizationProviderProps,
    TranslationsCustomizationProvider,
} from "./TranslationsCustomizationProvider";
export {
    pickCorrectInsightWording,
    pickCorrectMetricWording,
    pickCorrectWording,
    removeAllInsightToReportTranslations,
    removeAllWordingTranslationsWithSpecialSuffix,
} from "./utils";
