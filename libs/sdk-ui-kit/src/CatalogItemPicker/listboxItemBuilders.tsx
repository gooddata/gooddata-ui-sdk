// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { bem } from "../@ui/@utils/bem.js";
import { type IUiListboxItem, type IUiListboxStaticItem } from "../@ui/UiListbox/types.js";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner.js";

import { type ICatalogItemPickerItem } from "./types.js";

const { e } = bem("gd-ui-kit-catalog-item-picker");

export interface ICatalogItemPickerListItemData<TPayload = unknown> {
    item: ICatalogItemPickerItem<TPayload>;
    isSelected: boolean;
}

export type CatalogItemListboxItem<TPayload = unknown> = IUiListboxItem<
    ICatalogItemPickerListItemData<TPayload>
>;

export function buildSectionHeader(
    id: string,
    title: string,
    variant: "mvf" | "addFilter",
): IUiListboxStaticItem<ReactNode> {
    return {
        type: "static",
        id,
        data: <div className={e("section-header", { variant })}>{title}</div>,
    };
}

export function buildDivider(variant: "mvf" | "addFilter"): IUiListboxStaticItem<ReactNode> {
    return {
        type: "static",
        id: "divider-visualization-catalog",
        data: <div className={e("divider", { variant })} />,
    };
}

export function buildLoadingRow(variant: "mvf" | "addFilter"): IUiListboxStaticItem<ReactNode> {
    return {
        type: "static",
        id: "catalog-loading-row",
        data: (
            <div className={e("loading-row", { variant })}>
                <LoadingSpinner className="small" />
            </div>
        ),
    };
}

export interface IBuildMetricListboxItemsParams<TPayload = unknown> {
    metricInsightItems: ICatalogItemPickerItem<TPayload>[];
    groupedMetricCatalogItems: Array<{ title: string; items: ICatalogItemPickerItem<TPayload>[] }>;
    fromVisualizationTitle: string | null;
    variant: "mvf" | "addFilter";
    makeInteractiveItem: (item: ICatalogItemPickerItem<TPayload>) => CatalogItemListboxItem<TPayload>;
}

export function buildMetricListboxItems<TPayload>(
    params: IBuildMetricListboxItemsParams<TPayload>,
): CatalogItemListboxItem<TPayload>[] {
    const items: CatalogItemListboxItem<TPayload>[] = [];
    const {
        metricInsightItems,
        groupedMetricCatalogItems,
        fromVisualizationTitle,
        variant,
        makeInteractiveItem,
    } = params;

    const hasVisualizationItems = metricInsightItems.length > 0;
    const hasCatalogItems = groupedMetricCatalogItems.some((group) => group.items.length > 0);

    if (hasVisualizationItems) {
        items.push(buildSectionHeader("header-visualization", fromVisualizationTitle ?? "", variant));
    }

    metricInsightItems.forEach((item) => items.push(makeInteractiveItem(item)));

    if (hasVisualizationItems && hasCatalogItems) {
        items.push(buildDivider(variant));
    }

    groupedMetricCatalogItems.forEach((group, index) => {
        items.push(buildSectionHeader(`header-group-${index}`, group.title, variant));
        group.items.forEach((item) => items.push(makeInteractiveItem(item)));
    });

    return items;
}

export interface IBuildDateListboxItemsParams<TPayload = unknown> {
    filteredInsightItems: ICatalogItemPickerItem<TPayload>[];
    filteredCatalogItems: ICatalogItemPickerItem<TPayload>[];
    shouldShowDateDatasetSelector: boolean;
    shouldShowCatalogLoadingRow: boolean;
    hasCatalogItems: boolean;
    fromVisualizationTitle: string | null;
    variant: "mvf" | "addFilter";
    dateDatasetSelectorItem?: CatalogItemListboxItem<TPayload>;
    makeInteractiveItem: (item: ICatalogItemPickerItem<TPayload>) => CatalogItemListboxItem<TPayload>;
}

export function buildDateListboxItems<TPayload>(
    params: IBuildDateListboxItemsParams<TPayload>,
): CatalogItemListboxItem<TPayload>[] {
    const items: CatalogItemListboxItem<TPayload>[] = [];
    const {
        filteredInsightItems,
        filteredCatalogItems,
        shouldShowDateDatasetSelector,
        shouldShowCatalogLoadingRow,
        hasCatalogItems,
        fromVisualizationTitle,
        variant,
        dateDatasetSelectorItem,
        makeInteractiveItem,
    } = params;

    const hasInsightItems = filteredInsightItems.length > 0;
    const shouldRenderDividerBetweenSections =
        hasInsightItems && (hasCatalogItems || shouldShowDateDatasetSelector || shouldShowCatalogLoadingRow);

    if (hasInsightItems) {
        items.push(buildSectionHeader("header-visualization", fromVisualizationTitle ?? "", variant));
    }
    filteredInsightItems.forEach((item) => items.push(makeInteractiveItem(item)));

    if (shouldRenderDividerBetweenSections) {
        items.push(buildDivider(variant));
    }

    if (dateDatasetSelectorItem) {
        items.push(dateDatasetSelectorItem);
    }
    filteredCatalogItems.forEach((item) => items.push(makeInteractiveItem(item)));

    if (shouldShowCatalogLoadingRow && filteredCatalogItems.length === 0) {
        items.push(buildLoadingRow(variant));
    }

    return items;
}

export interface IBuildAttributeOnlyListboxItemsParams<TPayload = unknown> {
    filteredInsightItems: ICatalogItemPickerItem<TPayload>[];
    catalogItemsByDataset: Map<string, { title: string; items: ICatalogItemPickerItem<TPayload>[] }>;
    ungroupedCatalogItems: ICatalogItemPickerItem<TPayload>[];
    shouldShowCatalogLoadingRow: boolean;
    fromVisualizationTitle: string | null;
    ungroupedTitle: string;
    variant: "mvf" | "addFilter";
    makeInteractiveItem: (item: ICatalogItemPickerItem<TPayload>) => CatalogItemListboxItem<TPayload>;
}

export function buildAttributeOnlyListboxItems<TPayload>(
    params: IBuildAttributeOnlyListboxItemsParams<TPayload>,
): CatalogItemListboxItem<TPayload>[] {
    const items: CatalogItemListboxItem<TPayload>[] = [];
    const {
        filteredInsightItems,
        catalogItemsByDataset,
        ungroupedCatalogItems,
        shouldShowCatalogLoadingRow,
        fromVisualizationTitle,
        ungroupedTitle,
        variant,
        makeInteractiveItem,
    } = params;

    const hasInsightItems = filteredInsightItems.length > 0;
    const hasCatalogItems = catalogItemsByDataset.size > 0;
    const shouldRenderDividerBetweenSections =
        hasInsightItems && (hasCatalogItems || shouldShowCatalogLoadingRow);

    if (hasInsightItems) {
        items.push(buildSectionHeader("header-visualization", fromVisualizationTitle ?? "", variant));
    }
    filteredInsightItems.forEach((item) => items.push(makeInteractiveItem(item)));

    if (shouldRenderDividerBetweenSections) {
        items.push(buildDivider(variant));
    }

    if (shouldShowCatalogLoadingRow && catalogItemsByDataset.size === 0) {
        items.push(buildLoadingRow(variant));
        return items;
    }

    if (ungroupedCatalogItems.length > 0) {
        items.push(buildSectionHeader("header-ungrouped", ungroupedTitle, variant));
        ungroupedCatalogItems.forEach((item) => items.push(makeInteractiveItem(item)));
    }

    catalogItemsByDataset.forEach((group, datasetKey) => {
        items.push(buildSectionHeader(`header-${datasetKey}`, group.title.toUpperCase(), variant));
        group.items.forEach((item) => items.push(makeInteractiveItem(item)));
    });

    return items;
}

export interface IBuildAttributeListboxItemsParams<
    TPayload = unknown,
> extends IBuildAttributeOnlyListboxItemsParams<TPayload> {
    filteredCatalogItems: ICatalogItemPickerItem<TPayload>[]; // needed for date type (not grouped by dataset)
    shouldShowDateDatasetSelector: boolean;
    hasCatalogItems: boolean;
    effectiveType: "attribute" | "date";
    dateDatasetSelectorItem?: CatalogItemListboxItem<TPayload>;
}

export function buildAttributeListboxItems<TPayload>(
    params: IBuildAttributeListboxItemsParams<TPayload>,
): CatalogItemListboxItem<TPayload>[] {
    if (params.effectiveType === "date") {
        return buildDateListboxItems(params);
    }
    return buildAttributeOnlyListboxItems(params);
}
