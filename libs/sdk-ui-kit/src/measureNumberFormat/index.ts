// (C) 2020-2025 GoodData Corporation

export * from "./typings.js";
export type { IMeasureNumberFormatOwnProps } from "./MeasureNumberFormat.js";
export { MeasureNumberFormat } from "./MeasureNumberFormat.js";
export {
    validateCurrencyFormat,
    isCurrencyFormat,
    type CurrencyFormatValidationErrorCode,
    type ICurrencyFormatValidationError,
    type ICurrencyFormatValidationOptions,
    type ICurrencyFormatValidationResult,
} from "./validation/currencyFormatValidator.js";
export { useCurrencyFormatDefaults } from "./hooks/useCurrencyFormatDefaults.js";
export type { UseCurrencyFormatDefaultsConfig } from "./hooks/useCurrencyFormatDefaults.js";
export {
    createCurrencyPresets,
    CURRENCY_PRESET_DEFINITIONS,
    CURRENCY_SHORTENED_FORMAT,
    type ICurrencyPresetDefinition,
} from "./presets/currencyPresets.js";
export {
    createStandardPresets,
    STANDARD_PRESET_DEFINITIONS,
    type IStandardPresetDefinition,
} from "./presets/standardPresets.js";
export {
    createTemplates,
    createAllTemplates,
    createAdvancedTemplates,
    STANDARD_TEMPLATE_DEFINITIONS,
    CURRENCY_TEMPLATE_DEFINITIONS,
    ADVANCED_TEMPLATE_DEFINITIONS,
    CURRENCY_TEMPLATE_IDS,
    DEFAULT_TEMPLATE_PREFIX,
    type ITemplateDefinition,
} from "./presets/templates.js";
export {
    useMetricTypePresets,
    useStandardPresets,
    useFormatTemplates,
    type UseMetricTypePresetsConfig,
    type UseMetricTypePresetsResult,
} from "./hooks/useMetricTypePresets.js";
