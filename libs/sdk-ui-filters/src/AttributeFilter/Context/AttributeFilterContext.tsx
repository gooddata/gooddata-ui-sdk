// (C) 2022 GoodData Corporation
import React, { useContext } from "react";
import { IAttributeFilterCoreProps } from "../types";
import { useAttributeFilterController } from "../hooks/useAttributeFilterController";
import { AttributeFilterController } from "../hooks/types";

/**
 * The return type of {@link useAttributeFilterContext}.
 * @beta
 */
export type IAttributeFilterContext = AttributeFilterController &
    Pick<IAttributeFilterCoreProps, "fullscreenOnMobile" | "title">;

export const AttributeFilterContext = React.createContext<IAttributeFilterContext>(null);

AttributeFilterContext.displayName = "AttributeFilterContext";

/**
 * Context providing AttributeFilter state and callbacks wrapped as {@link AttributeFilterController}.
 * @beta
 */
export const useAttributeFilterContext = (): IAttributeFilterContext => useContext(AttributeFilterContext);

/**
 * @internal
 */
export const AttributeFilterContextProvider: React.FC<IAttributeFilterCoreProps> = (props) => {
    const { children, fullscreenOnMobile, title: titleInput } = props;

    const controller = useAttributeFilterController(props);
    const title = titleInput ?? controller?.attribute?.title ?? "";

    return (
        <AttributeFilterContext.Provider value={{ ...controller, fullscreenOnMobile, title }}>
            {children}
        </AttributeFilterContext.Provider>
    );
};
