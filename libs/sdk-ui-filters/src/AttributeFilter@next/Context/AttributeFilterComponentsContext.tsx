// (C) 2022 GoodData Corporation
import React, { createContext, useContext } from "react";
import { ThrowMissingComponentError } from "../utils/MissingComponent";
import { IAtributeFilterComponentsContext } from "./types";

const AttributeFilterComponentsContext = createContext<IAtributeFilterComponentsContext>({
    AttributeFilterError: ThrowMissingComponentError(
        "AttributeFilterError",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterButton: ThrowMissingComponentError(
        "AttributeFilterButton",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterDropdownBody: ThrowMissingComponentError(
        "AttributeFilterDropdownBody",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterDropdownButtons: ThrowMissingComponentError(
        "AttributeFilterDropdownButtons",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterDropdownContent: ThrowMissingComponentError(
        "AttributeFilterDropdownContent",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterList: ThrowMissingComponentError(
        "AttributeFilterList",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterListLoading: ThrowMissingComponentError(
        "AttributeFilterListLoading",
        "AttributeFilterComponentsContext",
    ),
    AttributeFilterListItem: ThrowMissingComponentError(
        "AttributeFilterListItem",
        "AttributeFilterComponentsContext",
    ),
    MessageListError: ThrowMissingComponentError("AttributeFilterList", "AttributeFilterComponentsContext"),
    MessageNoData: ThrowMissingComponentError("AttributeFilterList", "AttributeFilterComponentsContext"),
    MessageNoMatchingData: ThrowMissingComponentError(
        "MessageNoMatchingData",
        "AttributeFilterComponentsContext",
    ),
    MessageParentItemsFiltered: ThrowMissingComponentError(
        "MessageParentItemsFiltered",
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
