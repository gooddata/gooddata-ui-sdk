// (C) 2025 GoodData Corporation

import {
    type ICatalogDateAttribute,
    type IDashboardAttributeFilter,
    type ISeparators,
    type ObjRef,
} from "@gooddata/sdk-model";
import { type IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

import { type DeepReadonly, type IKdaDataPoint, type IKdaDefinition, type KdaPeriodType } from "./types.js";

export interface KdaDateOptions {
    period: KdaPeriodType;
    dateAttribute?: ICatalogDateAttribute | null;
    range?: DeepReadonly<[IKdaDataPoint, IKdaDataPoint]>;
}

export interface KdaItem {
    id: string;
    title: string;
    description: string;
    category: string;
    from: {
        value: number;
        date: string;
    };
    to: KdaItem["from"];
    attribute: ObjRef;
    displayForm: ObjRef;
    formatValue: (value: number) => string;
    //stats
    isSignificant: boolean;
    standardDeviation: number;
    mean: number;
}

export interface KdaItemGroup {
    id: string;
    title: string;
    description: string;
    attribute: ObjRef;
    displayForm: ObjRef;
    significantDrivers: KdaItem[];
    allDrivers: KdaItem[];
}

export interface KdaState {
    //definition
    definition: DeepReadonly<IKdaDefinition> | null;
    fromValue: IKdaDataPoint | undefined;
    toValue: IKdaDataPoint | undefined;
    definitionStatus: "loading" | "success" | "error" | "pending";
    //states
    attributesDropdownOpen: boolean;
    addFilterDropdownOpen: boolean;
    //settings
    separators?: ISeparators;
    //rest
    selectedTrend: ("up" | "down")[];
    selectedItem: IUiListboxInteractiveItem<KdaItem> | "summary";
    selectedStatus: "loading" | "success" | "error" | "pending";
    attributeFilters: IDashboardAttributeFilter[];
    items: IUiListboxInteractiveItem<KdaItem>[];
    itemsStatus: "loading" | "success" | "error" | "pending";
    selectedAttributes: ObjRef[];
    relevantStatus: "loading" | "success" | "error" | "pending";
    relevantAttributes: ObjRef[];
    selectedUpdated: number;
}
