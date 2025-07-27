// (C) 2025 GoodData Corporation

import { SortDirection } from "@gooddata/sdk-model";
import { ReactNode } from "react";

/**
 * @internal
 */
export interface UiAsyncTableProps<T extends { id: string }> {
    items: T[];
    totalItemsCount?: number;
    columns: Array<UiAsyncTableColumn<T>>;
    onItemClick?: (item: T) => void;

    //default: add up all column widths
    width?: number;
    maxHeight?: number;
    smallHeader?: boolean;

    //loading
    skeletonItemsCount?: number;
    isLoading?: boolean;

    //async pagination
    hasNextPage?: boolean;
    loadNextPage?: () => void;

    //filters
    filters?: Array<UiAsyncTableFilter>;

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

    //locale
    locale?: string;
}

/**
 * @internal
 */
export interface UiAsyncTableColumn<T> {
    key?: keyof T;
    label?: string;
    width?: number;
    renderMenu?: (item: T) => ReactNode;
    renderButton?: (item: T) => ReactNode;
    renderRoleIcon?: (item: T) => ReactNode;
    renderPrefixIcon?: (item: T) => ReactNode;
    renderSuffixIcon?: (item: T) => ReactNode;
    renderBadge?: (item: T) => ReactNode;
    getMultiLineTextContent?: (item: T) => Array<string>;
    getTextContent?: (item: T) => string;
    getTextTitle?: (item: T) => string;
    getTextHref?: (item: T) => string;
    bold?: boolean;
    sortable?: boolean;
}

/**
 * @internal
 */
export interface UiAsyncTableFilter {
    label: string;
    options: Array<UiAsyncTableFilterOption>;
    onItemClick: (option: UiAsyncTableFilterOption) => void;
    selected?: UiAsyncTableFilterOption;
}

/**
 * @internal
 */
export interface UiAsyncTableFilterOption {
    value: string;
    label?: string;
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

export interface UiAsyncTableRowProps<T extends { id: string }> {
    item?: T;
    columns: Array<UiAsyncTableColumn<T>>;
    onSelect?: (item: T) => void;
    onClick?: (item: T) => void;
    hasCheckbox?: boolean;
    isLarge?: boolean;
    isSelected?: boolean;
}

export type UiAsyncTableCheckboxProps = {
    onChange?: () => void;
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
};

export interface UiAsyncTableToolbarProps<T extends { id: string }> {
    filters?: Array<UiAsyncTableFilter>;
    bulkActions?: Array<UiAsyncTableBulkAction>;
    scrollToStart: () => void;
    selectedItemIds: Array<string>;
    setSelectedItemIds: (items: Array<string>) => void;
    totalItemsCount: number;
    items: Array<T>;
    onSearch?: (search: string) => void;
}

export interface UiAsyncTableFilterProps extends UiAsyncTableFilter {
    scrollToStart: () => void;
}

export type UiAsyncTableDropdownItemProps = {
    label: string;
    onSelect: () => void;
    isSelected?: boolean;
};

export interface UiAsyncTableBulkActionsProps {
    bulkActions: Array<UiAsyncTableBulkAction>;
}
