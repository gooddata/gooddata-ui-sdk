// (C) 2021-2022 GoodData Corporation

import { IInvertableListRenderItemProps } from "@gooddata/sdk-ui-kit";
import { IPagedResource } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter, ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const emptyListItem: EmptyListItem = { empty: true };

/**
 * @internal
 */
export interface EmptyListItem {
    empty: true;
}

/**
 * @internal
 */
export interface IListItem {
    title: string;
    uri: string; //TODO rename to key and check mappings
}

/**
 * @internal
 */
export type AttributeListItem = IListItem | EmptyListItem;

/**
 * @internal
 */
export const isEmptyListItem = (item: unknown): item is EmptyListItem =>
    item && (item as EmptyListItem).empty;

/**
 * @internal
 */
export const isNonEmptyListItem = (item: unknown): item is IListItem =>
    item && !(item as EmptyListItem).empty;

/**
 * @internal
 */
export type IElementQueryResultWithEmptyItems = IPagedResource<AttributeListItem>;

/**
 * @internal
 */
export interface IAttributeFilterDropdownBodyProps {
    onApplyButtonClicked: () => void;
    closeDropdown: () => void;
}

/**
 * @internal
 */
export interface IAttributeFilterDropdownContentProps {
    error?: any;
    hasNoMatchingData: boolean; //new added
    hasNoData: boolean; //new added
    parentFilterTitles?: string[];
    showItemsFilteredMessage?: boolean;
}

/**
 * @internal
 */
export interface IAttributeFilterDropdownProps {
    isDropdownOpen: boolean;
    onDropdownOpenStateChanged: (isOpen: boolean) => void;
    onApplyButtonClicked: () => void;
}

/**
 * @internal
 */
export interface IAttributeFilterDropdownButtonsProps {
    onApplyButtonClicked: () => void;
    onCloseButtonClicked: () => void;
    isApplyDisabled?: boolean;
}

/**
 * @internal
 */
export interface IAttributeFilterErrorProps {
    message?: string;
}

/**
 * @internal
 */
export type IAttributeFilterListItemProps = IInvertableListRenderItemProps<AttributeListItem>;

/**
 * @internal
 */
export interface IAttributeFilterButtonProps {
    isOpen: boolean;
    title: string;
    subtitleText: string;
    subtitleItemCount: number;
    isFiltering: boolean;
    isLoaded: boolean;
    isLoading: boolean;
    onClick: () => void;
}

/**
 * @internal
 */
export interface IMessageNoMatchingDataProps {
    parentFilterTitles: string[];
}

/**
 * @internal
 */
export interface IMessageParentItemsFilteredProps {
    parentFilterTitles: string[];
    showItemsFilteredMessage: boolean;
}

/**
 * @internal
 */
export interface IAttributeFilterDeleteButtonProps {
    onDelete: () => void;
}

/**
 * @internal
 */
export interface IAttributeFilterConfigurationButtonProps {
    onConfiguration: () => void;
}

/**
 * @internal
 */
export interface IAttributeFilterListProps {
    items: AttributeListItem[];
    pageSize: number;
    loadedCount: number;
    totalCount: number;
    selectedItems: IListItem[];
    isInverted: boolean;
    isLoading: boolean;
    searchString: string;
    onSearch: (searchString: string) => void;
    onSelect: (selectedItems: IListItem[], isInverted: boolean) => void;
    onNextPageRequest?: () => void;
}

export interface IAttributeFilterListLoadingProps {
    height: number;
}

/**
 * @internal
 */
export type OnApplyCallbackType = (filter: IAttributeFilter, isInverted: boolean) => void;

/**
 * @internal
 */
export type ParentFilterOverAttributeType =
    | ObjRef
    | ((parentFilter: IAttributeFilter, index: number) => ObjRef);

/**
 * @internal
 */
export interface IAttributeFilterRendererProps {
    onApply?: OnApplyCallbackType;
    onError?: (error: any) => void;
}
