// (C) 2019-2025 GoodData Corporation

import { ReactElement, ReactNode, createContext, useContext } from "react";

import { InsightMenuItemsProvider, RichTextMenuItemsProvider } from "./types.js";
import { DashboardExportSlideConfig, DashboardLayoutExportTransformFn } from "../../model/index.js";

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
    children: ReactNode;
}

/**
 * @internal
 */
export function DashboardCustomizationsProvider(props: IDashboardCustomizationsProviderProps): ReactElement {
    const { children, ...components } = props;
    return (
        <DashboardCustomizationsContext.Provider value={components}>
            {children}
        </DashboardCustomizationsContext.Provider>
    );
}
