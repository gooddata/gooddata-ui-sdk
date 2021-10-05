// (C) 2019 GoodData Corporation
import React, { createContext, useContext } from "react";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";

import { IInsightMenuItem } from "../widget/types";

/**
 * @internal
 */
interface IDashboardCustomizationsContext {
    insightMenuItemsProvider?: (
        insight: IInsight,
        widget: IInsightWidget,
        defaultItems: IInsightMenuItem[],
        closeMenu: () => void,
    ) => IInsightMenuItem[];
}

/**
 * @internal
 */
const DashboardCustomizationsContext = createContext<IDashboardCustomizationsContext>({});
DashboardCustomizationsContext.displayName = "DashboardCustomizationsContext";

/**
 * @internal
 */
export const useDashboardCustomizationsContext = (
    localCustomizationOverrides?: Partial<IDashboardCustomizationsContext>,
): IDashboardCustomizationsContext => {
    const globalCustomizations = useContext(DashboardCustomizationsContext);
    return {
        ...globalCustomizations,
        ...localCustomizationOverrides,
    };
};

/**
 * @internal
 */
export interface IDashboardCustomizationsProviderProps extends IDashboardCustomizationsContext {
    children: React.ReactNode;
}

/**
 * @internal
 */
export function DashboardCustomizationsProvider(props: IDashboardCustomizationsProviderProps): JSX.Element {
    const { children, ...components } = props;
    return (
        <DashboardCustomizationsContext.Provider value={components}>
            {children}
        </DashboardCustomizationsContext.Provider>
    );
}
