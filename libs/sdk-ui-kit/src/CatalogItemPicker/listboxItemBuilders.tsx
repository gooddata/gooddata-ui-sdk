// (C) 2026 GoodData Corporation

import { type ICatalogItemPickerItem } from "./types.js";
import { bem } from "../@ui/@utils/bem.js";
import { type IUiListboxItem } from "../@ui/UiListbox/types.js";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner.js";

const { e } = bem("gd-ui-kit-catalog-item-picker");

export interface ICatalogItemPickerListItemData<TPayload = unknown> {
    item: ICatalogItemPickerItem<TPayload>;
    isSelected: boolean;
}

export type CatalogItemListboxItem = IUiListboxItem<ICatalogItemPickerListItemData>;

export function buildSectionHeader(
    id: string,
    title: string,
    variant: "mvf" | "addFilter",
): CatalogItemListboxItem {
    return {
        type: "static",
        id,
        data: <div className={e("section-header", { variant })}>{title}</div>,
    };
}

export function buildDivider(variant: "mvf" | "addFilter"): CatalogItemListboxItem {
    return {
        type: "static",
        id: "divider-visualization-catalog",
        data: <div className={e("divider", { variant })} />,
    };
}

export function buildLoadingRow(variant: "mvf" | "addFilter"): CatalogItemListboxItem {
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

export interface IBuildMetricListboxItemsParams {
    metricInsightItems: ICatalogItemPickerItem[];
    groupedMetricCatalogItems: Array<{ title: string; items: ICatalogItemPickerItem[] }>;
    fromVisualizationTitle: string | null;
    variant: "mvf" | "addFilter";
    makeInteractiveItem: (item: ICatalogItemPickerItem) => CatalogItemListboxItem;
}

export function buildMetricListboxItems(params: IBuildMetricListboxItemsParams): CatalogItemListboxItem[] {
    const items: CatalogItemListboxItem[] = [];
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

export interface IBuildDateListboxItemsParams {
    filteredInsightItems: ICatalogItemPickerItem[];
    filteredCatalogItems: ICatalogItemPickerItem[];
    shouldShowDateDatasetSelector: boolean;
    shouldShowCatalogLoadingRow: boolean;
    hasCatalogItems: boolean;
    fromVisualizationTitle: string | null;
    variant: "mvf" | "addFilter";
    dateDatasetSelectorItem?: CatalogItemListboxItem;
    makeInteractiveItem: (item: ICatalogItemPickerItem) => CatalogItemListboxItem;
}

export function buildDateListboxItems(params: IBuildDateListboxItemsParams): CatalogItemListboxItem[] {
    const items: CatalogItemListboxItem[] = [];
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

export interface IBuildAttributeOnlyListboxItemsParams {
    filteredInsightItems: ICatalogItemPickerItem[];
    catalogItemsByDataset: Map<string, { title: string; items: ICatalogItemPickerItem[] }>;
    ungroupedCatalogItems: ICatalogItemPickerItem[];
    shouldShowCatalogLoadingRow: boolean;
    fromVisualizationTitle: string | null;
    ungroupedTitle: string;
    variant: "mvf" | "addFilter";
    makeInteractiveItem: (item: ICatalogItemPickerItem) => CatalogItemListboxItem;
}

export function buildAttributeOnlyListboxItems(
    params: IBuildAttributeOnlyListboxItemsParams,
): CatalogItemListboxItem[] {
    const items: CatalogItemListboxItem[] = [];
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

export interface IBuildAttributeListboxItemsParams extends IBuildAttributeOnlyListboxItemsParams {
    filteredCatalogItems: ICatalogItemPickerItem[]; // needed for date type (not grouped by dataset)
    shouldShowDateDatasetSelector: boolean;
    hasCatalogItems: boolean;
    effectiveType: "attribute" | "date";
    dateDatasetSelectorItem?: CatalogItemListboxItem;
}

export function buildAttributeListboxItems(
    params: IBuildAttributeListboxItemsParams,
): CatalogItemListboxItem[] {
    if (params.effectiveType === "date") {
        return buildDateListboxItems(params);
    }
    return buildAttributeOnlyListboxItems(params);
}
