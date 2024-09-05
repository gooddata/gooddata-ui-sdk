// (C) 2021-2024 GoodData Corporation
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
export type { IDashboardKpiProps, CustomDashboardKpiComponent } from "./kpi/types.js";
export type { IDashboardWidgetProps, CustomDashboardWidgetComponent } from "./widget/types.js";
export type { CustomDashboardRichTextComponent, IDashboardRichTextProps } from "../widget/richText/types.js";
export type {
    CustomDashboardVisualizationSwitcherComponent,
    IDashboardVisualizationSwitcherProps,
} from "../widget/visualizationSwitcher/types.js";

export { CustomVisualizationSwitcherToolbarComponent } from "../widget/visualizationSwitcher/configuration/types.js";
