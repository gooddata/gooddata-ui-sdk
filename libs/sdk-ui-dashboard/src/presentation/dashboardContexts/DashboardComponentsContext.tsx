// (C) 2019-2023 GoodData Corporation
import React, { createContext, useContext } from "react";
import {
    ErrorComponent,
    IErrorProps,
    ILoadingProps,
    LoadingComponent,
    UnexpectedSdkError,
} from "@gooddata/sdk-ui";

import { CustomDashboardLayoutComponent, CustomEmptyLayoutDropZoneBodyComponent } from "../layout/types.js";
import {
    CustomButtonBarComponent,
    CustomMenuButtonComponent,
    CustomTitleComponent,
    CustomTopBarComponent,
    CustomSaveButtonComponent,
} from "../topBar/types.js";
import {
    CustomScheduledEmailDialogComponent,
    CustomScheduledEmailManagementDialogComponent,
} from "../scheduledEmail/types.js";
import { CustomFilterBarComponent } from "../filterBar/types.js";
import { CustomSaveAsDialogComponent } from "../saveAs/types.js";
import { CustomShareDialogComponent } from "../shareDialog/types.js";
import {
    AttributeFilterComponentProvider,
    DateFilterComponentProvider,
    InsightBodyComponentProvider,
    InsightComponentProvider,
    InsightMenuButtonComponentProvider,
    InsightMenuComponentProvider,
    InsightMenuTitleComponentProvider,
    KpiComponentProvider,
    WidgetComponentProvider,
} from "./types.js";
import { CustomSidebarComponent } from "../dashboard/DashboardSidebar/types.js";
import {
    AttributeFilterComponentSet,
    InsightWidgetComponentSet,
    KpiWidgetComponentSet,
} from "../componentDefinition/types.js";
import { CustomToolbarComponent } from "../toolbar/types.js";

/**
 * @internal
 */
interface IDashboardComponentsContext {
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    LayoutComponent: CustomDashboardLayoutComponent;
    WidgetComponentProvider: WidgetComponentProvider;
    InsightComponentProvider: InsightComponentProvider;
    InsightBodyComponentProvider: InsightBodyComponentProvider;
    InsightMenuButtonComponentProvider: InsightMenuButtonComponentProvider;
    InsightMenuComponentProvider: InsightMenuComponentProvider;
    InsightMenuTitleComponentProvider: InsightMenuTitleComponentProvider;
    KpiComponentProvider: KpiComponentProvider;
    ButtonBarComponent: CustomButtonBarComponent;
    MenuButtonComponent: CustomMenuButtonComponent;
    TitleComponent: CustomTitleComponent;
    TopBarComponent: CustomTopBarComponent;
    ToolbarComponent: CustomToolbarComponent;
    ScheduledEmailDialogComponent: CustomScheduledEmailDialogComponent;
    ScheduledEmailManagementDialogComponent: CustomScheduledEmailManagementDialogComponent;
    ShareDialogComponent: CustomShareDialogComponent;
    SaveAsDialogComponent: CustomSaveAsDialogComponent;
    DashboardAttributeFilterComponentProvider: AttributeFilterComponentProvider;
    DashboardDateFilterComponentProvider: DateFilterComponentProvider;
    FilterBarComponent: CustomFilterBarComponent;
    SidebarComponent: CustomSidebarComponent;
    InsightWidgetComponentSet: InsightWidgetComponentSet;
    KpiWidgetComponentSet: KpiWidgetComponentSet;
    AttributeFilterComponentSet: AttributeFilterComponentSet;
    EmptyLayoutDropZoneBodyComponent: CustomEmptyLayoutDropZoneBodyComponent;
    SaveButtonComponent: CustomSaveButtonComponent;
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
    ErrorComponent: ErrorComponent,
    LoadingComponent: LoadingComponent,
    LayoutComponent: ThrowMissingComponentError("LayoutComponent"),
    InsightComponentProvider: ThrowMissingComponentError("InsightComponent"),
    InsightBodyComponentProvider: ThrowMissingComponentError("InsightBodyComponent"),
    InsightMenuButtonComponentProvider: ThrowMissingComponentError("InsightMenuButtonComponent"),
    InsightMenuComponentProvider: ThrowMissingComponentError("InsightMenuComponent"),
    InsightMenuTitleComponentProvider: ThrowMissingComponentError("InsightMenuTitleComponent"),
    KpiComponentProvider: ThrowMissingComponentError("KpiComponent"),
    WidgetComponentProvider: ThrowMissingComponentError("WidgetComponent"),
    ButtonBarComponent: ThrowMissingComponentError("ButtonBarComponent"),
    MenuButtonComponent: ThrowMissingComponentError("MenuButtonComponent"),
    TitleComponent: ThrowMissingComponentError("TitleComponent"),
    TopBarComponent: ThrowMissingComponentError("TopBarComponent"),
    ToolbarComponent: ThrowMissingComponentError("ToolbarComponent"),
    ScheduledEmailDialogComponent: ThrowMissingComponentError("ScheduledEmailDialogComponent"),
    ScheduledEmailManagementDialogComponent: ThrowMissingComponentError(
        "ScheduledEmailManagementDialogComponent",
    ),
    ShareDialogComponent: ThrowMissingComponentError("ShareDialogComponent"),
    SaveAsDialogComponent: ThrowMissingComponentError("SaveAsDialogComponent"),
    DashboardAttributeFilterComponentProvider: ThrowMissingComponentError(
        "DashboardAttributeFilterComponentProvider",
    ),
    DashboardDateFilterComponentProvider: ThrowMissingComponentError("DashboardDateFilterComponentProvider"),
    FilterBarComponent: ThrowMissingComponentError("FilterBarComponent"),
    SidebarComponent: ThrowMissingComponentError("SidebarComponent"),
    InsightWidgetComponentSet: null as any, // TODO how to throw here
    KpiWidgetComponentSet: null as any, // TODO how to throw here
    AttributeFilterComponentSet: null as any, // TODO how to throw here
    EmptyLayoutDropZoneBodyComponent: ThrowMissingComponentError("EmptyLayoutDropZoneBodyComponent"),
    SaveButtonComponent: ThrowMissingComponentError("SaveButtonComponent"),
});
DashboardComponentsContext.displayName = "DashboardComponentsContext";

type DashboardComponentContextKey = keyof IDashboardComponentsContext;

/**
 * @internal
 */
export const useDashboardComponentsContext = (
    localComponentOverrides?: Partial<IDashboardComponentsContext>,
): IDashboardComponentsContext => {
    const globalComponents = useContext(DashboardComponentsContext);
    // cannot just spread here, we only want to use overrides that are not undefined
    return (Object.keys(globalComponents) as DashboardComponentContextKey[]).reduce((acc, key) => {
        acc[key] = localComponentOverrides?.[key] ?? globalComponents[key];
        return acc;
    }, {} as Record<DashboardComponentContextKey, any>);
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
