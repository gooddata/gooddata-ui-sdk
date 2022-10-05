// (C) 2022 GoodData Corporation
import React, { createContext, useContext } from "react";
import { ThrowMissingComponentError } from "../utils";
import { IAttributeFilterCustomComponentProps } from "../types";

const AttributeFilterComponentsContext = createContext<IAttributeFilterCustomComponentProps>({
    ErrorComponent: ThrowMissingComponentError("ErrorComponent", "AttributeFilterComponentsContext"),
    LoadingComponent: ThrowMissingComponentError("LoadingComponent", "AttributeFilterComponentsContext"),
    DropdownButtonComponent: ThrowMissingComponentError(
        "DropdownButtonComponent",
        "AttributeFilterComponentsContext",
    ),
    DropdownBodyComponent: ThrowMissingComponentError(
        "DropdownBodyComponent",
        "AttributeFilterComponentsContext",
    ),
    DropdownActionsComponent: ThrowMissingComponentError(
        "DropdownActionsComponent",
        "AttributeFilterComponentsContext",
    ),
    ElementsSearchBarComponent: ThrowMissingComponentError(
        "ElementsSearchBarComponent",
        "AttributeFilterComponentsContext",
    ),
    ElementsSelectComponent: ThrowMissingComponentError(
        "ElementsSelectComponent",
        "AttributeFilterComponentsContext",
    ),
    ElementsSelectLoadingComponent: ThrowMissingComponentError(
        "ElementsSelectLoadingComponent",
        "AttributeFilterComponentsContext",
    ),
    ElementsSelectItemComponent: ThrowMissingComponentError(
        "ElementsSelectItemComponent",
        "AttributeFilterComponentsContext",
    ),
    ElementsSelectErrorComponent: ThrowMissingComponentError(
        "ElementsSelectErrorComponent",
        "AttributeFilterComponentsContext",
    ),
    ElementsSelectActionsComponent: ThrowMissingComponentError(
        "ElementsSelectActionsComponent",
        "AttributeFilterComponentsContext",
    ),
    EmptyResultComponent: ThrowMissingComponentError(
        "EmptyResultComponent",
        "AttributeFilterComponentsContext",
    ),
    StatusBarComponent: ThrowMissingComponentError("StatusBarComponent", "AttributeFilterComponentsContext"),
    FilterError: ThrowMissingComponentError("FilterError", "AttributeFilterComponentsContext"),
    FilterLoading: ThrowMissingComponentError("FilterLoading", "AttributeFilterComponentsContext"),
});

AttributeFilterComponentsContext.displayName = "AttributeFilterComponentsContext";

/**
 * @internal
 */
export const useAttributeFilterComponentsContext = (): IAttributeFilterCustomComponentProps => {
    return useContext(AttributeFilterComponentsContext);
};

/**
 * @internal
 */
export const AttributeFilterComponentsProvider: React.FC<IAttributeFilterCustomComponentProps> = (props) => {
    const { children, ...components } = props;

    return (
        <AttributeFilterComponentsContext.Provider value={components}>
            {children}
        </AttributeFilterComponentsContext.Provider>
    );
};
