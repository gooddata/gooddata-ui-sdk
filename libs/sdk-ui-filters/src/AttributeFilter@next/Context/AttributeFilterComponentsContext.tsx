// (C) 2022 GoodData Corporation
import React, { createContext, useContext } from "react";
import { ThrowMissingComponentError } from "../utils";
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
} from "../Components/types";

/**
 * @internal
 */
export interface IAtributeFilterComponentsContext {
    AttributeFilterLoading: React.ComponentType;
    AttributeFilterError: React.ComponentType<IAttributeFilterErrorProps>;
    AttributeFilterDropdownButton: React.ComponentType<IAttributeFilterDropdownButtonProps>;
    AttributeFilterDropdownBody: React.ComponentType<IAttributeFilterDropdownBodyProps>;
    AttributeFilterDropdownActions: React.ComponentType<IAttributeFilterDropdownActionsProps>;
    AttributeFilterDropdownContent: React.ComponentType<IAttributeFilterDropdownContentProps>;
    AttributeFilterElementsSelect: React.ComponentType<IAttributeFilterElementsSelectProps>;
    AttributeFilterElementsSelectItem: React.ComponentType<IAttributeFilterElementsSelectItemProps>;
    AttributeFilterElementsSelectLoading: React.ComponentType<IAttributeFilterElementsSelectLoadingProps>;
    AttributeFilterElementsSelectError: React.ComponentType;
    AttributeFilterElementsSelectNoData: React.ComponentType;
    AttributeFilterElementsSelectNoMatchingData: React.ComponentType<IAttributeFilterElementsSelectNoMatchingDataProps>;
    AttributeFilterElementsSelectParentItemsFiltered: React.ComponentType<IAttributeFilterElementsSelectParentItemsFilteredProps>;
}

const AttributeFilterComponentsContext = createContext<IAtributeFilterComponentsContext>({
    AttributeFilterError: ThrowMissingComponentError(
        "AttributeFilterError",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterLoading: ThrowMissingComponentError(
        "AttributeFilterLoading",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterDropdownButton: ThrowMissingComponentError(
        "AttributeFilterDropdownButton",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterDropdownBody: ThrowMissingComponentError(
        "AttributeFilterDropdownBody",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterDropdownActions: ThrowMissingComponentError(
        "AttributeFilterDropdownActions",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterDropdownContent: ThrowMissingComponentError(
        "AttributeFilterDropdownContent",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterElementsSelect: ThrowMissingComponentError(
        "AttributeFilterElementsSelect",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterElementsSelectLoading: ThrowMissingComponentError(
        "AttributeFilterElementsSelectLoading",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterElementsSelectItem: ThrowMissingComponentError(
        "AttributeFilterElementsSelectItem",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterElementsSelectError: ThrowMissingComponentError(
        "AttributeFilterElementsSelectError",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterElementsSelectNoData: ThrowMissingComponentError(
        "AttributeFilterElementsSelectNoData",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterElementsSelectNoMatchingData: ThrowMissingComponentError(
        "AttributeFilterElementsSelectNoMatchingData",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterElementsSelectParentItemsFiltered: ThrowMissingComponentError(
        "AttributeFilterElementsSelectParentItemsFiltered",
        "AttributeFilterComponentsContext",
    ),
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
