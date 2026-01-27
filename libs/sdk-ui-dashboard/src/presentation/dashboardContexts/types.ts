// (C) 2021-2026 GoodData Corporation

import { type ComponentType } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IDashboard,
    type IDashboardAttributeFilter,
    type IDashboardDateFilter,
    type IDashboardFilterGroup,
    type IDashboardLayout,
    type IInsight,
    type IInsightWidget,
    type IRichTextWidget,
    type IVisualizationSwitcherWidget,
    type IWorkspacePermissions,
    type ObjRef,
} from "@gooddata/sdk-model";
import { type ILoadingProps } from "@gooddata/sdk-ui";

import { type DashboardConfig } from "../../model/types/commonTypes.js";
import { type ExtendedDashboardWidget } from "../../model/types/layoutTypes.js";
import { type RenderMode } from "../../types.js";
import {
    type CustomDashboardAttributeFilterComponent,
    type CustomDashboardFilterGroupComponent,
} from "../filterBar/attributeFilter/types.js";
import { type CustomDashboardDateFilterComponent } from "../filterBar/dateFilter/types.js";
import { type CustomFilterBarComponent, type IFilterBarProps } from "../filterBar/filterBar/types.js";
import { type CustomTitleComponent, type ITitleProps } from "../topBar/title/types.js";
import { type CustomTopBarComponent, type ITopBarProps } from "../topBar/topBar/types.js";
import {
    type CustomDashboardLayoutComponent,
    type CustomDashboardLayoutComponent as CustomDashboardNestedLayoutComponent,
    type IDashboardLayoutProps,
} from "../widget/dashboardLayout/types.js";
import {
    type CustomDashboardInsightComponent,
    type CustomInsightBodyComponent,
} from "../widget/insight/types.js";
import {
    type CustomDashboardInsightMenuButtonComponent,
    type CustomDashboardInsightMenuComponent,
    type CustomDashboardInsightMenuTitleComponent,
    type IInsightMenuItem,
} from "../widget/insightMenu/types.js";
import { type CustomDashboardRichTextComponent } from "../widget/richText/types.js";
import {
    type CustomDashboardRichTextMenuComponent,
    type CustomDashboardRichTextMenuTitleComponent,
    type IRichTextMenuItem,
} from "../widget/richTextMenu/types.js";
import { type CustomShowAsTableButtonComponent } from "../widget/showAsTableButton/types.js";
import { type CustomVisualizationSwitcherToolbarComponent } from "../widget/visualizationSwitcher/configuration/types.js";
import { type CustomDashboardVisualizationSwitcherComponent } from "../widget/visualizationSwitcher/types.js";
import { type CustomDashboardWidgetComponent } from "../widget/widget/types.js";

/**
 * @public
 */
export type OptionalProvider<T> = T extends (...args: infer TArgs) => infer TRes
    ? (...args: TArgs) => TRes | undefined
    : never;

/**
 * @public
 */
export type WidgetComponentProvider = (widget: ExtendedDashboardWidget) => CustomDashboardWidgetComponent;

/**
 * @public
 */
export type OptionalWidgetComponentProvider = OptionalProvider<WidgetComponentProvider>;

/**
 * @public
 */
export type InsightComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomDashboardInsightComponent;

/**
 * @public
 */
export type OptionalInsightComponentProvider = OptionalProvider<InsightComponentProvider>;

/**
 * @alpha
 */
export type InsightBodyComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomInsightBodyComponent;

/**
 * @alpha
 */
export type OptionalInsightBodyComponentProvider = OptionalProvider<InsightBodyComponentProvider>;

/**
 * @alpha
 */
export type InsightMenuButtonComponentProvider = (
    insight: IInsight | undefined,
    widget: IInsightWidget,
) => CustomDashboardInsightMenuButtonComponent;

/**
 * @alpha
 */
export type OptionalInsightMenuButtonComponentProvider = OptionalProvider<InsightMenuButtonComponentProvider>;

/**
 * @alpha
 */
export type InsightMenuComponentProvider = (
    insight: IInsight | undefined,
    widget: IInsightWidget,
) => CustomDashboardInsightMenuComponent;

/**
 * @alpha
 */
export type OptionalInsightMenuComponentProvider = OptionalProvider<InsightMenuComponentProvider>;

/**
 * @alpha
 */
export type RichTextMenuComponentProvider = (widget: IRichTextWidget) => CustomDashboardRichTextMenuComponent;

/**
 * @alpha
 */
export type OptionalRichTextMenuComponentProvider = OptionalProvider<RichTextMenuComponentProvider>;

/**
 * @internal
 */
export type InsightMenuTitleComponentProvider = (
    insight: IInsight | undefined,
    widget: IInsightWidget,
) => CustomDashboardInsightMenuTitleComponent;

/**
 * @internal
 */
export type OptionalInsightMenuTitleComponentProvider = OptionalProvider<InsightMenuTitleComponentProvider>;

/**
 * @beta
 */
export type InsightMenuItemsProvider = (
    insight: IInsight,
    widget: IInsightWidget,
    defaultItems: IInsightMenuItem[],
    closeMenu: () => void,
    renderMode: RenderMode,
) => IInsightMenuItem[];

/**
 * @alpha
 */
export type RichTextMenuItemsProvider = (
    widget: IRichTextWidget,
    defaultItems: IRichTextMenuItem[],
    closeMenu: () => void,
    renderMode: RenderMode,
) => IRichTextMenuItem[];

/**
 * @public
 */
export type RichTextComponentProvider = (widget: IRichTextWidget) => CustomDashboardRichTextComponent;

/**
 * @public
 */
export type OptionalRichTextComponentProvider = OptionalProvider<RichTextComponentProvider>;

/**
 * @alpha
 */
export type ShowAsTableButtonComponentProvider = (widget: IInsightWidget) => CustomShowAsTableButtonComponent;

/**
 * @alpha
 */
export type OptionalShowAsTableButtonComponentProvider = OptionalProvider<ShowAsTableButtonComponentProvider>;

/**
 * @internal
 */
export type RichTextMenuTitleComponentProvider = (
    widget: IRichTextWidget,
) => CustomDashboardRichTextMenuTitleComponent;

/**
 * @internal
 */
export type OptionalRichTextMenuTitleComponentProvider = OptionalProvider<RichTextMenuTitleComponentProvider>;

/**
 * @public
 */
export type VisualizationSwitcherComponentProvider = (
    visualizationSwitcher: IVisualizationSwitcherWidget,
) => CustomDashboardVisualizationSwitcherComponent;

/**
 * @alpha
 */
export type DashboardLayoutComponentProvider = (
    widget: IDashboardLayout,
) => CustomDashboardNestedLayoutComponent;

/**
 * @alpha
 */
export type VisualizationSwitcherToolbarComponentProvider = (
    widget: IVisualizationSwitcherWidget,
) => CustomVisualizationSwitcherToolbarComponent;

/**
 * @alpha
 */
export type OptionalVisualizationSwitcherToolbarComponentProvider =
    OptionalProvider<VisualizationSwitcherToolbarComponentProvider>;

/**
 * @alpha
 */
export type OptionalVisualizationSwitcherComponentProvider =
    OptionalProvider<VisualizationSwitcherComponentProvider>;

/**
 * @alpha
 */
export type OptionalDashboardLayoutComponentProvider = OptionalProvider<DashboardLayoutComponentProvider>;

/**
 * @public
 */
export type DateFilterComponentProvider = (
    filter: IDashboardDateFilter,
) => CustomDashboardDateFilterComponent;

/**
 * @public
 */
export type OptionalDateFilterComponentProvider = OptionalProvider<DateFilterComponentProvider>;

/**
 * @public
 */
export type AttributeFilterComponentProvider = (
    filter: IDashboardAttributeFilter,
) => CustomDashboardAttributeFilterComponent;

/**
 * @public
 */
export type OptionalAttributeFilterComponentProvider = OptionalProvider<AttributeFilterComponentProvider>;

/**
 * @public
 */
export type FilterGroupComponentProvider = (
    filterGroup: IDashboardFilterGroup,
) => CustomDashboardFilterGroupComponent;

/**
 * @public
 */
export type OptionalFilterGroupComponentProvider = OptionalProvider<FilterGroupComponentProvider>;

/**
 * @public
 */
export type TopBarComponentProvider = (props: ITopBarProps) => CustomTopBarComponent;

/**
 * @public
 */
export type OptionalTopBarComponentProvider = OptionalProvider<TopBarComponentProvider>;

/**
 * @public
 */
export type FilterBarComponentProvider = (props: IFilterBarProps) => CustomFilterBarComponent;

/**
 * @public
 */
export type OptionalTitleComponentProvider = OptionalProvider<TitleComponentProvider>;

/**
 * @public
 */
export type TitleComponentProvider = (props: ITitleProps) => CustomTitleComponent;

/**
 * @public
 */
export type OptionalFilterBarComponentProvider = OptionalProvider<FilterBarComponentProvider>;

/**
 * @public
 */
export type OptionalLayoutComponentProvider = OptionalProvider<LayoutComponentProvider>;

/**
 * @public
 */
export type LayoutComponentProvider = (props: IDashboardLayoutProps) => CustomDashboardLayoutComponent;

/**
 * @public
 */
export type OptionalLoadingComponentProvider = OptionalProvider<LoadingComponentProvider>;

/**
 * @public
 */
export type LoadingComponentProvider = (props: ILoadingProps) => ComponentType<ILoadingProps>;

/**
 * @alpha
 */
export type DashboardContentComponentProvider = (
    dashboard?: string | ObjRef | IDashboard,
) => CustomDashboardContentComponent;

/**
 * @alpha
 */
export type OptionalDashboardContentComponentProvider = OptionalProvider<DashboardContentComponentProvider>;

/**
 * @internal
 */
export interface IDashboardContentBaseProps {
    /**
     * Analytical backend from which the dashboard obtains data to render.
     *
     * @remarks
     * If you do not specify instance of analytical backend using this prop, then you MUST have
     * BackendProvider up in the component tree.
     */
    backend?: IAnalyticalBackend;

    /**
     * Identifier of analytical workspace, from which the dashboard obtains data to render.
     *
     * @remarks
     * If you do not specify workspace identifier, then you MUST have WorkspaceProvider up in the
     * component tree.
     */
    workspace?: string;

    /**
     * Specify dashboard to render; you can specify the dashboard either by reference (ObjRef) or
     * by value (of type IDashboard).
     *
     * @remarks
     * As a convenience, you may also specify a dashboard object
     * identifier - this is same as using `idRef(objectIdentifier)`.
     *
     * If you do not specify dashboard to render, a new default empty dashboard will be rendered.
     */
    dashboard?: string | ObjRef | IDashboard;

    /**
     * Specify reference to a filter context that should be used instead of the default,
     * built-in filter context.
     *
     * @remarks
     * Note: this property only makes sense if you also specify `dashboard` by reference. If you specify
     * dashboard by value, then the component assumes that the value also contains the desired filter context
     * and will use it as is.
     */
    filterContextRef?: ObjRef;

    /**
     * Configuration that can be used to modify dashboard features, capabilities and behavior.
     *
     * @remarks
     * If not specified, then the dashboard will retrieve and use the essential configuration from the backend.
     */
    config?: DashboardConfig;

    /**
     * Specify permissions to use when determining availability of the different features of
     * the dashboard component.
     *
     * @remarks
     * If you do not specify permissions, the dashboard component will load permissions for the currently
     * logged-in user.
     */
    permissions?: IWorkspacePermissions;
}
/**
 * @alpha
 */
export type CustomDashboardContentComponent = ComponentType<IDashboardContentBaseProps>;
