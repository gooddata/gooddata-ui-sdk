// (C) 2007-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDecoratedDateFilter } from "../models/date_filter.js";
import { type IDecoratedMetricAttributeFilter } from "../models/decorated_metric_attribute_filter.js";
import { type TextModeFilterData } from "../store/filter_bar/filter_bar_types.js";

// The filters collection on a decorated bucket item is an array of model objects
// (models/date_filter.js and models/decorated_metric_attribute_filter.js).
export type IDecoratedMetricFilter = IDecoratedMetricAttributeFilter | IDecoratedDateFilter;

export type IDecoratedMetricFilters = IDecoratedMetricFilter[];

// `isDate` is a literal discriminant, but strictNullChecks:false disables its control-flow
// narrowing — these predicates narrow explicitly.
export const isDecoratedDateFilter = (filter: IDecoratedMetricFilter): filter is IDecoratedDateFilter =>
    filter.isDate;

export const isDecoratedMetricAttributeFilter = (
    filter: IDecoratedMetricFilter,
): filter is IDecoratedMetricAttributeFilter => !filter.isDate;

export interface IUpdateAttributeFilterPayload {
    displayFormRef?: ObjRef;
    totalElementsCount?: number;
    /** `{title, uri}` elements */
    selectedElements?: ReadonlyArray<IElement>;
    isInverted?: boolean;
    textModeFilter?: TextModeFilterData;
}

export interface IElement {
    title: string;
    uri: string;
    available?: boolean;
    formattedTitle?: string;
}

export interface IFilterConfiguration {
    dfUri: string;
    elementUris: string[];
}
