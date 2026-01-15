// (C) 2025-2026 GoodData Corporation

import { type ReactNode, type Ref } from "react";

import { type SortDirection } from "@gooddata/sdk-model";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type IconType } from "../@types/icon.js";

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
export interface IUiAsyncTableAccessibilityConfig<T> {
    getCheckboxItemAriaLabel?: (item: T) => string;
    checkboxAllAriaLabel?: string;
    searchAriaLabel?: string;
    gridAriaLabel?: string;
}

/**
 * @internal
 */
export interface IUiAsyncTableColumnAccessibilityConfig {
    ariaLabel?: string;
}

/**
 * @internal
 */
export interface IUiAsyncTableProps<T extends { id: string }> {
    items: T[];
    totalItemsCount?: number;
    columns: Array<IUiAsyncTableColumn<T>>;
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
    filters?: Array<IUiAsyncTableFilter>;
    isFiltersTooLarge?: boolean;

    //sorting
    sortBy?: keyof T;
    sortDirection?: SortDirection;
    onSort?: (key: keyof T) => void;

    //search
    onSearch?: (search: string) => void;

    //toolbar custom element
    renderToolbarCustomElement?: () => ReactNode;

    //bulk actions
    bulkActions?: Array<IUiAsyncTableBulkAction>;
    selectedItemIds?: Array<string>;
    setSelectedItemIds?: (items: Array<string>) => void;

    //headless variant, ignores columns prop
    renderItem?: (item: T) => ReactNode;
    renderHeader?: () => ReactNode;
    renderEmptyState?: () => ReactNode;

    //locale
    locale?: string;

    //accessibility
    accessibilityConfig?: IUiAsyncTableAccessibilityConfig<T>;
}

/**
 * @internal
 */
export type UiAsyncTableMenuRenderer<T> = (item: T, closeDropdown: () => void) => ReactNode;

/**
 * @internal
 */
export interface IUiAsyncTableColumn<T> {
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
    getTextHref?: (item: T) => string | undefined;
    bold?: boolean;
    sortable?: boolean;
    align?: "left" | "center" | "right";
    getAccessibilityConfig?: (item: T) => IUiAsyncTableColumnAccessibilityConfig;
}

/**
 * @internal
 */
export interface IUiAsyncTableColumnDefinitionResponsive<T> extends IUiAsyncTableColumn<T> {
    minWidth?: number;
}

/**
 * @internal
 */
export interface IUiAsyncTableFilter {
    label: string;
    options: Array<IUiAsyncTableFilterOption>;
    onItemsSelect: (options: Array<IUiAsyncTableFilterOption>) => void;
    selected?: Array<IUiAsyncTableFilterOption>;
    isMultiSelect?: boolean;
}

/**
 * @internal
 */
export interface IUiAsyncTableFilterOption {
    value: string;
    label?: string;
    secondaryLabel?: string;
}

/**
 * @internal
 */
export interface IUiAsyncTableBulkAction {
    label: string;
    onClick: () => void;
    accessibilityConfig?: IAccessibilityConfigBase;
}

/**
 * @internal
 */
export interface IUiAsyncTableTitleProps {
    title: string;
    renderIcon?: () => ReactNode;
    onSearch?: (search: string) => void;
    actions: Array<IUiAsyncTableTitleAction>;
    scrollToStart: () => void;
}

/**
 * @internal
 */
export interface IUiAsyncTableTitleAction {
    renderAction: () => ReactNode;
}

//subcomponent props

export interface IUiAsyncTableHeaderProps<T> {
    columns: Array<IUiAsyncTableColumn<T>>;
    handleColumnClick: (key?: keyof T) => void;
    sortBy?: keyof T;
    sortDirection?: SortDirection;
    hasCheckbox?: boolean;
    width?: number;
    small?: boolean;
    largeRow?: boolean;
}

export interface IUiAsyncTableFilterProps extends IUiAsyncTableFilter {
    isFiltersTooLarge?: boolean;
    variant?: UiAsyncTableVariant;
    isMobileView?: boolean;
    width?: number;
}

export interface IUiAsyncTableRowProps<T extends { id: string }> {
    item?: T;
    itemIndex: number;
    columns: Array<IUiAsyncTableColumn<T>>;
    onSelect?: (item: T) => void;
    onClick?: (item: T) => void;
    hasCheckbox?: boolean;
    isLarge?: boolean;
    isSelected?: boolean;
    isFocused?: boolean;
    focusedColumnIndex?: number;
    focusedElementRef?: Ref<HTMLElement>;
    accessibilityConfig?: IUiAsyncTableAccessibilityConfig<T>;
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

export interface IUiAsyncTableToolbarProps<T extends { id: string }> {
    filters?: Array<IUiAsyncTableFilter>;
    isFiltersTooLarge?: boolean;
    bulkActions?: Array<IUiAsyncTableBulkAction>;
    selectedItemIds?: Array<string>;
    setSelectedItemIds: (items: Array<string>) => void;
    totalItemsCount: number;
    items: Array<T>;
    variant?: UiAsyncTableVariant;
    isMobileView?: boolean;
    width?: number;
    onSearch?: (search: string) => void;
    renderToolbarCustomElement?: () => ReactNode;
    accessibilityConfig?: IUiAsyncTableAccessibilityConfig<T>;
}

export type UiAsyncTableDropdownItemProps = {
    label: string;
    secondaryLabel?: string;
    onClick: () => void;
    isSelected?: boolean;
    isMultiSelect?: boolean;
    isUnderlined?: boolean;
    accessibilityConfig?: IAccessibilityConfigBase;
};

export interface IUiAsyncTableBulkActionsProps {
    bulkActions: Array<IUiAsyncTableBulkAction>;
}

export interface IUiAsyncTableIconRendererProps<T> {
    renderIcon?: (item: T) => ReactNode;
    className: string;
    item: T;
}

export interface IUiAsyncTableBodyProps<T extends { id: string }> {
    items: T[];
    maxHeight: number;
    itemHeight: number;
    skeletonItemsCount: number;
    hasNextPage?: boolean;
    isLoading?: boolean;
    onItemClick?: (item: T) => void;
    loadNextPage?: () => void;
    columns: Array<IUiAsyncTableColumn<T>>;
    bulkActions?: Array<IUiAsyncTableBulkAction>;
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
export interface IUiAsyncTableEmptyStateProps {
    title?: string;
    description?: string;
    icon?: IconType;
}
