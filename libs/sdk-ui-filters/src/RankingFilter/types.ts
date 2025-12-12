// (C) 2020-2025 GoodData Corporation
import { type ObjRefInScope, type RankingFilterOperator } from "@gooddata/sdk-model";

export interface IOperatorDropdownItem {
    value: RankingFilterOperator;
    translationId: string;
}

/**
 * @beta
 */
export interface IAttributeDropdownItem {
    title: string;
    ref: ObjRefInScope;
    type?: "DATE" | "ATTRIBUTE";
}

/**
 * @beta
 */
export interface IMeasureDropdownItem {
    title: string;
    ref: ObjRefInScope;
    sequenceNumber?: string;
}

/**
 * @beta
 */
export interface ICustomGranularitySelection {
    enable: boolean;
    warningMessage: string;
}
