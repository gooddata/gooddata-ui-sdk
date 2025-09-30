// (C) 2025 GoodData Corporation

import { IDashboardAttributeFilter, IMeasure } from "@gooddata/sdk-model";
import { IUiListboxInteractiveItem } from "@gooddata/sdk-ui-kit";

export interface KdaMetric {
    title: string;
    metric?: IMeasure;
}

export interface KdaDateFilter {
    title: string;
    selectedPeriod: "same_period_previous_year" | "previous_period";
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
    rootItem: KdaItem | null;
    rootStatus: "loading" | "success" | "error" | "pending";
    selectedTrend: "up" | "down";
    selectedItem: IUiListboxInteractiveItem<KdaItem> | "summary";
    selectedStatus: "loading" | "success" | "error" | "pending";
    metric: KdaMetric | null;
    dateFilters: KdaDateFilter[];
    attributeFilters: KdaAttributeFilter[];
    items: IUiListboxInteractiveItem<KdaItem>[];
    itemsStatus: "loading" | "success" | "error" | "pending";
    combinations: number;
    attributes: number;
}
