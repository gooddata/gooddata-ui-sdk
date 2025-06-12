// (C) 2021-2025 GoodData Corporation
export type {
    IDashboardInsightProps,
    CustomDashboardInsightComponent,
    IInsightBodyProps,
    CustomInsightBodyComponent,
} from "./insight/types.js";
export type {
    CustomDashboardInsightMenuButtonComponent,
    CustomDashboardInsightMenuComponent,
    CustomDashboardInsightMenuTitleComponent,
    IDashboardInsightMenuButtonProps,
    IDashboardInsightMenuProps,
    IDashboardInsightMenuTitleProps,
    IInsightMenuItem,
    IInsightMenuItemButton,
    IInsightMenuItemSeparator,
} from "./insightMenu/types.js";
export type { CustomDashboardRichTextComponent, IDashboardRichTextProps } from "./richText/types.js";
export type {
    CustomDashboardRichTextMenuComponent,
    CustomDashboardRichTextMenuTitleComponent,
    CustomDashboardRichTextMenuButtonComponent,
    IRichTextMenuItem,
    IDashboardRichTextMenuButtonProps,
    IDashboardRichTextMenuTitleProps,
    IDashboardRichTextMenuProps,
    IRichTextMenuItemButton,
    IRichTextMenuSubmenu,
    IIRichTextMenuItemSeparator,
} from "./richTextMenu/types.js";
export type { IDashboardWidgetProps, CustomDashboardWidgetComponent } from "./widget/types.js";
export type {
    CustomDashboardVisualizationSwitcherComponent,
    IDashboardVisualizationSwitcherProps,
} from "../widget/visualizationSwitcher/types.js";

export type { CustomVisualizationSwitcherToolbarComponent } from "../widget/visualizationSwitcher/configuration/types.js";

export type {
    CustomDashboardLayoutComponent as CustomDashboardNestedLayoutComponent,
    IDashboardLayoutProps as IDashboardNestedLayoutProps,
} from "../widget/dashboardLayout/types.js";
export type { CustomShowAsTableButtonComponent } from "./showAsTableButton/types.js";
