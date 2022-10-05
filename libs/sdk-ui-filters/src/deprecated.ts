// (C) 2019-2022 GoodData Corporation
import { ReactNode } from "react";
import { IAnalyticalBackend, IPagedResource } from "@gooddata/sdk-backend-spi";
import { ObjRef, IAttributeElement, IAttributeFilter } from "@gooddata/sdk-model";
import { WrappedComponentProps } from "react-intl";
import { AttributeFiltersOrPlaceholders, IPlaceholder } from "@gooddata/sdk-ui";

/**
 * @deprecated - empty items are no longer present and needed in the attribute filter elements list
 * @public
 */
export interface EmptyListItem {
    empty: true;
}

/**
 * @deprecated - use {@link @gooddata/sdk-model#IAttributeElement} instead
 * @public
 */
export type AttributeListItem = IAttributeElement | EmptyListItem;

/**
 * @deprecated - empty items are no longer present and needed in the attribute filter elements list
 * @public
 */
export const isEmptyListItem = (item: Partial<AttributeListItem>): item is EmptyListItem =>
    item && (item as EmptyListItem).empty;

/**
 * @deprecated - empty items are no longer present and needed in the attribute filter elements list
 * @public
 */
export const isNonEmptyListItem = (item: Partial<AttributeListItem>): item is IAttributeElement =>
    item && !(item as EmptyListItem).empty;

/**
 * @deprecated - use {@link @gooddata/sdk-backend-spi#IElementsQueryResult} instead
 * @public
 */
export type IElementQueryResultWithEmptyItems = IPagedResource<AttributeListItem>;

/**
 * @deprecated - use {@link IAttributeFilterElementsSelectItemProps} instead
 * @public
 */
export interface IAttributeDropdownListItemProps extends WrappedComponentProps {
    isLoading?: boolean;
    onMouseOut?: (source: any) => void;
    onMouseOver?: (source: any) => void;
    onOnly?: (source: any) => void;
    onSelect?: (source: any) => void;
    selected?: boolean;
    source?: any;
}

/**
 * @deprecated - use {@link IAttributeFilterElementsSelectProps} instead
 * @public
 */
export interface IAttributeDropdownBodyProps {
    items: AttributeListItem[];
    totalCount: number;
    selectedItems: Array<IAttributeElement>;
    isInverted: boolean;
    isLoading: boolean;
    isFullWidth?: boolean;
    error?: any;
    applyDisabled?: boolean;

    searchString: string;
    onSearch: (searchString: string) => void;

    onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;
    onRangeChange: (searchString: string, from: number, to: number) => void;
    onApplyButtonClicked: () => void;
    onCloseButtonClicked: () => void;
    parentFilterTitles?: string[];
    showItemsFilteredMessage?: boolean;
    attributeFilterRef?: ObjRef;
}

/**
 * @deprecated - use {@link IAttributeFilterElementsSelectProps} instead
 * @public
 */
export interface IAttributeDropdownBodyExtendedProps extends IAttributeDropdownBodyProps {
    deleteFilter?: () => void;
    isLoaded?: boolean;
    isElementsLoading?: boolean;
    width?: number;
    listItemClass?: React.ComponentType<IAttributeDropdownListItemProps>;
    maxSelectionSize?: number;
    showConfigurationButton?: boolean;
    onConfigurationChange?: () => void;
    showDeleteButton?: boolean;
    isMobile?: boolean;
    attributeFilterRef?: ObjRef;
}

/**
 * @deprecated - use {@link IAttributeFilterButtonProps} instead
 * @public
 */
export interface IAttributeFilterButtonOwnProps {
    /**
     * Specify an instance of analytical backend instance to work with.
     *
     * @remarks
     * Note: if you do not have a BackendProvider above in the component tree, then you MUST specify the backend.
     */
    backend?: IAnalyticalBackend;

    /**
     * Specify workspace to work with.
     *
     * @remarks
     * Note: if you do not have a WorkspaceProvider above in the component tree, then you MUST specify the workspace.
     */
    workspace?: string;

    /**
     * Specify an attribute filter that will be customized using this filter.
     *
     * @remarks
     * The component will use content of the filter and select the items that are already specified on the filter.
     *
     * Note: It's not possible to combine this property with "connectToPlaceholder" property. Either - provide a value, or a placeholder.
     * The 'onApply' callback must be specified in order to handle filter changes.
     */
    filter?: IAttributeFilter;

    /**
     * Specifies a parent attribute filter that will be used to reduce options for for current attribute filter.
     *
     * @remarks
     * Parent filters elements must contain their URIs due to current backend limitations.
     */
    parentFilters?: AttributeFiltersOrPlaceholders;

    /**
     * Specify {@link @gooddata/sdk-ui#IPlaceholder} to use to get and set the value of the attribute filter.
     *
     * @remarks
     * Note: It's not possible to combine this property with "filter" property. Either - provide a value, or a placeholder.
     * There is no need to specify 'onApply' callback if 'connectToPlaceholder' property is used as the value of the filter
     * is set via this placeholder.
     */
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>;

    /**
     * Specify the over attribute - an attribute the filter and its parent filter are connected through.
     *
     * @remarks
     * You can either provide an {@link @gooddata/sdk-model#ObjRef} which will be used for all the parent filters,
     * or you can provide a function that will be called for each parent filter to determine the respective over attribute.
     */
    parentFilterOverAttribute?: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef);

    /**
     * Specify identifier of attribute, for which you want to construct the filter.
     *
     * @remarks
     * Note: this is optional and deprecated. If you do not specify this, then you MUST specify the 'filter' prop or 'connectToPlaceholder' prop.
     *
     * @deprecated - use the filter prop instead
     */
    identifier?: string;

    /**
     * Specify title for the attribute filter.
     *
     * @remarks
     * By default, the attribute name will be used.
     */
    title?: string;

    /**
     * Locale to use for localization of appearing texts.
     */
    locale?: string;
    /**
     * Specify function which will be called when user clicks 'Apply' button.
     *
     * @remarks
     * The function will receive the current specification of the filter, as it was updated by the user.
     *
     * @param filter - new value of the filter.
     */
    onApply?: (filter: IAttributeFilter, isInverted: boolean) => void;

    /**
     * Customize attribute filter with a callback function to trigger when an error occurs while
     * loading attribute elements.
     */
    onError?: (error: any) => void;

    /**
     * Customize attribute filter with a component to be rendered if attribute elements loading fails
     */
    FilterError?: React.ComponentType<{ error?: any }>;

    /**
     * Customize attribute filter body with a component to be rendered instead of default filter body.
     */
    renderBody?: (props: IAttributeDropdownBodyExtendedProps) => React.ReactNode;

    /**
     * Specify className or startAdornment passed directly to button component
     */
    buttonProps?: {
        className?: string;
        startAdornment?: ReactNode;
    };
}
