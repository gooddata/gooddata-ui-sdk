// (C) 2022-2024 GoodData Corporation

import { ILocale } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export type EmbedType = "react" | "webComponents";

/**
 * @internal
 */
export type InsightCodeType = "definition" | "reference";

/**
 * @internal
 */
export type InsightComponentType = "programmatic" | "referential";

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
export const LOCALES: ILocale[] = [
    "en-US",
    "de-DE",
    "es-ES",
    "fr-FR",
    "ja-JP",
    "nl-NL",
    "pt-BR",
    "pt-PT",
    "zh-Hans",
    "ru-RU",
    "it-IT",
    "es-419",
    "fr-CA",
    "en-GB",
];
export const DEFAULT_LOCALE = "en-US";

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
export type CopyCodeOriginType = "keyboard" | "button";

/**
 * @internal
 */
export interface IReactOptions {
    type: "react";
    componentType: InsightCodeType;
    codeType: CodeLanguageType;
    displayConfiguration: boolean;
    customHeight: boolean;
    height?: string;
    unit?: UnitsType;
}

/**
 * @internal
 */
export interface IWebComponentsOptions {
    type: "webComponents";
    displayTitle: boolean;
    customTitle: boolean;
    allowLocale: boolean;
    locale?: ILocale;
    customHeight: boolean;
    height?: string;
    unit?: UnitsType;
}

/**
 * @internal
 */
export type EmbedOptionsType = IReactOptions | IWebComponentsOptions;
