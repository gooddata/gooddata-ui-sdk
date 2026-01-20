// (C) 2019-2026 GoodData Corporation

import { type ReactElement, type ReactNode, createContext, useContext } from "react";

import { type InsightMenuItemsProvider, type RichTextMenuItemsProvider } from "./types.js";
import {
    type DashboardLayoutExportTransformFn,
    type IDashboardExportSlideConfig,
} from "../../model/index.js";

/**
 * @internal
 */
interface IDashboardCustomizationsContext {
    insightMenuItemsProvider?: InsightMenuItemsProvider;
    richTextMenuItemsProvider?: RichTextMenuItemsProvider;
    existingExportTransformFn?: DashboardLayoutExportTransformFn;
    slideConfig?: IDashboardExportSlideConfig;
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
export function DashboardCustomizationsProvider({
    children,
    ...components
}: IDashboardCustomizationsProviderProps): ReactElement {
    return (
        <DashboardCustomizationsContext.Provider value={components}>
            {children}
        </DashboardCustomizationsContext.Provider>
    );
}
