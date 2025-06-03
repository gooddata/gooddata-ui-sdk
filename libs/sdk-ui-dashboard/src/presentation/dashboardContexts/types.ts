// (C) 2021-2025 GoodData Corporation
import { ComponentType } from "react";
import { ILoadingProps } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    CustomDashboardInsightComponent,
    CustomDashboardInsightMenuButtonComponent,
    CustomDashboardInsightMenuComponent,
    CustomDashboardInsightMenuTitleComponent,
    CustomDashboardWidgetComponent,
    CustomInsightBodyComponent,
    IInsightMenuItem,
    CustomDashboardRichTextComponent,
    CustomDashboardVisualizationSwitcherComponent,
    CustomVisualizationSwitcherToolbarComponent,
    CustomDashboardNestedLayoutComponent,
    CustomDashboardRichTextMenuComponent,
    IRichTextMenuItem,
    CustomDashboardRichTextMenuTitleComponent,
    CustomShowAsTableButtonComponent,
} from "../widget/types.js";
import { DashboardConfig, ExtendedDashboardWidget } from "../../model/index.js";
import { CustomTitleComponent, CustomTopBarComponent, ITitleProps, ITopBarProps } from "../topBar/types.js";
import {
    CustomDashboardAttributeFilterComponent,
    CustomDashboardDateFilterComponent,
    CustomFilterBarComponent,
    IFilterBarProps,
} from "../filterBar/types.js";
import { CustomDashboardLayoutComponent, IDashboardLayoutProps } from "../layout/types.js";
import { RenderMode } from "../../types.js";
import {
    IInsight,
    IDashboardAttributeFilter,
    IInsightWidget,
    IDashboardDateFilter,
    ObjRef,
    IDashboard,
    IWorkspacePermissions,
    IRichTextWidget,
    IVisualizationSwitcherWidget,
    IDashboardLayout,
} from "@gooddata/sdk-model";

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
