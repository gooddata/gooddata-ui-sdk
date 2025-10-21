// (C) 2025 GoodData Corporation

import { ICatalogDateAttribute, IDashboardAttributeFilter, ISeparators, ObjRef } from "@gooddata/sdk-model";
import { IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

import { IKdaDataPoint, IKdaDefinition, KdaPeriodType } from "./types.js";

export interface KdaDateOptions {
    period: KdaPeriodType;
    dateAttribute?: ICatalogDateAttribute | null;
    range?: [IKdaDataPoint, IKdaDataPoint];
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
    items: KdaItem[];
}

export interface KdaState {
    //definition
    definition: IKdaDefinition | null;
    definitionStatus: "loading" | "success" | "error" | "pending";
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
