// (C) 2022-2026 GoodData Corporation

export type {
    IReactOptions,
    IWebComponentsOptions,
    EmbedType,
    EmbedOptionsType,
    InsightCodeType,
    CodeLanguageType,
    UnitsType,
    CopyCodeOriginType,
} from "./EmbedInsightDialogBase/types.js";

export { getDefaultEmbedTypeOptions, getHeightWithUnitsForEmbedCode } from "./utils.js";

export {
    EmbedInsightDialogBase,
    type IEmbedInsightDialogBaseProps,
} from "./EmbedInsightDialogBase/EmbedInsightDialogBase.js";

export { NumericInput, type INumericInputProps } from "./EmbedInsightDialogBase/components/NumericInput.js";

export { CodeArea, type ICodeAreaProps } from "./EmbedInsightDialogBase/components/CodeArea.js";

export {
    CodeLanguageSelect,
    type ICodeLanguageSelectProps,
} from "./EmbedInsightDialogBase/components/CodeLanguageSelect.js";

export { CodeOptions, type ICodeOptionsProps } from "./EmbedInsightDialogBase/components/CodeOptions.js";

export {
    LocaleSetting,
    type ILocaleSettingProps,
} from "./EmbedInsightDialogBase/components/LocaleSetting.js";
