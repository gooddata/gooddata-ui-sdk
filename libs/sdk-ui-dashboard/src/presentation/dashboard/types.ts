// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";
import {
    IAnalyticalBackend,
    IDashboard,
    IDashboardAttributeFilter,
    IInsightWidget,
    IKpiWidget,
    ILegacyKpi,
    ITheme,
    IWorkspacePermissions,
} from "@gooddata/sdk-backend-spi";
import { IInsight, ObjRef } from "@gooddata/sdk-model";
import { IErrorProps, ILoadingProps } from "@gooddata/sdk-ui";

import {
    DashboardConfig,
    DashboardDispatch,
    DashboardEventHandler,
    DashboardModelCustomizationFns,
    DashboardState,
    ExtendedDashboardWidget,
} from "../../model";
import {
    CustomDashboardAttributeFilterComponent,
    CustomDashboardDateFilterComponent,
    CustomFilterBarComponent,
} from "../filterBar";
import { CustomDashboardLayoutComponent } from "../layout";
import { CustomScheduledEmailDialogComponent } from "../scheduledEmail";
import {
    CustomButtonBarComponent,
    CustomMenuButtonComponent,
    CustomTitleComponent,
    CustomTopBarComponent,
    IMenuButtonConfiguration,
} from "../topBar";
import {
    CustomDashboardInsightComponent,
    CustomDashboardInsightMenuButtonComponent,
    CustomDashboardInsightMenuComponent,
    CustomDashboardKpiComponent,
    CustomDashboardWidgetComponent,
    IInsightMenuItem,
} from "../widget";
import { CustomSaveAsDialogComponent } from "../saveAs";
import { CustomShareDialogComponent } from "../shareDialog";
import { ReactReduxContextValue } from "react-redux";

/**
 * @alpha
 */
export type OptionalProvider<T> = T extends (...args: infer TArgs) => infer TRes
    ? (...args: TArgs) => TRes | undefined
    : never;

/**
 * @alpha
 */
export type WidgetComponentProvider = (widget: ExtendedDashboardWidget) => CustomDashboardWidgetComponent;

/**
 * @alpha
 */
export type OptionalWidgetComponentProvider = OptionalProvider<WidgetComponentProvider>;

/**
 * @alpha
 */
export type InsightComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomDashboardInsightComponent;

/**
 * @alpha
 */
export type OptionalInsightComponentProvider = OptionalProvider<InsightComponentProvider>;

/**
 * @alpha
 */
export type InsightMenuButtonComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomDashboardInsightMenuButtonComponent | undefined;

/**
 * @alpha
 */
export type InsightMenuComponentProvider = (
    insight: IInsight,
    widget: IInsightWidget,
) => CustomDashboardInsightMenuComponent | undefined;

/**
 * @alpha
 */
export type InsightMenuItemsProvider = (
    insight: IInsight,
    widget: IInsightWidget,
    defaultItems: IInsightMenuItem[],
    closeMenu: () => void,
) => IInsightMenuItem[];

/**
 * @alpha
 */
export type KpiComponentProvider = (kpi: ILegacyKpi, widget: IKpiWidget) => CustomDashboardKpiComponent;

/**
 * @alpha
 */
export type OptionalKpiComponentProvider = OptionalProvider<KpiComponentProvider>;

/**
 * @alpha
 */
export type AttributeFilterComponentProvider = (
    filter: IDashboardAttributeFilter,
) => CustomDashboardAttributeFilterComponent | undefined;

/**
 * @alpha
 */
export interface IDashboardCustomComponentProps {
    /**
     * Component to render if embedding fails.
     * This component is also used in all the individual widgets when they have some error occur.
     *
     * TODO do we need separate component for the dashboard as a whole and individual widgets?
     */
    ErrorComponent?: ComponentType<IErrorProps>;

    /**
     * Component to render while the dashboard or a widget is loading.
     * This component is also used in all the individual widgets while they are loading.
     *
     * TODO do we need separate component for the dashboard as a whole and individual widgets?
     */
    LoadingComponent?: ComponentType<ILoadingProps>;

    /**
     * Optionally specify component to use for rendering the layout.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useDashboardLayoutProps} hook.
     * To fall back to the default implementation, use the {@link DefaultDashboardLayout} component.
     */
    LayoutComponent?: CustomDashboardLayoutComponent;

    /**
     * Optionally specify function to obtain custom component to use for rendering a widget.
     *
     * -  If not provided, the default implementation {@link DefaultDashboardWidget} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardWidget}.
     *    This is useful if you want to customize just one particular widget and keep default rendering for the
     *    other widgets.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useDashboardWidgetProps} hook.
     * To fall back to the default implementation, use the {@link DefaultDashboardWidget} component.
     *
     * @example
     *
     * ```tsx
     * // Simple component that alters the title of every widget
     * const CustomWidget = () => {
     *     const props = useDashboardWidgetProps();
     *
     *     const widget: IInsightWidget = {
     *         ...props.widget,
     *         title: `Prepend to ${props.widget.title}`,
     *     };
     *
     *     return <DefaultDashboardWidget {...props} widget={widget} />;
     * };
     * ```
     */
    WidgetComponentProvider?: OptionalWidgetComponentProvider;

    /**
     * Optionally specify function to obtain custom component to use for rendering an insight.
     *
     * -  If not provided, the default implementation {@link DefaultDashboardInsight} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardInsight} will be used.
     *    This is useful if you want to customize just one particular insight and keep default rendering for
     *    the other insights.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useDashboardInsightProps} hook.
     * To fall back to the default implementation, use the {@link DefaultDashboardInsight} component.
     */
    InsightComponentProvider?: OptionalInsightComponentProvider;

    /**
     * Optionally specify function to obtain custom component to use for rendering an insight menu button.
     *
     * -  If not provided, the default implementation {@link DefaultDashboardInsightMenuButton} will be used
     *    if insightMenuItemsProvider property is specified, otherwise {@link LegacyDashboardInsightMenuButton} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardInsightMenuButton} will be used.
     *    This is useful if you want to customize just one particular insight and keep default rendering for
     *    the other insights.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useDashboardInsightMenuButtonProps} hook.
     * To fall back to the default implementation, use the {@link DefaultDashboardInsightMenuButton} component.
     */
    InsightMenuButtonComponentProvider?: InsightMenuButtonComponentProvider;

    /**
     * Optionally specify function to obtain custom component to use for rendering an insight menu.
     *
     * -  If not provided, the default implementation {@link DefaultDashboardInsightMenu} will be used
     *    if insightMenuItemsProvider property is specified, otherwise {@link LegacyDashboardInsightMenu} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardInsightMenu} will be used.
     *    This is useful if you want to customize just one particular insight and keep default rendering for
     *    the other insights.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useDashboardInsightMenuProps} hook.
     * To fall back to the default implementation, use the {@link DefaultDashboardInsightMenu} component.
     */
    InsightMenuComponentProvider?: InsightMenuComponentProvider;

    /**
     * Optionally specify function to obtain custom component to use for rendering a KPI.
     *
     * -  If not provided, the default implementation {@link DefaultDashboardKpi} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardKpi}.
     *    This is useful if you want to customize just one particular KPI and keep default rendering for
     *    the other insights.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useDashboardKpiProps} hook.
     * To fall back to the default implementation, use the {@link DefaultDashboardKpi} component.
     */
    KpiComponentProvider?: OptionalKpiComponentProvider;

    /**
     * Optionally specify component to use for rendering the scheduled email dialog.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useScheduledEmailDialogProps} hook.
     * To fall back to the default implementation, use the {@link DefaultScheduledEmailDialog} component.
     */
    ScheduledEmailDialogComponent?: CustomScheduledEmailDialogComponent;

    /**
     * Optionally specify component to use for rendering the share dialog.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useShareDialogProps} hook.
     * To fall back to the default implementation, use the {@link DefaultShareDialog} component.
     */
    ShareDialogComponent?: CustomShareDialogComponent;

    /**
     * Optionally specify component to use for rendering the save as dialog.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useSaveAsDialogProps} hook.
     * To fall back to the default implementation, use the {@link DefaultSaveAsDialog} component.
     */
    SaveAsDialogComponent?: CustomSaveAsDialogComponent;

    /**
     * Optionally specify component to use for rendering the button bar.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useButtonBarProps} hook.
     * To fall back to the default implementation, use the {@link DefaultButtonBar} component.
     */
    ButtonBarComponent?: CustomButtonBarComponent;

    /**
     * Optionally specify component to use for rendering the menu button.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useMenuButtonProps} hook.
     * To fall back to the default implementation, use the {@link DefaultMenuButton} component.
     */
    MenuButtonComponent?: CustomMenuButtonComponent;

    /**
     * Optionally specify component to use for rendering the top bar.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useTopBarProps} hook.
     * To fall back to the default implementation, use the {@link DefaultTopBar} component.
     *
     * Note that if you override this component, the ButtonBarComponent, MenuButtonComponent and TitleComponent
     * props might get ignored depending on your implementation.
     */
    TopBarComponent?: CustomTopBarComponent;

    /**
     * Optionally specify component to use for rendering the title.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useTitleProps} hook.
     * To fall back to the default implementation, use the {@link DefaultTitle} component.
     */
    TitleComponent?: CustomTitleComponent;

    /**
     * Optionally specify custom component to use for rendering all attribute filters or a factory function to customize the component
     * per different attribute filter.
     *
     * -  If not provided, the default implementation {@link DefaultDashboardAttributeFilter} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardAttributeFilter}.
     *    This is useful if you want to customize just one particular filter and keep all other filters the same.
     *
     * @example
     * Here is how to override the component for all filters:
     * ```
     * ComponentFactory: () => MyCustomComponent
     * ```
     *
     * @remarks
     * If you want to hide some or all filters, you can use the {@link HiddenDashboardAttributeFilter} implementation.
     *
     * To access the necessary props in your custom component, use the {@link useDashboardAttributeFilterProps} hook.
     * To fall back to the default implementation, use the {@link DefaultDashboardAttributeFilter} component.
     */
    DashboardAttributeFilterComponentProvider?: AttributeFilterComponentProvider;

    /**
     * Optionally specify component to use for rendering the date filters.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useDashboardDateFilterProps} hook.
     * To fall back to the default implementation, use the {@link DefaultDashboardDateFilter} component.
     */
    DashboardDateFilterComponent?: CustomDashboardDateFilterComponent;

    /**
     * Optionally specify component to use for rendering the filter bar.
     *
     * @remarks
     * To access the necessary props in your component, use the {@link useFilterBarProps} hook.
     * To fall back to the default implementation, use the {@link DefaultFilterBar} component.
     *
     * Note that if you override this component, the DashboardAttributeFilterComponentFactory and DashboardDateFilterComponent
     * props might get ignored depending on your implementation.
     */
    FilterBarComponent?: CustomFilterBarComponent;
}

/**
 * @alpha
 */
export interface IDashboardCustomizationProps extends IDashboardCustomComponentProps {
    /**
     * Optionally provide custom configuration for the Menu button.
     */
    menuButtonConfig?: IMenuButtonConfiguration;

    /**
     * Optionally provide custom provider to change items rendered in insight menus.
     *
     * @remarks
     * If the function returns an empty array, the menu will not be rendered at all.
     */
    insightMenuItemsProvider?: InsightMenuItemsProvider;

    /**
     * Optionally specify customization functions. The dashboard component will call out to these functions
     * at different points during its lifetime. See documentation of the different functions to learn more.
     */
    customizationFns?: DashboardModelCustomizationFns;
}

/**
 * @alpha
 */
export interface IDashboardThemingProps {
    /**
     * Theme to use.
     *
     * Note: the theme can come either from this property or from ThemeContext or from the dashboard.
     * If you do not specify theme here, it will be taken from an existing ThemeContext or if there is no ThemeContext,
     * it will be loaded for the dashboard.
     */
    theme?: ITheme;

    /**
     * If provided it is called with loaded theme to allow its modification according to the app needs.
     * This is only applied to themes loaded from the backend, it is NOT applied to themes provided using
     * the "theme" prop.
     */
    themeModifier?: (theme: ITheme) => ITheme;
}

/**
 * Dashboard Component eventing is divided into two major groups:
 *
 * 1.  Domain events describing what is happening on the dashboard or with the dashboard
 * 2.  Infrastructural events required hook into different technical aspects of the dashboard component
 *     implementation.
 *
 * Dashboard Component treats the domain events using the typical pub-sub semantics. It is possible to
 * register any number of subscribers for the different types of events. Types of events are enumerated and
 * each event comes with its own type describing the contents. Please see {@link @gooddata/sdk-ui-dashboard#DashboardEventType}
 * and {@link @gooddata/sdk-ui-dashboard#DashboardEvents} to learn more.
 *
 * The infrastructural events are handled using callbacks. There are only few of these infr
 *
 * @alpha
 */
export interface IDashboardEventing {
    /**
     * Optionally specify event handlers to register at the dashboard creation time.
     *
     * Note: all events that will be emitted during the initial load processing will have the `initialLoad`
     * correlationId.
     */
    eventHandlers?: DashboardEventHandler[];

    /**
     * Optionally specify callback that will be called when the dashboard eventing subsystem initializes and
     * it is possible to register new or unregister existing event handlers.
     *
     * Note: these callbacks allow modification of event handlers on an existing, initialized dashboard. See
     * {@link IDashboardEventing.eventHandlers} prop if you want to register handlers _before_ the dashboard
     * initialization starts.
     */
    onEventingInitialized?: (
        registerEventHandler: (handler: DashboardEventHandler) => void,
        unregisterEventHandler: (handler: DashboardEventHandler) => void,
    ) => void;

    /**
     * Optionally specify callback that will be called each time the state changes.
     *
     * Note: there is no need to use this in your own React components that you plug into the dashboard. Your
     * React component code can use {@link @gooddata/sdk-ui-dashboard#useDashboardSelector} and
     * {@link @gooddata/sdk-ui-dashboard#useDashboardDispatch} hooks instead.
     */
    onStateChange?: (state: DashboardState, dispatch: DashboardDispatch) => void;
}

/**
 * @alpha
 */
export interface IDashboardBaseProps {
    /**
     * Analytical backend from which the dashboard obtains data to render.
     *
     * If you do not specify instance of analytical backend using this prop, then you MUST have
     * BackendProvider up in the component tree.
     */
    backend?: IAnalyticalBackend;

    /**
     * Identifier of analytical workspace, from which the dashboard obtains data to render.
     *
     * If you do not specify workspace identifier, then you MUST have WorkspaceProvider up in the
     * component tree.
     */
    workspace?: string;

    /**
     * Specify dashboard to render; you can specify the dashboard either by reference (ObjRef) or
     * by value (of type IDashboard).
     *
     * If you do not specify dashboard to render, a new default empty dashboard will be rendered.
     */
    dashboard?: ObjRef | IDashboard;

    /**
     * Optionally specify reference to a filter context that should be used instead of the default,
     * built-in filter context.
     *
     * Note: this property only makes sense if you also specify `dashboard` by reference. If you specify
     * dashboard by value, then the component assumes that the value also contains the desired filter context
     * and will use it as is.
     */
    filterContextRef?: ObjRef;

    /**
     * Configuration that can be used to modify dashboard features, capabilities and behavior.
     *
     * If not specified, then the dashboard will retrieve and use the essential configuration from the backend.
     */
    config?: DashboardConfig;

    /**
     * Optionally specify permissions to use when determining availability of the different features of
     * the dashboard component.
     *
     * If you do not specify permissions, the dashboard component will load permissions for the currently
     * logged-in user.
     */
    permissions?: IWorkspacePermissions;
}

/**
 * @alpha
 */
export type IDashboardExtensionProps = IDashboardEventing &
    IDashboardCustomizationProps &
    IDashboardThemingProps & {
        /**
         * Pass instance of ReactReduxContext where the dashboard component's store should be saved.
         *
         * This is essential if you are dynamically loading dashboard engine and then enriching the
         * dashboard with embedded, local plugins. If such plugins are compiled against sdk-ui-dashboard and
         * use Redux hooks (useDashboardSelect, useDashboardDispatch) then your solution will not work
         * unless you explicitly send your application's `ReactDashboardContext` into this prop.
         *
         * Note: there is no need to use this prop unless you are dynamically loading the engine bundle.
         */
        additionalReduxContext?: React.Context<ReactReduxContextValue>;
    };

/**
 * @alpha
 */
export interface IDashboardProps extends IDashboardBaseProps, IDashboardExtensionProps {
    children?: JSX.Element | ((dashboard: any) => JSX.Element);
}
