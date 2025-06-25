// (C) 2025 GoodData Corporation

/**
 * @internal
 */
export interface IAsyncTableProps<T extends { id: string }> {
    items: T[];
    totalItemsCount?: number;
    columns: Array<IColumn<T>>;
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
    filters?: Array<IAsyncTableFilter>;

    //sorting
    sortBy?: keyof T;
    sortDirection?: SortDirection;
    onSort?: (key: keyof T) => void;

    //search
    onSearch?: (search: string) => void;

    //bulk actions
    bulkActions?: Array<IBulkAction>;
    selectedItemIds?: Array<string>;
    setSelectedItemIds?: (items: Array<string>) => void;

    //headless variant, ignores columns prop
    renderItem?: (item: T) => React.ReactNode;
    renderHeader?: () => React.ReactNode;

    //locale
    locale?: string;
}

/**
 * @internal
 */
export interface IColumn<T> {
    key?: keyof T;
    label?: string;
    width?: number;
    renderMenu?: (item: T) => React.ReactNode;
    renderButton?: (item: T) => React.ReactNode;
    renderRoleIcon?: (item: T) => React.ReactNode;
    renderPrefixIcon?: (item: T) => React.ReactNode;
    renderSuffixIcon?: (item: T) => React.ReactNode;
    renderBadge?: (item: T) => React.ReactNode;
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
export type SortDirection = "asc" | "desc";

/**
 * @internal
 */
export interface IAsyncTableFilter {
    label: string;
    options: Array<IAsyncTableFilterOption>;
    onItemClick: (option: IAsyncTableFilterOption) => void;
    selected?: IAsyncTableFilterOption;
}

/**
 * @internal
 */
export interface IAsyncTableFilterOption {
    value: string;
    label?: string;
}

/**
 * @internal
 */
export interface IBulkAction {
    label: string;
    onClick: () => void;
}

//subcomponent props

export interface IAsyncTableHeaderProps<T> {
    columns: Array<IColumn<T>>;
    handleColumnClick: (key?: keyof T) => void;
    sortBy?: keyof T;
    sortDirection?: SortDirection;
    hasCheckbox?: boolean;
    width?: number;
    small?: boolean;
    largeRow?: boolean;
}

export interface IAsyncTableRowProps<T extends { id: string }> {
    item?: T;
    columns: Array<IColumn<T>>;
    onSelect?: (item: T) => void;
    onClick?: (item: T) => void;
    hasCheckbox?: boolean;
    isLarge?: boolean;
    isSelected?: boolean;
}

export type IAsyncTableCheckboxProps = {
    onChange?: () => void;
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
};

export interface IAsyncTableToolbarProps<T extends { id: string }> {
    filters?: Array<IAsyncTableFilter>;
    bulkActions?: Array<IBulkAction>;
    scrollToStart: () => void;
    selectedItemIds: Array<string>;
    setSelectedItemIds: (items: Array<string>) => void;
    totalItemsCount: number;
    items: Array<T>;
    onSearch?: (search: string) => void;
}

export interface IAsyncTableFilterProps extends IAsyncTableFilter {
    scrollToStart: () => void;
}

export type IAsyncTableDropdownItemProps = {
    label: string;
    onSelect: () => void;
    isSelected?: boolean;
};

export interface IAsyncTableBulkActionsProps {
    bulkActions: Array<IBulkAction>;
}
