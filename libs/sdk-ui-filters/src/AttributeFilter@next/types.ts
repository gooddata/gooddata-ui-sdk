// (C) 2019-2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFiltersOrPlaceholders, IPlaceholder } from "@gooddata/sdk-ui";

import {
    IAttributeFilterButtonProps,
    IAttributeFilterDropdownButtonsProps,
    IAttributeFilterErrorProps,
    IAttributeFilterListItemProps,
    IAttributeFilterListLoadingProps,
    IAttributeFilterListProps,
    IMessageNoMatchingDataProps,
    IMessageParentItemsFilteredProps,
    IAttributeFilterDropdownBodyProps,
    IAttributeFilterDropdownContentProps,
    ParentFilterOverAttributeType,
    OnApplyCallbackType,
} from "./Components/types";

/**
 * @internal
 */
export interface IAttributeFilterBaseProps {
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
     * or you can provide a pure function that will be called for each parent filter to determine the respective over attribute.
     */
    parentFilterOverAttribute?: ParentFilterOverAttributeType;

    /**
     * Specify identifier of attribute display form, for which you want to construct the filter.
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
    onApply?: OnApplyCallbackType;

    /**
     * Customize attribute filter with a callback function to trigger when an error occurs while
     * loading attribute elements.
     */
    onError?: (error: any) => void;

    /**
     * Customize attribute filter with a component to be rendered if attribute elements loading fails
     */
    FilterError?: React.ComponentType<IAttributeFilterErrorProps>;

    /**
     * Customize attribute filter button component
     */
    FilterButton?: React.ComponentType<IAttributeFilterButtonProps>;

    /**
     * Customize  attribute filter dropdown component
     */
    FilterDropdownBody?: React.ComponentType<IAttributeFilterDropdownBodyProps>;

    /**
     * Customize attribute filter dropdown actions buttons
     */
    FilterDropdownContent?: React.ComponentType<IAttributeFilterDropdownContentProps>;

    /**
     * Customize attribute filter dropdown actions buttons
     */
    FilterDropdownButtons?: React.ComponentType<IAttributeFilterDropdownButtonsProps>;

    /**
     * Customize attribute filter list component
     */
    FilterList?: React.ComponentType<IAttributeFilterListProps>;

    /**
     * Customize attribute filter list loading component
     */
    FilterListLoading?: React.ComponentType<IAttributeFilterListLoadingProps>;

    /**
     * Customize attribute filter list item component
     */
    FilterListItem?: React.ComponentType<IAttributeFilterListItemProps>;

    /**
     * Customize attribute filter list generic error message
     */
    MessageListError?: React.ComponentType;

    /**
     * Customize attribute filter dropdown message NoData
     */
    MessageNoData?: React.ComponentType;

    /**
     * Customize attribute filter dropdown message NoDataMatching data
     */
    MessageNoMatchingData?: React.ComponentType<IMessageNoMatchingDataProps>;

    /**
     * Customize attribute filter dropdown message Items are filtered by parent
     */
    MessageParentItemsFiltered?: React.ComponentType<IMessageParentItemsFilteredProps>;

    /**
     * Customize attribute filter body with a component to be rendered instead of default filter body.
     * @deprecated This callback is deprecated use AttributeDropdownBody component customization instead.
     */
    //TODO this is temporally removed and will be done as FilterDropdownBody component customization
    // renderBody?: (props: IAttributeDropdownBodyExtendedProps) => React.ReactNode;
}
