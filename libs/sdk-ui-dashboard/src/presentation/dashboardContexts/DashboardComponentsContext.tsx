// (C) 2019-2025 GoodData Corporation
import { ComponentType, createContext, ReactElement, ReactNode, useContext } from "react";
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
    CustomSettingButtonComponent,
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
    DashboardContentComponentProvider,
    DateFilterComponentProvider,
    InsightBodyComponentProvider,
    InsightComponentProvider,
    InsightMenuButtonComponentProvider,
    InsightMenuComponentProvider,
    InsightMenuTitleComponentProvider,
    RichTextComponentProvider,
    RichTextMenuComponentProvider,
    RichTextMenuTitleComponentProvider,
    ShowAsTableButtonComponentProvider,
    VisualizationSwitcherComponentProvider,
    VisualizationSwitcherToolbarComponentProvider,
    WidgetComponentProvider,
} from "./types.js";
import { CustomSidebarComponent } from "../dashboard/DashboardSidebar/types.js";
import {
    AttributeFilterComponentSet,
    DashboardLayoutWidgetComponentSet,
    DateFilterComponentSet,
    InsightWidgetComponentSet,
    RichTextWidgetComponentSet,
    VisualizationSwitcherWidgetComponentSet,
} from "../componentDefinition/types.js";
import { CustomToolbarComponent } from "../toolbar/types.js";
import { CustomAlertingDialogComponent, CustomAlertingManagementDialogComponent } from "../alerting/types.js";
import { CustomDashboardSettingsDialogComponent } from "../dashboardSettingsDialog/types.js";

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
export function DashboardComponentsProvider(props: IDashboardComponentsProviderProps): ReactElement {
    const { children, ...components } = props;
    return (
        <DashboardComponentsContext.Provider value={components}>
            {children}
        </DashboardComponentsContext.Provider>
    );
}
