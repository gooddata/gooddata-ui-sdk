// (C) 2020-2026 GoodData Corporation

import { type ReactNode } from "react";

import { type ObjRefInScope, type RankingFilterOperator } from "@gooddata/sdk-model";

export interface IOperatorDropdownItem {
    value: RankingFilterOperator;
    translationId: string;
    /**
     * Whether this condition uses the strict limit of rows (exactly N, no ties). Only relevant when the
     * ranking strict-limit feature is enabled; in that mode each operator has a strict and a "with ties" variant.
     */
    strictLimitOfRows?: boolean;
    /**
     * Optional explanatory tooltip shown next to the item (used by the "with ties" variants).
     */
    tooltipId?: string;
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

/**
 * Props passed to a custom renderer for the ranking filter measure dropdown body.
 *
 * @beta
 */
export interface IRankingMeasureDropdownBodyRenderProps {
    /**
     * The currently selected ranked measure.
     */
    selectedItemRef: ObjRefInScope;
    /**
     * Selects a measure and closes the dropdown.
     */
    onSelect: (ref: ObjRefInScope) => void;
    /**
     * Closes the dropdown without changing the selection.
     */
    onClose: () => void;
}

/**
 * Optional renderer that replaces the built-in flat measure list of the ranking filter measure
 * dropdown with a custom body (e.g. a grouped, searchable catalog picker). The anchor button is kept;
 * only the dropdown overlay content is replaced.
 *
 * @beta
 */
export type RenderMeasureDropdownBody = (props: IRankingMeasureDropdownBodyRenderProps) => ReactNode;
