// (C) 2020 GoodData Corporation
import React from "react";
import { ICatalogAttribute, ICatalogDateAttribute } from "@gooddata/sdk-backend-spi";

const AttributesWithDrillDownContext = React.createContext<Array<ICatalogAttribute | ICatalogDateAttribute>>(
    [],
);
AttributesWithDrillDownContext.displayName = "AttributesWithDrillDownContext";

/**
 * @internal
 */
export interface IAttributesWithDrillDownProviderProps {
    attributes: Array<ICatalogAttribute | ICatalogDateAttribute>;
}

/**
 * @internal
 */
export const AttributesWithDrillDownProvider: React.FC<IAttributesWithDrillDownProviderProps> = ({
    children,
    attributes,
}) => {
    return (
        <AttributesWithDrillDownContext.Provider value={attributes}>
            {children}
        </AttributesWithDrillDownContext.Provider>
    );
};

/**
 * @internal
 */
export const useAttributesWithDrillDown = (): Array<ICatalogAttribute | ICatalogDateAttribute> => {
    return React.useContext(AttributesWithDrillDownContext);
};
