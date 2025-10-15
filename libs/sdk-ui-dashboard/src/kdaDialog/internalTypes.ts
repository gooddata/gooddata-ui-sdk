// (C) 2025 GoodData Corporation

import { ICatalogDateAttribute, IDashboardAttributeFilter, ISeparators, ObjRef } from "@gooddata/sdk-model";
import { IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

import { IKdaDataPoint, IKdaDefinition, KdaPeriodType } from "./types.js";

export interface KdaDateOptions {
    period: KdaPeriodType;
    dateAttribute?: ICatalogDateAttribute;
    range?: [IKdaDataPoint, IKdaDataPoint];
}

export interface KdaAttributeFilter {
    attributeFilter: IDashboardAttributeFilter;
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
    formatValue: (value: number) => string;
    drivers: number;
}

export interface KdaState {
    //definition
    definition: IKdaDefinition | null;
    definitionStatus: "loading" | "success" | "error" | "pending";
    //settings
    separators?: ISeparators;
    //rest
    selectedTrend: "up" | "down";
    selectedItem: IUiListboxInteractiveItem<KdaItem> | "summary";
    selectedStatus: "loading" | "success" | "error" | "pending";
    attributeFilters: KdaAttributeFilter[];
    items: IUiListboxInteractiveItem<KdaItem>[];
    itemsStatus: "loading" | "success" | "error" | "pending";
    combinations: number;
    selectedAttributes: ObjRef[];
}
