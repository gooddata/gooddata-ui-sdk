// (C) 2022-2025 GoodData Corporation

import { type ComponentType, type ReactNode, createContext, useContext } from "react";

import { type IAttributeFilterErrorProps } from "../Components/AttributeFilterError.js";
import { type IAttributeFilterLoadingProps } from "../Components/AttributeFilterLoading.js";
import { type IAttributeFilterDropdownActionsProps } from "../Components/Dropdown/AttributeFilterDropdownActions.js";
import { type IAttributeFilterDropdownBodyProps } from "../Components/Dropdown/types.js";
import { type IAttributeFilterDropdownButtonProps } from "../Components/DropdownButton/AttributeFilterDropdownButton.js";
import { type IAttributeFilterElementsActionsProps } from "../Components/ElementsSelect/AttributeFilterElementsActions.js";
import { type IAttributeFilterElementsSearchBarProps } from "../Components/ElementsSelect/AttributeFilterElementsSearchBar.js";
import { type IAttributeFilterElementsSelectErrorProps } from "../Components/ElementsSelect/AttributeFilterElementsSelectError.js";
import { type IAttributeFilterElementsSelectLoadingProps } from "../Components/ElementsSelect/AttributeFilterElementsSelectLoading.js";
import { type IAttributeFilterEmptyResultProps } from "../Components/ElementsSelect/EmptyResult/AttributeFilterEmptyResult.js";
import { type IAttributeFilterStatusBarProps } from "../Components/ElementsSelect/StatusBar/types.js";
import {
    type IAttributeFilterElementsSelectItemProps,
    type IAttributeFilterElementsSelectProps,
} from "../Components/ElementsSelect/types.js";
import { type IAttributeFilterCustomComponentProps } from "../types.js";
import { ThrowMissingComponentError } from "../utils.js";

/**
 * Internal type with required component props - used by context consumers.
 * The context provider ensures all components are always defined.
 * @internal
 */
export interface IAttributeFilterComponentsContextValue {
    ErrorComponent: ComponentType<IAttributeFilterErrorProps>;
    LoadingComponent: ComponentType<IAttributeFilterLoadingProps>;
    DropdownButtonComponent: ComponentType<IAttributeFilterDropdownButtonProps>;
    DropdownBodyComponent: ComponentType<IAttributeFilterDropdownBodyProps>;
    DropdownActionsComponent: ComponentType<IAttributeFilterDropdownActionsProps>;
    ElementsSearchBarComponent: ComponentType<IAttributeFilterElementsSearchBarProps>;
    ElementsSelectComponent: ComponentType<IAttributeFilterElementsSelectProps>;
    ElementsSelectLoadingComponent: ComponentType<IAttributeFilterElementsSelectLoadingProps>;
    ElementsSelectItemComponent: ComponentType<IAttributeFilterElementsSelectItemProps>;
    ElementsSelectErrorComponent: ComponentType<IAttributeFilterElementsSelectErrorProps>;
    ElementsSelectActionsComponent: ComponentType<IAttributeFilterElementsActionsProps>;
    EmptyResultComponent: ComponentType<IAttributeFilterEmptyResultProps>;
    StatusBarComponent: ComponentType<IAttributeFilterStatusBarProps>;
}

const AttributeFilterComponentsContext = createContext<IAttributeFilterComponentsContextValue>({
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
export const useAttributeFilterComponentsContext = (): IAttributeFilterComponentsContextValue => {
    return useContext(AttributeFilterComponentsContext);
};

/**
 * @internal
 */
export function AttributeFilterComponentsProvider({
    children,
    ...components
}: IAttributeFilterCustomComponentProps & { children: ReactNode }) {
    // The context provides defaults, so we can safely cast the components
    // Any undefined components will fall back to the context defaults
    return (
        <AttributeFilterComponentsContext.Provider
            value={components as unknown as IAttributeFilterComponentsContextValue}
        >
            {children}
        </AttributeFilterComponentsContext.Provider>
    );
}
