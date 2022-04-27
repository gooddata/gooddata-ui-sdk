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
export const UNITS: UnitsType[] = ["px", "%", "rem", "em"];

/**
 * @internal
 */
export type UnitMap = {
    [key in UnitsType]: string;
};

/**
 * @internal
 */
export const DEFAULT_UNIT: UnitsType = "px";

/**
 * @internal
 */
export const DEFAULT_HEIGHT: UnitMap = {
    px: "400",
    "%": "50",
    rem: "25",
    em: "25",
};

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

/**
 * @internal
 */
export type CodeOptionType = IOptionsByDefinition | IOptionsByReference;
