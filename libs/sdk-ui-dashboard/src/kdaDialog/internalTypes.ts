// (C) 2025-2026 GoodData Corporation

import {
    type ICatalogDateAttribute,
    type IDashboardAttributeFilter,
    type ISeparators,
    type ObjRef,
} from "@gooddata/sdk-model";
import { type IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

import { type DeepReadonly, type IKdaDataPoint, type IKdaDefinition, type KdaPeriodType } from "./types.js";

export interface IKdaDateOptions {
    period: KdaPeriodType;
    dateAttribute?: ICatalogDateAttribute | null;
    range?: DeepReadonly<[IKdaDataPoint, IKdaDataPoint]>;
}

export interface IKdaItem {
    id: string;
    title: string;
    description: string;
    category: string;
    from: {
        value: number;
        date: string;
    };
    to: IKdaItem["from"];
    attribute: ObjRef;
    displayForm: ObjRef;
    formatValue: (value: number) => string;
    //stats
    isSignificant: boolean;
    standardDeviation: number;
    mean: number;
}

export interface IKdaItemGroup {
    id: string;
    title: string;
    description: string;
    attribute: ObjRef;
    displayForm: ObjRef;
    significantDrivers: IKdaItem[];
    allDrivers: IKdaItem[];
}

export interface IKdaState {
    //definition
    definition: DeepReadonly<IKdaDefinition> | null;
    fromValue: IKdaDataPoint | undefined;
    toValue: IKdaDataPoint | undefined;
    definitionStatus: KdaAsyncStatus;
    //ui
    isMinimized: boolean;
    //states
    attributesDropdownOpen: boolean;
    addFilterDropdownOpen: boolean;
    //settings
    separators?: ISeparators;
    //rest
    selectedTrend: ("up" | "down")[];
    selectedItem: IUiListboxInteractiveItem<IKdaItem> | "summary";
    selectedStatus: KdaAsyncStatus;
    selectedError: Error | undefined;
    attributeFilters: IDashboardAttributeFilter[];
    items: IUiListboxInteractiveItem<IKdaItem>[];
    itemsStatus: KdaAsyncStatus;
    itemsError: Error | undefined;
    selectedAttributes: ObjRef[];
    relevantStatus: KdaAsyncStatus;
    relevantAttributes: ObjRef[];
    selectedUpdated: number;
    includeTags: string[] | undefined;
    excludeTags: string[] | undefined;
}

export type KdaAsyncStatus = "loading" | "success" | "error" | "pending";
