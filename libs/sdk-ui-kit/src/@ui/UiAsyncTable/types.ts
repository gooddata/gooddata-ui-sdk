// (C) 2025 GoodData Corporation

import { ReactNode, Ref } from "react";

import { SortDirection } from "@gooddata/sdk-model";

import { IconType } from "../@types/icon.js";

/**
 * Variant for UiAsyncTable component.
 * - "regular": Standard table size for full pages
 * - "small": Compact table size for embedding in modals/dialogs
 *
 * @internal
 */
export type UiAsyncTableVariant = "regular" | "small";

/**
 * @internal
 */
export interface UiAsyncTableAccessibilityConfig<T> {
    getCheckboxItemAriaLabel?: (item: T) => string;
    checkboxAllAriaLabel?: string;
    searchAriaLabel?: string;
    gridAriaLabel?: string;
}

/**
 * @internal
 */
export interface UiAsyncTableColumnAccessibilityConfig {
    ariaLabel?: string;
}

/**
 * @internal
 */
export interface UiAsyncTableProps<T extends { id: string }> {
    items: T[];
    totalItemsCount?: number;
    columns: Array<UiAsyncTableColumn<T>>;
    onItemClick?: (item: T) => void;
    scrollToIndex?: number;

    //default: add up all column widths
    width?: number;
    maxHeight?: number;
    // variant
    variant?: UiAsyncTableVariant;
    // mobile design
    isMobileView?: boolean;

    //loading
    skeletonItemsCount?: number;
    isLoading?: boolean;

    //async pagination
    hasNextPage?: boolean;
    loadNextPage?: () => void;

    //filters
    filters?: Array<UiAsyncTableFilter>;
    isFiltersTooLarge?: boolean;

    //sorting
    sortBy?: keyof T;
    sortDirection?: SortDirection;
    onSort?: (key: keyof T) => void;

    //search
    onSearch?: (search: string) => void;

    //bulk actions
    bulkActions?: Array<UiAsyncTableBulkAction>;
    selectedItemIds?: Array<string>;
    setSelectedItemIds?: (items: Array<string>) => void;

    //headless variant, ignores columns prop
    renderItem?: (item: T) => ReactNode;
    renderHeader?: () => ReactNode;
    renderEmptyState?: () => ReactNode;

    //locale
    locale?: string;

    //accessibility
    accessibilityConfig?: UiAsyncTableAccessibilityConfig<T>;
}

/**
 * @internal
 */
export type UiAsyncTableMenuRenderer<T> = (item: T, closeDropdown: () => void) => ReactNode;

/**
 * @internal
 */
export interface UiAsyncTableColumn<T> {
    key?: keyof T;
    label?: string;
    width?: number;
    //if renderMenu is provided, but returns falsy value, the menu will be disabled
    renderMenu?: UiAsyncTableMenuRenderer<T>;
    renderButton?: (item: T) => ReactNode;
    renderRoleIcon?: (item: T) => ReactNode;
    renderPrefixIcon?: (item: T) => ReactNode;
    renderSuffixIcon?: (item: T) => ReactNode;
    renderBadge?: (item: T) => ReactNode;
    getMultiLineTextContent?: (item: T) => Array<string>;
    getTextContent?: (item: T) => string | ReactNode;
    getTextTitle?: (item: T) => string;
    getTextHref?: (item: T) => string;
    bold?: boolean;
    sortable?: boolean;
    align?: "left" | "center" | "right";
    getAccessibilityConfig?: (item: T) => UiAsyncTableColumnAccessibilityConfig;
}

/**
 * @internal
 */
export interface UiAsyncTableColumnDefinitionResponsive<T> extends UiAsyncTableColumn<T> {
    minWidth?: number;
}

/**
 * @internal
 */
export interface UiAsyncTableFilter {
    label: string;
    options: Array<UiAsyncTableFilterOption>;
    onItemsSelect: (options: Array<UiAsyncTableFilterOption>) => void;
    selected?: Array<UiAsyncTableFilterOption>;
    isMultiSelect?: boolean;
}

/**
 * @internal
 */
export interface UiAsyncTableFilterOption {
    value: string;
    label?: string;
    secondaryLabel?: string;
}

/**
 * @internal
 */
export interface UiAsyncTableBulkAction {
    label: string;
    onClick: () => void;
}

/**
 * @internal
 */
export interface UiAsyncTableTitleProps {
    title: string;
    renderIcon?: () => ReactNode;
    onSearch?: (search: string) => void;
    actions: Array<UiAsyncTableTitleAction>;
    scrollToStart: () => void;
}

/**
 * @internal
 */
export interface UiAsyncTableTitleAction {
    renderAction: () => ReactNode;
}

//subcomponent props

export interface UiAsyncTableHeaderProps<T> {
    columns: Array<UiAsyncTableColumn<T>>;
    handleColumnClick: (key?: keyof T) => void;
    sortBy?: keyof T;
    sortDirection?: SortDirection;
    hasCheckbox?: boolean;
    width?: number;
    small?: boolean;
    largeRow?: boolean;
}

export interface UiAsyncTableFilterProps extends UiAsyncTableFilter {
    isFiltersTooLarge?: boolean;
    variant?: UiAsyncTableVariant;
    isMobileView?: boolean;
    width?: number;
}

export interface UiAsyncTableRowProps<T extends { id: string }> {
    item?: T;
    itemIndex: number;
    columns: Array<UiAsyncTableColumn<T>>;
    onSelect?: (item: T) => void;
    onClick?: (item: T) => void;
    hasCheckbox?: boolean;
    isLarge?: boolean;
    isSelected?: boolean;
    isFocused?: boolean;
    focusedColumnIndex?: number;
    focusedElementRef?: Ref<HTMLElement>;
    accessibilityConfig?: UiAsyncTableAccessibilityConfig<T>;
}

export type UiAsyncTableCheckboxProps = {
    onChange?: () => void;
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
    header?: boolean;
    isCellFocused?: boolean;
    cellRef?: Ref<HTMLElement>;
};

export interface UiAsyncTableToolbarProps<T extends { id: string }> {
    filters?: Array<UiAsyncTableFilter>;
    isFiltersTooLarge?: boolean;
    bulkActions?: Array<UiAsyncTableBulkAction>;
    selectedItemIds?: Array<string>;
    setSelectedItemIds: (items: Array<string>) => void;
    totalItemsCount: number;
    items: Array<T>;
    variant?: UiAsyncTableVariant;
    isMobileView?: boolean;
    width?: number;
    onSearch?: (search: string) => void;
    accessibilityConfig?: UiAsyncTableAccessibilityConfig<T>;
}

export type UiAsyncTableDropdownItemProps = {
    label: string;
    secondaryLabel?: string;
    onClick: () => void;
    isSelected?: boolean;
    isMultiSelect?: boolean;
    isUnderlined?: boolean;
};

export interface UiAsyncTableBulkActionsProps {
    bulkActions: Array<UiAsyncTableBulkAction>;
}

export interface IUiAsyncTableIconRendererProps<T> {
    renderIcon?: (item: T) => ReactNode;
    className: string;
    item: T;
}

export interface UiAsyncTableBodyProps<T extends { id: string }> {
    items: T[];
    maxHeight: number;
    itemHeight: number;
    skeletonItemsCount: number;
    hasNextPage?: boolean;
    isLoading?: boolean;
    onItemClick?: (item: T) => void;
    loadNextPage?: () => void;
    columns: Array<UiAsyncTableColumn<T>>;
    bulkActions?: Array<UiAsyncTableBulkAction>;
    scrollToIndex?: number;
    isLargeRow?: boolean;
    shouldLoadNextPage?: (lastItemIndex: number, itemsCount: number) => boolean;
    renderItem: (
        item: T,
        itemIndex: number,
        focusedItemRef: Ref<HTMLElement>,
        isFocused: boolean,
        focusedColumnIndex?: number,
    ) => ReactNode;
}

/**
 * @internal
 */
export interface UiAsyncTableEmptyStateProps {
    title?: string;
    description?: string;
    icon?: IconType;
}
