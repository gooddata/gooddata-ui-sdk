// (C) 2022 GoodData Corporation
import React, { useContext } from "react";
import { IAttributeFilterCoreProps } from "../types";
import { useAttributeFilterController } from "../hooks/useAttributeFilterController";

/**
 * @alpha
 */
export type IAttributeFilterContext = ReturnType<typeof useAttributeFilterController>;

export const AttributeFilterContext = React.createContext<IAttributeFilterContext>(null);

AttributeFilterContext.displayName = "AttributeFilterContext";

/**
 * @alpha
 */
export const useAttributeFilterContext = (): IAttributeFilterContext => useContext(AttributeFilterContext);

/**
 * @internal
 */
export const AttributeFilterContextProvider: React.FC<IAttributeFilterCoreProps> = (props) => {
    const { children } = props;

    const controller = useAttributeFilterController(props);

    return <AttributeFilterContext.Provider value={controller}>{children}</AttributeFilterContext.Provider>;
};
