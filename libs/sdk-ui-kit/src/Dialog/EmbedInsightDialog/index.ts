// (C) 2022 GoodData Corporation

export type {
    IOptionsByDefinition,
    InsightCodeType,
    CodeLanguageType,
    CodeOptionType,
    IOptionsByReference,
    UnitsType,
} from "./EmbedInsightDialogBase/types";

export { getDefaultOptions, getHeightWithUnits } from "./utils";

export { EmbedInsightDialogBase } from "./EmbedInsightDialogBase/EmbedInsightDialogBase";
export type { IEmbedInsightDialogBaseProps } from "./EmbedInsightDialogBase/EmbedInsightDialogBase";

export { NumericInput } from "./EmbedInsightDialogBase/components/NumericInput";
export type { INumericInputProps } from "./EmbedInsightDialogBase/components/NumericInput";

export { CodeArea } from "./EmbedInsightDialogBase/components/CodeArea";
export type { ICodeAreaProps } from "./EmbedInsightDialogBase/components/CodeArea";

export { CodeLanguageSelector } from "./EmbedInsightDialogBase/components/CodeLanguageSelector";
export type { ICodeLanguageSelectorProps } from "./EmbedInsightDialogBase/components/CodeLanguageSelector";

export { CodeOptions } from "./EmbedInsightDialogBase/components/CodeOptions";
export type { ICodeOptionsProps } from "./EmbedInsightDialogBase/components/CodeOptions";
