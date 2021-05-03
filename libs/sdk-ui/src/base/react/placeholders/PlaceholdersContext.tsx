// (C) 2019 GoodData Corporation
import React from "react";
import { AttributesProvider } from "./AttributesContext";
import { FiltersProvider } from "./FiltersContext";
import { UndefinedPlaceholderHandling } from "./interfaces";
import { MeasuresProvider } from "./MeasuresContext";

/**
 * @public
 */
export interface IPlaceholdersProviderProps {
    undefinedPlaceholderHandling?: UndefinedPlaceholderHandling;
}

/**
 * @public
 */
export const PlaceholdersProvider: React.FC<IPlaceholdersProviderProps> = (props) => {
    const { undefinedPlaceholderHandling = "none", children } = props;

    return (
        <FiltersProvider undefinedPlaceholderHandling={undefinedPlaceholderHandling}>
            <MeasuresProvider undefinedPlaceholderHandling={undefinedPlaceholderHandling}>
                <AttributesProvider undefinedPlaceholderHandling={undefinedPlaceholderHandling}>
                    {children}
                </AttributesProvider>
            </MeasuresProvider>
        </FiltersProvider>
    );
};
