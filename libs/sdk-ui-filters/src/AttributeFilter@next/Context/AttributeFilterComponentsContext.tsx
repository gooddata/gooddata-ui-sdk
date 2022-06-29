// (C) 2019-2022 GoodData Corporation
import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import React, { createContext, useContext } from "react";
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
} from "../Components/types";

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

const ThrowMissingComponentError = (componentName: string) => () => {
    throw new UnexpectedSdkError(
        `Component: ${componentName} is missing in the AttributeFilterComponentsProvider.`,
    );
};

/**
 * @internal
 */
const AttributeFilterComponentsContext = createContext<IAtributeFilterComponentsContext>({
    AttributeFilterError: ThrowMissingComponentError("AttributeFilterError"),
    AttributeFilterButton: ThrowMissingComponentError("AttributeFilterButton"),
    AttributeFilterDropdownBody: ThrowMissingComponentError("AttributeFilterDropdownBody"),
    AttributeFilterDropdownButtons: ThrowMissingComponentError("AttributeFilterDropdownButtons"),
    AttributeFilterDropdownContent: ThrowMissingComponentError("AttributeFilterDropdownContent"),
    AttributeFilterList: ThrowMissingComponentError("AttributeFilterList"),
    AttributeFilterListLoading: ThrowMissingComponentError("AttributeFilterListLoading"),
    AttributeFilterListItem: ThrowMissingComponentError("AttributeFilterListItem"),
    MessageListError: ThrowMissingComponentError("AttributeFilterList"),
    MessageNoData: ThrowMissingComponentError("AttributeFilterList"),
    MessageNoMatchingData: ThrowMissingComponentError("MessageNoMatchingData"),
    MessageParentItemsFiltered: ThrowMissingComponentError("MessageParentItemsFiltered"),
});

AttributeFilterComponentsContext.displayName = "AttributeFilterComponentsContext";

/**
 * @internal
 */
export const useAttributeFilterComponentsContext = (): IAtributeFilterComponentsContext => {
    return useContext(AttributeFilterComponentsContext);
};

/**
 * @internal
 */
export const AttributeFilterComponentsProvider: React.FC<IAtributeFilterComponentsContext> = (props) => {
    const { children, ...components } = props;

    return (
        <AttributeFilterComponentsContext.Provider value={components}>
            {children}
        </AttributeFilterComponentsContext.Provider>
    );
};
