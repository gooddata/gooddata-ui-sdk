// (C) 2022 GoodData Corporation
import React, { useContext } from "react";
import { IAttributeElement, IAttributeFilter, Identifier } from "@gooddata/sdk-model";
import { AttributeFiltersOrPlaceholders, IPlaceholder } from "@gooddata/sdk-ui";
import { OnApplyCallbackType, ParentFilterOverAttributeType } from "../types";
import { useAttributeFilterController } from "../hooks/useAttributeFilterController";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export type IAttributeFilterContext = ReturnType<typeof useAttributeFilterController>;

export const AttributeFilterContext = React.createContext<IAttributeFilterContext>(null);

AttributeFilterContext.displayName = "AttributeFilterContext";

/**
 * @internal
 */
export const useAttributeFilterContext = (): IAttributeFilterContext => useContext(AttributeFilterContext);

/**
 * @internal
 */
export interface IAttributeFilterProviderProps {
    backend?: IAnalyticalBackend;
    workspace?: string;

    title?: string;
    filter?: IAttributeFilter;
    identifier?: Identifier;
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>;
    parentFilters?: AttributeFiltersOrPlaceholders;
    parentFilterOverAttribute?: ParentFilterOverAttributeType;

    onApply?: OnApplyCallbackType;

    hiddenElements?: string[];
    staticElements?: IAttributeElement[];
}

/**
 * @internal
 */
export const AttributeFilterContextProvider: React.FC<IAttributeFilterProviderProps> = (props) => {
    const { children } = props;

    const controller = useAttributeFilterController(props);

    return <AttributeFilterContext.Provider value={controller}>{children}</AttributeFilterContext.Provider>;
};
