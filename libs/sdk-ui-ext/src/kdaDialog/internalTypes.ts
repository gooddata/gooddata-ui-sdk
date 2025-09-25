// (C) 2025 GoodData Corporation

import { IAttributeFilter, IDateFilter, IMeasure } from "@gooddata/sdk-model";
import { IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

export interface KdaMetric {
    title: string;
    metric?: IMeasure;
}

export interface KdaDateFilter {
    title: string;
    dateFilter?: IDateFilter;
}

export interface KdaAttributeFilter {
    title: string;
    attributeFilter?: IAttributeFilter;
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
    rootItem: KdaItem;
    rootStatus: "loading" | "success" | "error" | "pending";
    selectedTrend: "up" | "down";
    selectedItem: IUiListboxInteractiveItem<KdaItem> | "summary";
    selectedStatus: "loading" | "success" | "error" | "pending";
    metric: KdaMetric | null;
    dateFilter: KdaDateFilter | null;
    attributeFilter: KdaAttributeFilter | null;
    items: IUiListboxInteractiveItem<KdaItem>[];
    itemsStatus: "loading" | "success" | "error" | "pending";
    combinations: number;
    attributes: number;
}
