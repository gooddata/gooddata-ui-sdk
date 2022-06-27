// (C) 2019-2022 GoodData Corporation
import React, { createContext, useContext } from "react";
import { IAttributeFilterButtonProps } from "../Components/AttributeFilterButton";
import {
    AttributeFilterDropdownButtons,
    IAttributeFilterDropdownButtonsProps,
} from "../Components/AttributeFilterDropdownButtons";

import { AttributeFilterError, IAttributeFilterErrorProps } from "../Components/AttributeFilterError";
import { AttributeFilterSimpleButton } from "../Components/AttributeFilterSimpleButton";

/**
 * @internal
 */
export interface IAtributeFilterComponentsContext {
    AttributeFilterError: React.ComponentType<IAttributeFilterErrorProps>;
    AttributeFilterButton: React.ComponentType<IAttributeFilterButtonProps>;
    AttributeFilterDropdownButtons: React.ComponentType<IAttributeFilterDropdownButtonsProps>;
}

/**
 * @internal
 */
export const AttributeFilterDefaultComponents: IAtributeFilterComponentsContext = {
    AttributeFilterError: AttributeFilterError,
    AttributeFilterButton: AttributeFilterSimpleButton,
    AttributeFilterDropdownButtons: AttributeFilterDropdownButtons,
};

/**
 * @internal
 */
const AttributeFilterComponentsContext = createContext<IAtributeFilterComponentsContext>(
    AttributeFilterDefaultComponents,
);

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
export interface IAtributeFilterComponentsProviderProps extends Partial<IAtributeFilterComponentsContext> {
    children: React.ReactNode;
}

/**
 * @internal
 */
export function AttributeFilterComponentsProvider(
    props: IAtributeFilterComponentsProviderProps,
): JSX.Element {
    const { children, ...componentsProps } = props;

    const components = Object.keys(AttributeFilterDefaultComponents).reduce((acc, key) => {
        acc[key] = componentsProps?.[key] ?? AttributeFilterDefaultComponents[key];
        return acc;
    }, {} as IAtributeFilterComponentsContext);

    return (
        <AttributeFilterComponentsContext.Provider value={components}>
            {children}
        </AttributeFilterComponentsContext.Provider>
    );
}
