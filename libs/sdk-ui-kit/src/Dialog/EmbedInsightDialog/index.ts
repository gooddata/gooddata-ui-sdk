// (C) 2022-2023 GoodData Corporation

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

export { EmbedInsightDialogBase } from "./EmbedInsightDialogBase/EmbedInsightDialogBase.js";
export type { IEmbedInsightDialogBaseProps } from "./EmbedInsightDialogBase/EmbedInsightDialogBase.js";

export { NumericInput } from "./EmbedInsightDialogBase/components/NumericInput.js";
export type { INumericInputProps } from "./EmbedInsightDialogBase/components/NumericInput.js";

export { CodeArea } from "./EmbedInsightDialogBase/components/CodeArea.js";
export type { ICodeAreaProps } from "./EmbedInsightDialogBase/components/CodeArea.js";

export { CodeLanguageSelect } from "./EmbedInsightDialogBase/components/CodeLanguageSelect.js";
export type { ICodeLanguageSelectProps } from "./EmbedInsightDialogBase/components/CodeLanguageSelect.js";

export { CodeOptions } from "./EmbedInsightDialogBase/components/CodeOptions.js";
export type { ICodeOptionsProps } from "./EmbedInsightDialogBase/components/CodeOptions.js";

export { LocaleSetting } from "./EmbedInsightDialogBase/components/LocaleSetting.js";
export type { ILocaleSettingProps } from "./EmbedInsightDialogBase/components/LocaleSetting.js";
