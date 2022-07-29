// (C) 2022 GoodData Corporation
import { IAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFiltersOrPlaceholders, IPlaceholder } from "@gooddata/sdk-ui";
import {
    IAttributeFilterButtonProps,
    IAttributeFilterDropdownBodyProps,
    IAttributeFilterDropdownButtonsProps,
    IAttributeFilterDropdownContentProps,
    IAttributeFilterErrorProps,
    IAttributeFilterListItemProps,
    IAttributeFilterListLoadingProps,
    IAttributeFilterListProps,
    IMessageNoMatchingDataProps,
    IMessageParentItemsFilteredProps,
    OnApplyCallbackType,
    ParentFilterOverAttributeType,
} from "../Components/types";
import { IAttributeFilterHandlerResult } from "../hooks/types";

/**
 * @internal
 */
export interface IAtributeFilterComponentsContext {
    AttributeFilterError: React.ComponentType<IAttributeFilterErrorProps>;
    AttributeFilterButton: React.ComponentType<IAttributeFilterButtonProps>;
    AttributeFilterDropdownBody: React.ComponentType<IAttributeFilterDropdownBodyProps>;
    AttributeFilterDropdownButtons: React.ComponentType<IAttributeFilterDropdownButtonsProps>;
    AttributeFilterDropdownContent: React.ComponentType<IAttributeFilterDropdownContentProps>;
    AttributeFilterList: React.ComponentType<IAttributeFilterListProps>;
    AttributeFilterListItem: React.ComponentType<IAttributeFilterListItemProps>;
    AttributeFilterListLoading: React.ComponentType<IAttributeFilterListLoadingProps>;
    MessageListError: React.ComponentType;
    MessageNoData: React.ComponentType;
    MessageNoMatchingData: React.ComponentType<IMessageNoMatchingDataProps>;
    MessageParentItemsFiltered: React.ComponentType<IMessageParentItemsFilteredProps>;
}

/**
 * @internal
 */
export interface useOwnPropsResolverProps {
    handlerResult: IAttributeFilterHandlerResult;
    title?: string;
    onFilterPlaceholderApply: (filter: IAttributeFilter) => void;
}

/**
 * @internal
 */
export interface IAttributeFilterContextOwnState {
    attributeFilterTitle: string;
    isApplyDisabled: boolean;
    onFilterPlaceholderApply: (filter: IAttributeFilter) => void;
}

/**
 * @internal
 */
export type IAttributeFilterContext = IAttributeFilterContextOwnState & IAttributeFilterHandlerResult;

/**
 * @internal
 */
export interface IAttributeFilterProviderProps {
    title?: string;
    filter?: IAttributeFilter;
    parentFilters?: AttributeFiltersOrPlaceholders;
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>;
    parentFilterOverAttribute?: ParentFilterOverAttributeType;
    identifier?: string;
    onApply?: OnApplyCallbackType;
}
