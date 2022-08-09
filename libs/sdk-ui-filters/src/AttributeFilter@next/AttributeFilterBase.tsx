// (C) 2021-2022 GoodData Corporation
import React from "react";
import invariant from "ts-invariant";
import { IntlWrapper, AttributeFiltersOrPlaceholders, IPlaceholder } from "@gooddata/sdk-ui";
import { AttributeFilterComponentsProvider } from "./Context/AttributeFilterComponentsContext";
import { AttributeFilterDefaultComponents } from "./Context/AttributeFilterDefaultComponents";
import { AttributeFilterRenderer } from "./Components/AttributeFilterRenderer";
import { AttributeFilterContextProvider } from "./Context/AttributeFilterContext";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter } from "@gooddata/sdk-model";

import {
    IAttributeFilterDropdownBodyProps,
    IAttributeFilterDropdownContentProps,
    IAttributeFilterDropdownActionsProps,
    IAttributeFilterErrorProps,
    IAttributeFilterElementsSelectItemProps,
    IAttributeFilterDropdownButtonProps,
    IAttributeFilterElementsSelectNoMatchingDataProps,
    IAttributeFilterElementsSelectParentItemsFilteredProps,
    IAttributeFilterElementsSelectProps,
    IAttributeFilterElementsSelectLoadingProps,
} from "./Components/types";
import { ParentFilterOverAttributeType, OnApplyCallbackType } from "./types";

/**
 * @alpha
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
    ErrorComponent?: React.ComponentType<IAttributeFilterErrorProps>;

    /**
     * Customize attribute filter with a component to be rendered if attribute filter is loading
     */
    LoadingComponent?: React.ComponentType<IAttributeFilterErrorProps>;

    /**
     * Customize attribute filter button component
     */
    DropdownButtonComponent?: React.ComponentType<IAttributeFilterDropdownButtonProps>;

    /**
     * Customize  attribute filter dropdown component
     */
    DropdownBodyComponent?: React.ComponentType<IAttributeFilterDropdownBodyProps>;

    /**
     * Customize attribute filter dropdown content
     */
    DropdownContentComponent?: React.ComponentType<IAttributeFilterDropdownContentProps>;

    /**
     * Customize attribute filter dropdown actions buttons
     */
    DropdownActionsComponent?: React.ComponentType<IAttributeFilterDropdownActionsProps>;

    /**
     * Customize attribute filter list component
     */
    ElementsSelectComponent?: React.ComponentType<IAttributeFilterElementsSelectProps>;

    /**
     * Customize attribute filter list loading component
     */
    ElementsSelectLoadingComponent?: React.ComponentType<IAttributeFilterElementsSelectLoadingProps>;

    /**
     * Customize attribute filter list item component
     */
    ElementsSelectItemComponent?: React.ComponentType<IAttributeFilterElementsSelectItemProps>;

    /**
     * Customize attribute filter list generic error message
     */
    ElementsSelectErrorComponent?: React.ComponentType;

    /**
     * Customize attribute filter dropdown message NoData
     */
    ElementsSelectNoDataComponent?: React.ComponentType;

    /**
     * Customize attribute filter dropdown message NoDataMatching data
     */
    ElementsSelectNoMatchingDataComponent?: React.ComponentType<IAttributeFilterElementsSelectNoMatchingDataProps>;

    /**
     * Customize attribute filter dropdown message Items are filtered by parent
     */
    ElementsSelectParentItemsFilteredComponent?: React.ComponentType<IAttributeFilterElementsSelectParentItemsFilteredProps>;
}

/**
 * @internal
 */
export const AttributeFilterBase: React.FC<IAttributeFilterBaseProps> = (props) => {
    const {
        locale,
        ErrorComponent,
        LoadingComponent,
        DropdownButtonComponent,
        DropdownActionsComponent,
        DropdownBodyComponent,
        DropdownContentComponent,
        ElementsSelectComponent,
        ElementsSelectLoadingComponent,
        ElementsSelectItemComponent,
        ElementsSelectErrorComponent,
        ElementsSelectNoDataComponent,
        ElementsSelectNoMatchingDataComponent,
        ElementsSelectParentItemsFilteredComponent,
    } = props;

    validateAttributeFilterProps(props);

    return (
        <IntlWrapper locale={locale}>
            <AttributeFilterComponentsProvider
                AttributeFilterError={ErrorComponent ?? AttributeFilterDefaultComponents.AttributeFilterError}
                AttributeFilterLoading={
                    LoadingComponent ?? AttributeFilterDefaultComponents.AttributeFilterLoading
                }
                AttributeFilterDropdownButton={
                    DropdownButtonComponent ?? AttributeFilterDefaultComponents.AttributeFilterDropdownButton
                }
                AttributeFilterDropdownActions={
                    DropdownActionsComponent ??
                    AttributeFilterDefaultComponents.AttributeFilterDropdownActions
                }
                AttributeFilterDropdownBody={
                    DropdownBodyComponent ?? AttributeFilterDefaultComponents.AttributeFilterDropdownBody
                }
                AttributeFilterDropdownContent={
                    DropdownContentComponent ??
                    AttributeFilterDefaultComponents.AttributeFilterDropdownContent
                }
                AttributeFilterElementsSelect={
                    ElementsSelectComponent ?? AttributeFilterDefaultComponents.AttributeFilterElementsSelect
                }
                AttributeFilterElementsSelectItem={
                    ElementsSelectItemComponent ??
                    AttributeFilterDefaultComponents.AttributeFilterElementsSelectItem
                }
                AttributeFilterElementsSelectLoading={
                    ElementsSelectLoadingComponent ??
                    AttributeFilterDefaultComponents.AttributeFilterElementsSelectLoading
                }
                AttributeFilterElementsSelectError={
                    ElementsSelectErrorComponent ??
                    AttributeFilterDefaultComponents.AttributeFilterElementsSelectError
                }
                AttributeFilterElementsSelectNoData={
                    ElementsSelectNoDataComponent ??
                    AttributeFilterDefaultComponents.AttributeFilterElementsSelectNoData
                }
                AttributeFilterElementsSelectNoMatchingData={
                    ElementsSelectNoMatchingDataComponent ??
                    AttributeFilterDefaultComponents.AttributeFilterElementsSelectNoMatchingData
                }
                AttributeFilterElementsSelectParentItemsFiltered={
                    ElementsSelectParentItemsFilteredComponent ??
                    AttributeFilterDefaultComponents.AttributeFilterElementsSelectParentItemsFiltered
                }
            >
                <AttributeFilterContextProvider {...props}>
                    <AttributeFilterRenderer />
                </AttributeFilterContextProvider>
            </AttributeFilterComponentsProvider>
        </IntlWrapper>
    );
};

function validateAttributeFilterProps(props: IAttributeFilterBaseProps) {
    const { connectToPlaceholder, filter, identifier, onApply } = props;

    invariant(
        !(filter && connectToPlaceholder),
        "It's not possible to combine 'filter' property with 'connectToPlaceholder' property. Either provide a value, or a placeholder.",
    );

    invariant(
        !(filter && !onApply),
        "It's not possible to use 'filter' property without 'onApply' property. Either provide 'onApply' callback or use placeholders.",
    );

    //deprecated identifier check

    invariant(
        !(filter && identifier),
        "It's not possible to combine 'identifier' property with 'filter' property. Either provide a value, or a filter.",
    );

    invariant(
        !(identifier && !onApply),
        "It's not possible to use 'identifier' property without 'onApply' property. Either provide 'onApply' callback or use placeholders.",
    );

    invariant(
        !(identifier && connectToPlaceholder),
        "It's not possible to combine 'identifier' property with 'connectToPlaceholder' property. Either provide a value, or a placeholder.",
    );

    if (identifier) {
        // eslint-disable-next-line no-console
        console.warn(
            "Definition of an attribute display form using 'identifier' is deprecated, use 'filter' property instead. Please see the documentation of [AttributeFilter component](https://sdk.gooddata.com/gooddata-ui/docs/attribute_filter_component.html) for further details.",
        );
    }
}
