// (C) 2021-2022 GoodData Corporation

import { IInvertableListRenderItemProps } from "@gooddata/sdk-ui-kit";
import { IPagedResource } from "@gooddata/sdk-backend-spi";

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
    hasNoMatchingData: boolean;
    hasNoData: boolean;
    isApplyDisabled: boolean;
    bodyProps: IAttributeDropdownBodyPropsNoCallbacks;
    onApplyButtonClicked: () => void;
    closeDropdown: () => void;
}

/**
 * @internal
 */
export interface IAttributeFilterDropdownContentProps {
    items: AttributeListItem[];
    totalCount: number;
    selectedItems: Array<IListItem>;
    isInverted: boolean;
    isLoading: boolean;
    isFullWidth?: boolean;

    error?: any;
    hasNoMatchingData: boolean; //new added
    hasNoData: boolean; //new added

    searchString: string;
    onSearch: (searchString: string) => void;

    onSelect: (selectedItems: IListItem[], isInverted: boolean) => void;
    onRangeChange: (searchString: string, from: number, to: number) => void;
    parentFilterTitles?: string[];
    showItemsFilteredMessage?: boolean;
}

//TODO this is temporary type
/**
 * @internal
 */
export type IAttributeDropdownBodyPropsNoCallbacks = Omit<
    IAttributeFilterDropdownContentProps,
    "onApplyButtonClicked" | "onCloseButtonClicked"
>;

/**
 * @internal
 */
export interface IAttributeFilterDropdownProps {
    isFiltering: boolean;
    isDropdownOpen: boolean;

    isElementsLoading: boolean; //TODO investigate this prop and move it or remove it
    isOriginalTotalCountLoading: boolean;

    title: string;

    subtitle: string;

    selectedFilterOptions: IListItem[];

    onDropdownOpenStateChanged: (isOpen: boolean) => void;
    onApplyButtonClicked: () => void;

    hasNoMatchingData: boolean; //TODO move to DropDown props
    hasNoData: boolean; //TODO move to DropDown props
    isApplyDisabled: boolean; //TODO move to DropDown props

    dropDownProps: IAttributeDropdownBodyPropsNoCallbacks;
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
    isOpen?: boolean;
    title: string;
    subtitleText: string; //TODO need array of selected elements title
    subtitleItemCount: number; //TODO rename it
    isFiltering?: boolean;
    isLoaded?: boolean;
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
    totalCount: number;
    selectedItems: IListItem[];
    isInverted: boolean;
    isLoading: boolean;

    searchString: string;
    onSearch: (searchString: string) => void;

    onSelect: (selectedItems: IListItem[], isInverted: boolean) => void;
    onRangeChange: (searchString: string, from: number, to: number) => void;
}

export interface IAttributeFilterListLoadingProps {
    height: number;
}
