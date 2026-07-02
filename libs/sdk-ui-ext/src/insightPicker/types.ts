// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IInsight, type ObjRef } from "@gooddata/sdk-model";
import { type ILocale } from "@gooddata/sdk-ui";

/**
 * Sort field for the insight picker.
 * @internal
 */
export type InsightPickerSortBy = "lastModified" | "name";

/**
 * Sort direction for the insight picker.
 * @internal
 */
export type InsightPickerSortDirection = "asc" | "desc";

/**
 * Represents a single insight item in the picker.
 * @internal
 */
export interface IInsightPickerItem {
    ref: ObjRef;
    title: string;
    description?: string;
    identifier: string;
    uri?: string;
    isLocked: boolean;
    created?: string;
    updated?: string;
    visualizationUrl: string;
}

/**
 * Menu action for the insight picker's three-dots menu.
 * @internal
 */
export interface IInsightPickerMenuAction {
    id: string;
    title: string;
    onClick: (item: IInsightPickerItem) => void;
    isDestructive?: boolean;
    hasSeparator?: boolean;
}

/**
 * Props for a custom menu renderer.
 * @internal
 */
export interface IInsightPickerMenuProps {
    item: IInsightPickerItem;
    closeMenu: () => void;
}

/**
 * Props passed to a custom renderItem function.
 * @internal
 */
export interface IInsightPickerRenderItemProps {
    item: IInsightPickerItem;
    type: string;
    width: number;
    isSelected: boolean;
    sourceInsight?: IInsight;
}

/**
 * Props for the InsightPicker component.
 *
 * The picker is fully controlled — all state (search, sort, filters) must be
 * managed by the consumer and passed as props. This ensures state persists
 * across open/close cycles.
 *
 * @internal
 */
export interface IInsightPickerProps {
    backend?: IAnalyticalBackend;
    workspace?: string;
    locale?: ILocale;

    /** Include only insights with these tags (URL-scoped). */
    includeTags?: string[];
    /** Exclude insights with these tags (URL-scoped). */
    excludeTags?: string[];

    /**
     * Author identifier for the current user.
     * Used to populate the "Me" option in the author filter.
     */
    author?: string;

    enabledVisualizationClassesUrls?: string[];
    selectedInsightId?: string;
    metadataTimeZone?: string;
    enableSemanticSearch?: boolean;
    maxHeight?: number;
    width?: number;

    // --- Controlled search ---
    searchQuery: string;
    onSearchChange: (query: string) => void;

    // --- Controlled sort ---
    sortBy: InsightPickerSortBy;
    sortDirection: InsightPickerSortDirection;
    onSortChange: (sortBy: InsightPickerSortBy, sortDirection: InsightPickerSortDirection) => void;

    // --- Controlled author filter ---
    /** Selected author IDs. Empty array = "All". */
    authorFilter: string[];
    onAuthorFilterChange: (authorIds: string[]) => void;

    // --- Controlled tag filter ---
    /** Selected tag values. Empty array = "All". */
    tagFilter: string[];
    onTagFilterChange: (tagIds: string[]) => void;

    // --- Callbacks ---
    onSelect: (insightRef: ObjRef, item: IInsightPickerItem) => void;
    onDescriptionPanelOpen?: (description: string) => void;
    onItemActivate?: (item: IInsightPickerItem, sourceInsight?: IInsight) => void;

    // --- Customization ---
    menuActions?: IInsightPickerMenuAction[];
    renderMenu?: (props: IInsightPickerMenuProps) => ReactNode;
    renderItem?: (props: IInsightPickerRenderItemProps) => ReactElement;
}
