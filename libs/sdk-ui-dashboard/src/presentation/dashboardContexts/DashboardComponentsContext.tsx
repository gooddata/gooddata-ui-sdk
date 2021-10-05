// (C) 2019 GoodData Corporation
import React, { createContext, useContext } from "react";
import { IErrorProps, ILoadingProps, UnexpectedSdkError } from "@gooddata/sdk-ui";

import { DashboardLayoutProps } from "../layout/types";
import {
    CustomDashboardInsightComponent,
    CustomDashboardKpiComponent,
    CustomDashboardWidgetComponent,
} from "../widget/types";
import {
    CustomButtonBarComponent,
    CustomMenuButtonComponent,
    CustomTitleComponent,
    CustomTopBarComponent,
} from "../topBar/types";
import { CustomScheduledEmailDialogComponent } from "../scheduledEmail/types";
import {
    CustomDashboardAttributeFilterComponent,
    CustomDashboardDateFilterComponent,
    CustomFilterBarComponent,
} from "../filterBar/types";
import { IDashboardAttributeFilter, IInsightWidget, IKpiWidget, ILegacyKpi } from "@gooddata/sdk-backend-spi";
import { CustomSaveAsDialogComponent } from "../saveAs/types";
import { IInsight } from "@gooddata/sdk-model";
import { ExtendedDashboardWidget } from "../../model";

/**
 * @internal
 */
interface IDashboardComponentsContext {
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    LayoutComponent: React.ComponentType<DashboardLayoutProps>;
    WidgetComponentProvider: (widget: ExtendedDashboardWidget) => CustomDashboardWidgetComponent;
    InsightComponentProvider: (insight: IInsight, widget: IInsightWidget) => CustomDashboardInsightComponent;
    KpiComponentProvider: (kpi: ILegacyKpi, widget: IKpiWidget) => CustomDashboardKpiComponent;
    ButtonBarComponent: CustomButtonBarComponent;
    MenuButtonComponent: CustomMenuButtonComponent;
    TitleComponent: CustomTitleComponent;
    TopBarComponent: CustomTopBarComponent;
    ScheduledEmailDialogComponent: CustomScheduledEmailDialogComponent;
    SaveAsDialogComponent: CustomSaveAsDialogComponent;
    DashboardAttributeFilterComponentProvider: (
        filter: IDashboardAttributeFilter,
    ) => CustomDashboardAttributeFilterComponent;
    DashboardDateFilterComponent: CustomDashboardDateFilterComponent;
    FilterBarComponent: CustomFilterBarComponent;
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
    InsightComponentProvider: ThrowMissingComponentError("InsightComponent"),
    KpiComponentProvider: ThrowMissingComponentError("KpiComponent"),
    WidgetComponentProvider: ThrowMissingComponentError("WidgetComponent"),
    ButtonBarComponent: ThrowMissingComponentError("ButtonBarComponent"),
    MenuButtonComponent: ThrowMissingComponentError("MenuButtonComponent"),
    TitleComponent: ThrowMissingComponentError("TitleComponent"),
    TopBarComponent: ThrowMissingComponentError("TopBarComponent"),
    ScheduledEmailDialogComponent: ThrowMissingComponentError("ScheduledEmailDialogComponent"),
    SaveAsDialogComponent: ThrowMissingComponentError("SaveAsDialogComponent"),
    DashboardAttributeFilterComponentProvider: ThrowMissingComponentError(
        "DashboardAttributeFilterComponentFactory",
    ),
    DashboardDateFilterComponent: ThrowMissingComponentError("DashboardDateFilterComponent"),
    FilterBarComponent: ThrowMissingComponentError("FilterBarComponent"),
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
