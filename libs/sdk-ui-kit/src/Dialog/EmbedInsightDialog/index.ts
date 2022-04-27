// (C) 2022 GoodData Corporation

export { EmbedInsightDialogBase } from "./EmbedInsightDialogBase/EmbedInsightDialogBase";
export type { IEmbedInsightDialogBaseProps } from "./EmbedInsightDialogBase/EmbedInsightDialogBase";

export type {
    IOptionsByDefinition,
    InsightCodeType,
    CodeLanguageType,
    CodeOptionType,
    IOptionsByReference,
    UnitsType,
} from "./EmbedInsightDialogBase/types";

export { NumericInput } from "./EmbedInsightDialogBase/components/NumericInput";
export type { INumericInputProps } from "./EmbedInsightDialogBase/components/NumericInput";

export { getDefaultOptions, getHeightWithUnits } from "./utils";
