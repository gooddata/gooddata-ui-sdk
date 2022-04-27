// (C) 2022 GoodData Corporation

/**
 * @internal
 */
export type InsightCodeType = "definition" | "reference";

/**
 * @internal
 */
export type CodeLanguageType = "js" | "ts";

/**
 * @internal
 */
export type UnitsType = "px" | "%" | "rem" | "em";

/**
 * @internal
 */
export interface IOptionsByDefinition {
    type: "definition";
    includeConfiguration: boolean;
    customHeight: boolean;
    height?: string;
    unit?: UnitsType;
}

/**
 * @internal
 */
export interface IOptionsByReference {
    type: "reference";
    displayTitle: boolean;
    customHeight: boolean;
    height?: string;
    unit?: UnitsType;
}

export type CodeOptionType = IOptionsByDefinition | IOptionsByReference;
