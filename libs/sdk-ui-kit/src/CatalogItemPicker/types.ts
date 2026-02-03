// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

/**
 * Supported item types for the catalog item picker.
 *
 * @internal
 */
export type CatalogItemPickerType = "metric" | "attribute" | "date";

/**
 * Selection mode for the catalog item picker.
 *
 * @internal
 */
export type CatalogItemPickerSelectionMode = "single" | "multiple";

/**
 * Catalog item picker item structure.
 *
 * @internal
 */
export interface ICatalogItemPickerItem<TPayload = unknown> {
    id: string;
    title: string;
    type: CatalogItemPickerType;
    payload: TPayload;
    ref?: ObjRef;
    dataset?: {
        identifier: ObjRef;
        title: string;
    };
    groupIds?: string[];
    sequenceNumber?: string;
}

/**
 * Items grouped by source.
 *
 * @internal
 */
export interface ICatalogItemPickerItems<TPayload = unknown> {
    insightItems: ICatalogItemPickerItem<TPayload>[];
    catalogItems: ICatalogItemPickerItem<TPayload>[];
}

/**
 * Catalog group definition.
 *
 * @internal
 */
export interface ICatalogGroup {
    id: string;
    title: string;
}

/**
 * Catalog item picker props.
 *
 * @internal
 */
export interface ICatalogItemPickerProps<TAttributePayload = unknown, TMetricPayload = unknown> {
    itemTypes: CatalogItemPickerType[];
    selectionMode: CatalogItemPickerSelectionMode;
    attributeItems?: ICatalogItemPickerItems<TAttributePayload>;
    metricItems?: ICatalogItemPickerItems<TMetricPayload>;
    groups?: ICatalogGroup[];
    maxListHeight?: number;
    isOpen?: boolean;
    isLoading?: boolean;
    onBack?: () => void;
    onClose: () => void;
    onAdd?: (items: Array<TAttributePayload | TMetricPayload>) => void;
    onSelect?: (item: TAttributePayload | TMetricPayload) => void;
    variant?: "mvf" | "addFilter";
}
