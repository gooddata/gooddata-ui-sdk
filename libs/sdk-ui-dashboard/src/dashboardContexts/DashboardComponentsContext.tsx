// (C) 2019 GoodData Corporation
import React, { createContext, useContext } from "react";
import { IErrorProps, ILoadingProps, UnexpectedSdkError } from "@gooddata/sdk-ui";
import { DashboardLayoutProps } from "../layout/types";
import {
    CustomDashboardInsightComponent,
    CustomDashboardKpiComponent,
    CustomDashboardWidgetComponent,
} from "../widget/types";

/**
 * @internal
 */
interface IDashboardComponentsContext {
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    LayoutComponent: React.ComponentType<DashboardLayoutProps>;
    WidgetComponent: CustomDashboardWidgetComponent;
    InsightComponent: CustomDashboardInsightComponent;
    KpiComponent: CustomDashboardKpiComponent;
}

const ThrowMissingComponentError = (componentName: string) => () => {
    throw new UnexpectedSdkError(
        `Component: ${componentName} is missing in the DashboardComponentsProvider.`,
    );
};

/**
 * @internal
 */
const DashboardComponentsContext = createContext<IDashboardComponentsContext>({
    ErrorComponent: ThrowMissingComponentError("ErrorComponent"),
    LoadingComponent: ThrowMissingComponentError("LoadingComponent"),
    LayoutComponent: ThrowMissingComponentError("LayoutComponent"),
    InsightComponent: ThrowMissingComponentError("InsightComponent"),
    KpiComponent: ThrowMissingComponentError("KpiComponent"),
    WidgetComponent: ThrowMissingComponentError("WidgetComponent"),
});
DashboardComponentsContext.displayName = "DashboardComponentsContext";

/**
 * @internal
 */
export const useDashboardComponentsContext = (
    localComponentOverrides?: Partial<IDashboardComponentsContext>,
): IDashboardComponentsContext => {
    const globalComponents = useContext(DashboardComponentsContext);
    return Object.keys(globalComponents).reduce((acc, key) => {
        acc[key] = localComponentOverrides?.[key] ?? globalComponents[key];
        return acc;
    }, {} as IDashboardComponentsContext);
};

/**
 * @internal
 */
export interface IDashboardComponentsProviderProps extends IDashboardComponentsContext {
    children: React.ReactNode;
}

/**
 * @internal
 */
export function DashboardComponentsProvider(props: IDashboardComponentsProviderProps): JSX.Element {
    const { children, ...components } = props;
    return (
        <DashboardComponentsContext.Provider value={components}>
            {children}
        </DashboardComponentsContext.Provider>
    );
}
