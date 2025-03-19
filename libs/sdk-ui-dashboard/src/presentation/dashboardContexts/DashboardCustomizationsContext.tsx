// (C) 2019-2025 GoodData Corporation
import React, { createContext, useContext } from "react";

import { DashboardLayoutExportTransformFn, DashboardExportSlideConfig } from "../../model/index.js";

import { InsightMenuItemsProvider, RichTextMenuItemsProvider } from "./types.js";

/**
 * @internal
 */
interface IDashboardCustomizationsContext {
    insightMenuItemsProvider?: InsightMenuItemsProvider;
    richTextMenuItemsProvider?: RichTextMenuItemsProvider;
    existingExportTransformFn?: DashboardLayoutExportTransformFn;
    slideConfig?: DashboardExportSlideConfig;
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
