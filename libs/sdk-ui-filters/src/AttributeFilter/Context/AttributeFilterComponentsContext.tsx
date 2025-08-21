// (C) 2022-2025 GoodData Corporation
import React, { createContext, useContext } from "react";

import { IAttributeFilterCustomComponentProps } from "../types.js";
import { ThrowMissingComponentError } from "../utils.js";

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
export function AttributeFilterComponentsProvider(
    props: IAttributeFilterCustomComponentProps & { children: React.ReactNode },
) {
    const { children, ...components } = props;

    return (
        <AttributeFilterComponentsContext.Provider value={components}>
            {children}
        </AttributeFilterComponentsContext.Provider>
    );
}
