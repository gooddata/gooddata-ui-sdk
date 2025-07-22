// (C) 2021-2025 GoodData Corporation
export type { ITranslationsCustomizationContextProviderProps } from "./Context.js";
export { TranslationsCustomizationContextProvider, withTranslationsCustomization } from "./Context.js";
export type { ITranslationsCustomizationProviderProps } from "./TranslationsCustomizationProvider.js";
export { TranslationsCustomizationProvider } from "./TranslationsCustomizationProvider.js";
export {
    pickCorrectMetricWording,
    pickCorrectWording,
    removeAllWordingTranslationsWithSpecialSuffix,
} from "./utils.js";
