// (C) 2019-2026 GoodData Corporation

import { type ComponentType, type ReactElement, type ReactNode, createContext, useContext } from "react";

import {
    ErrorComponent,
    type IErrorProps,
    type ILoadingProps,
    LoadingComponent,
    UnexpectedSdkError,
} from "@gooddata/sdk-ui";

import {
    type AttributeFilterComponentProvider,
    type DashboardContentComponentProvider,
    type DateFilterComponentProvider,
    type FilterGroupComponentProvider,
    type InsightBodyComponentProvider,
    type InsightComponentProvider,
    type InsightMenuButtonComponentProvider,
    type InsightMenuComponentProvider,
    type InsightMenuTitleComponentProvider,
    type RichTextComponentProvider,
    type RichTextMenuComponentProvider,
    type RichTextMenuTitleComponentProvider,
    type ShowAsTableButtonComponentProvider,
    type VisualizationSwitcherComponentProvider,
    type VisualizationSwitcherToolbarComponentProvider,
    type WidgetComponentProvider,
} from "./types.js";
import {
    type CustomAlertingDialogComponent,
    type CustomAlertingManagementDialogComponent,
} from "../alerting/types.js";
import {
    type AttributeFilterComponentSet,
    type DashboardLayoutWidgetComponentSet,
    type DateFilterComponentSet,
    type InsightWidgetComponentSet,
    type RichTextWidgetComponentSet,
    type VisualizationSwitcherWidgetComponentSet,
} from "../componentDefinition/types.js";
import { type CustomSidebarComponent } from "../dashboard/DashboardSidebar/types.js";
import { type CustomDashboardSettingsDialogComponent } from "../dashboardSettingsDialog/types.js";
import { type CustomFilterBarComponent } from "../filterBar/filterBar/types.js";
import { type CustomEmptyLayoutDropZoneBodyComponent } from "../flexibleLayout/types.js";
import { type CustomSaveAsDialogComponent } from "../saveAs/types.js";
import {
    type CustomScheduledEmailDialogComponent,
    type CustomScheduledEmailManagementDialogComponent,
} from "../scheduledEmail/types.js";
import { type CustomShareDialogComponent } from "../shareDialog/types.js";
import { type CustomToolbarComponent } from "../toolbar/types.js";
import { type CustomSaveButtonComponent } from "../topBar/buttonBar/button/saveButton/types.js";
import { type CustomSettingButtonComponent } from "../topBar/buttonBar/button/settingButton/types.js";
import { type CustomButtonBarComponent } from "../topBar/buttonBar/types.js";
import { type CustomMenuButtonComponent } from "../topBar/menuButton/types.js";
import { type CustomTitleComponent } from "../topBar/title/types.js";
import { type CustomTopBarComponent } from "../topBar/topBar/types.js";
import { type CustomDashboardLayoutComponent } from "../widget/dashboardLayout/types.js";

/**
 * @internal
 */
interface IDashboardComponentsContext {
    ErrorComponent: ComponentType<IErrorProps>;
    LoadingComponent: ComponentType<ILoadingProps>;
    LayoutComponent: CustomDashboardLayoutComponent;
    WidgetComponentProvider: WidgetComponentProvider;
    InsightComponentProvider: InsightComponentProvider;
    InsightBodyComponentProvider: InsightBodyComponentProvider;
    InsightMenuButtonComponentProvider: InsightMenuButtonComponentProvider;
    InsightMenuComponentProvider: InsightMenuComponentProvider;
    RichTextMenuComponentProvider: RichTextMenuComponentProvider;
    InsightMenuTitleComponentProvider: InsightMenuTitleComponentProvider;
    RichTextMenuTitleComponentProvider: RichTextMenuTitleComponentProvider;
    VisualizationSwitcherToolbarComponentProvider: VisualizationSwitcherToolbarComponentProvider;
    RichTextComponentProvider: RichTextComponentProvider;
    VisualizationSwitcherComponentProvider: VisualizationSwitcherComponentProvider;
    ButtonBarComponent: CustomButtonBarComponent;
    MenuButtonComponent: CustomMenuButtonComponent;
    TitleComponent: CustomTitleComponent;
    TopBarComponent: CustomTopBarComponent;
    ToolbarComponent: CustomToolbarComponent;
    ScheduledEmailDialogComponent: CustomScheduledEmailDialogComponent;
    ScheduledEmailManagementDialogComponent: CustomScheduledEmailManagementDialogComponent;
    AlertingManagementDialogComponent: CustomAlertingManagementDialogComponent;
    AlertingDialogComponent: CustomAlertingDialogComponent;
    ShareDialogComponent: CustomShareDialogComponent;
    SaveAsDialogComponent: CustomSaveAsDialogComponent;
    DashboardAttributeFilterComponentProvider: AttributeFilterComponentProvider;
    DashboardDateFilterComponentProvider: DateFilterComponentProvider;
    DashboardFilterGroupComponentProvider: FilterGroupComponentProvider;
    FilterBarComponent: CustomFilterBarComponent;
    SidebarComponent: CustomSidebarComponent;
    InsightWidgetComponentSet: InsightWidgetComponentSet;
    RichTextWidgetComponentSet: RichTextWidgetComponentSet;
    VisualizationSwitcherWidgetComponentSet: VisualizationSwitcherWidgetComponentSet;
    DashboardLayoutWidgetComponentSet: DashboardLayoutWidgetComponentSet;
    AttributeFilterComponentSet: AttributeFilterComponentSet;
    DateFilterComponentSet: DateFilterComponentSet;
    EmptyLayoutDropZoneBodyComponent: CustomEmptyLayoutDropZoneBodyComponent;
    SaveButtonComponent: CustomSaveButtonComponent;
    SettingButtonComponent: CustomSettingButtonComponent;
    DashboardContentComponentProvider: DashboardContentComponentProvider;
    DashboardSettingsDialogComponent: CustomDashboardSettingsDialogComponent;
    ShowAsTableButtonComponentProvider: ShowAsTableButtonComponentProvider;
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
    RichTextMenuComponentProvider: ThrowMissingComponentError("RichTextMenuComponent"),
    RichTextMenuTitleComponentProvider: ThrowMissingComponentError("RichTextMenuTitleComponentProvider"),
    RichTextComponentProvider: ThrowMissingComponentError("RichTextComponent"),
    VisualizationSwitcherComponentProvider: ThrowMissingComponentError("VisualizationSwitcherComponent"),
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
    AlertingManagementDialogComponent: ThrowMissingComponentError("AlertingManagementDialogComponent"),
    AlertingDialogComponent: ThrowMissingComponentError("AlertingDialogComponent"),
    ShareDialogComponent: ThrowMissingComponentError("ShareDialogComponent"),
    SaveAsDialogComponent: ThrowMissingComponentError("SaveAsDialogComponent"),
    DashboardAttributeFilterComponentProvider: ThrowMissingComponentError(
        "DashboardAttributeFilterComponentProvider",
    ),
    DashboardDateFilterComponentProvider: ThrowMissingComponentError("DashboardDateFilterComponentProvider"),
    DashboardFilterGroupComponentProvider: ThrowMissingComponentError(
        "DashboardFilterGroupComponentProvider",
    ),
    FilterBarComponent: ThrowMissingComponentError("FilterBarComponent"),
    SidebarComponent: ThrowMissingComponentError("SidebarComponent"),
    InsightWidgetComponentSet: null as any, // TODO how to throw here
    RichTextWidgetComponentSet: null as any, // TODO how to throw here
    VisualizationSwitcherWidgetComponentSet: null as any, // TODO how to throw here
    DashboardLayoutWidgetComponentSet: null as any, // TODO how to throw here
    AttributeFilterComponentSet: null as any, // TODO how to throw here
    DateFilterComponentSet: null as any, // TODO how to throw here
    EmptyLayoutDropZoneBodyComponent: ThrowMissingComponentError("EmptyLayoutDropZoneBodyComponent"),
    SaveButtonComponent: ThrowMissingComponentError("SaveButtonComponent"),
    DashboardContentComponentProvider: ThrowMissingComponentError("DashboardContentComponentProvider"),
    VisualizationSwitcherToolbarComponentProvider: ThrowMissingComponentError(
        "VisualizationSwitcherToolbarComponentProvider",
    ),
    SettingButtonComponent: ThrowMissingComponentError("SettingButtonComponent"),
    DashboardSettingsDialogComponent: ThrowMissingComponentError("DashboardSettingsDialogComponent"),
    ShowAsTableButtonComponentProvider: ThrowMissingComponentError("ShowAsTableButtonComponentProvider"),
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
    return (Object.keys(globalComponents) as DashboardComponentContextKey[]).reduce(
        (acc, key) => {
            acc[key] = localComponentOverrides?.[key] ?? globalComponents[key];
            return acc;
        },
        {} as Record<DashboardComponentContextKey, any>,
    );
};

/**
 * @internal
 */
export interface IDashboardComponentsProviderProps extends IDashboardComponentsContext {
    children: ReactNode;
}

/**
 * @internal
 */
export function DashboardComponentsProvider({
    children,
    ...components
}: IDashboardComponentsProviderProps): ReactElement {
    return (
        <DashboardComponentsContext.Provider value={components}>
            {children}
        </DashboardComponentsContext.Provider>
    );
}
