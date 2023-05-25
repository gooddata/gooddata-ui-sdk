// (C) 2021-2022 GoodData Corporation
import React, { ComponentType } from "react";
import { ReactReduxContextValue } from "react-redux";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ObjRef, IDashboard, ITheme, IWorkspacePermissions } from "@gooddata/sdk-model";
import { IErrorProps, ILoadingProps } from "@gooddata/sdk-ui";

import {
    DashboardConfig,
    DashboardDispatch,
    DashboardEventHandler,
    DashboardModelCustomizationFns,
    DashboardState,
    WidgetsOverlayFn,
} from "../../model/index.js";
import { CustomFilterBarComponent } from "../filterBar/index.js";
import { CustomDashboardLayoutComponent, CustomEmptyLayoutDropZoneBodyComponent } from "../layout/index.js";
import {
    CustomScheduledEmailDialogComponent,
    CustomScheduledEmailManagementDialogComponent,
} from "../scheduledEmail/index.js";
import {
    CustomButtonBarComponent,
    CustomMenuButtonComponent,
    CustomSaveButtonComponent,
    CustomTitleComponent,
    CustomTopBarComponent,
    IMenuButtonConfiguration,
} from "../topBar/index.js";
import { CustomSaveAsDialogComponent } from "../saveAs/index.js";
import { CustomShareDialogComponent } from "../shareDialog/index.js";
import {
    InsightMenuItemsProvider,
    OptionalAttributeFilterComponentProvider,
    OptionalInsightComponentProvider,
    OptionalInsightMenuButtonComponentProvider,
    OptionalInsightMenuComponentProvider,
    OptionalInsightBodyComponentProvider,
    OptionalKpiComponentProvider,
    OptionalWidgetComponentProvider,
    OptionalDateFilterComponentProvider,
    OptionalInsightMenuTitleComponentProvider,
} from "../dashboardContexts/index.js";
import { CustomSidebarComponent } from "./DashboardSidebar/types.js";
import { InsightComponentSetProvider } from "../componentDefinition/types.js";
import { CustomToolbarComponent } from "../toolbar/index.js";

/**
 * These props allow you to specify custom components or custom component providers that the Dashboard
 * component will use for rendering different parts of the dashboard.
 *
 * @remarks
 * IMPORTANT: while this interface is marked as public, you also need to heed the maturity annotations
 * on each property. A lot of these properties are at this moment alpha or internal level.
 *
 * @public
 */
export interface IDashboardCustomComponentProps {
    /**
     * Component to render if embedding fails.
     *
     * @remarks
     * This component is also used in all the individual widgets when they have some error occur.
     *
     * @privateRemarks
     * TODO do we need separate component for the dashboard as a whole and individual widgets?
     *
     * @alpha
     */
    ErrorComponent?: ComponentType<IErrorProps>;

    /**
     * Component to render while the dashboard or a widget is loading.
     *
     * @remarks
     * This component is also used in all the individual widgets while they are loading.
     *
     * @privateRemarks
     * TODO do we need separate component for the dashboard as a whole and individual widgets?
     *
     * @alpha
     */
    LoadingComponent?: ComponentType<ILoadingProps>;

    /**
     * Specify component to use for rendering the layout.
     *
     * @alpha
     */
    LayoutComponent?: CustomDashboardLayoutComponent;

    /**
     * Specify function to obtain custom component to use for rendering a widget.
     *
     * @remarks
     * -  If not provided, the default implementation {@link DefaultDashboardWidget} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardWidget}.
     *    This is useful if you want to customize just one particular widget and keep default rendering for the
     *    other widgets.
     *
     * @example
     *
     * ```tsx
     * // Simple component that alters the title of every widget
     * const CustomWidget = (props) => {
     *     const widget: IInsightWidget = {
     *         ...props.widget,
     *         title: `Prepend to ${props.widget.title}`,
     *     };
     *
     *     return <DefaultDashboardWidget {...props} widget={widget} />;
     * };
     * ```
     *
     * @public
     */
    WidgetComponentProvider?: OptionalWidgetComponentProvider;

    /**
     * Specify function to obtain custom component to use for rendering an insight.
     *
     * @remarks
     * -  If not provided, the default implementation {@link DefaultDashboardInsight} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardInsight} will be used.
     *    This is useful if you want to customize just one particular insight and keep default rendering for
     *    the other insights.
     *
     * @public
     */
    InsightComponentProvider?: OptionalInsightComponentProvider;

    /**
     * Specify function to obtain custom component to use for rendering an insight body (i.e. the insight itself) in the {@link DefaultDashboardInsight}.
     *
     * @remarks
     * -  If not provided, the default implementation {@link DefaultInsightBody} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultInsightBody} will be used.
     *    This is useful if you want to customize just one particular insight and keep default rendering for
     *    the other insights.
     *
     * @alpha
     */
    InsightBodyComponentProvider?: OptionalInsightBodyComponentProvider;

    /**
     * Specify function to obtain custom component to use for rendering an insight menu button.
     *
     * @remarks
     * -  If not provided, the default implementation {@link DefaultDashboardInsightMenuButton} will be used
     *    if insightMenuItemsProvider property is specified, otherwise {@link LegacyDashboardInsightMenuButton} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardInsightMenuButton} will be used.
     *    This is useful if you want to customize just one particular insight and keep default rendering for
     *    the other insights.
     *
     * @alpha
     */
    InsightMenuButtonComponentProvider?: OptionalInsightMenuButtonComponentProvider;

    /**
     * Specify function to obtain custom component to use for rendering an insight menu.
     *
     * @remarks
     * -  If not provided, the default implementation {@link DefaultDashboardInsightMenu} will be used
     *    if insightMenuItemsProvider property is specified, otherwise {@link LegacyDashboardInsightMenu} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardInsightMenu} will be used.
     *    This is useful if you want to customize just one particular insight and keep default rendering for
     *    the other insights.
     *
     * @alpha
     */
    InsightMenuComponentProvider?: OptionalInsightMenuComponentProvider;

    /**
     * Specify function to obtain custom component to use for rendering the title of the insight menu.
     *
     * @remarks
     * -  If not provided, the default implementation {@link DefaultDashboardInsightMenuTitle} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardInsightMenuTitle} will be used.
     *    This is useful if you want to customize just one particular insight and keep default rendering for
     *    the other insights.
     *
     * @internal
     */
    InsightMenuTitleComponentProvider?: OptionalInsightMenuTitleComponentProvider;

    /**
     * Specify function to obtain insight component set.
     *
     * @remarks
     * If not provided, the default implementation {@link DefaultDashboardInsightComponentSetFactory} will be used.
     *
     * @internal
     */
    InsightComponentSetProvider?: InsightComponentSetProvider;

    /**
     * Specify function to obtain custom component to use for rendering a KPI.
     *
     * @remarks
     * -  If not provided, the default implementation {@link DefaultDashboardKpi} will be used.
     * -  If factory function is provided and it returns undefined, then the default implementation {@link DefaultDashboardKpi}.
     *    This is useful if you want to customize just one particular KPI and keep default rendering for
     *    the other insights.
     *
     * @public
     */
    KpiComponentProvider?: OptionalKpiComponentProvider;

    /**
     * Specify component to use for rendering the scheduled email dialog.
     *
     * @alpha
     */
    ScheduledEmailDialogComponent?: CustomScheduledEmailDialogComponent;

    /**
     * Specify component to use for rendering the scheduled email management dialog.
     *
     * @alpha
     */
    ScheduledEmailManagementDialogComponent?: CustomScheduledEmailManagementDialogComponent;

    /**
     * Specify component to use for rendering the share dialog.
     *
     * @alpha
     */
    ShareDialogComponent?: CustomShareDialogComponent;

    /**
     * Specify component to use for rendering the save as dialog.
     *
     * @alpha
     */
    SaveAsDialogComponent?: CustomSaveAsDialogComponent;

    /**
     * Specify component to use for rendering the button bar.
     *
     * @alpha
     */
    ButtonBarComponent?: CustomButtonBarComponent;

    /**
     * Specify component to use for rendering the menu button.
     *
     * @alpha
     */
    MenuButtonComponent?: CustomMenuButtonComponent;

    /**
     * Specify component to use for rendering the top bar.
     *
     * @remarks
     * Note that if you override this component, the ButtonBarComponent, MenuButtonComponent and TitleComponent
     * props might get ignored depending on your implementation.
     *
     * @alpha
     */
    TopBarComponent?: CustomTopBarComponent;

    /**
     * Specify component to use for rendering the toolbar.
     *
     * @internal
     */
    ToolbarComponent?: CustomToolbarComponent;

    /**
     * Specify component to use for rendering the title.
     *
     * @remarks
     * Defaults to {@link DefaultTitle}. For an editable title, you can use {@link EditableTitle} instead.
     * To hide the dashboard title altogether, you can use {@link HiddenTitle}.
     *
     * @alpha
     */
    TitleComponent?: CustomTitleComponent;

    /**
     * Specify custom component to use for rendering all attribute filters or a factory function to customize the component
     * per different attribute filter.
     *
     * @remarks
     * If you want to hide some or all filters, you can use the {@link HiddenDashboardAttributeFilter} implementation.
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
     * @alpha
     */
    DashboardAttributeFilterComponentProvider?: OptionalAttributeFilterComponentProvider;

    /**
     * Specify component to use for rendering the date filters.
     *
     * @alpha
     */
    DashboardDateFilterComponentProvider?: OptionalDateFilterComponentProvider;

    /**
     * Specify component to use for rendering the filter bar.
     *
     * @remarks
     *
     * Note that if you override this component, the DashboardAttributeFilterComponentFactory and DashboardDateFilterComponent
     * props might get ignored depending on your implementation.
     *
     * @alpha
     */
    FilterBarComponent?: CustomFilterBarComponent;

    /**
     * Specify component to use for rendering the sidebar.
     *
     * @alpha
     */
    SidebarComponent?: CustomSidebarComponent;

    /**
     * Specify the component rendered as the body of the drop zone when the layout is empty.
     *
     * @internal
     *
     * @privateRemarks
     * We would ideally replace the whole EmptyLayoutComponent, however integrating with the drop zone is currently too complicated.
     *
     */
    EmptyLayoutDropZoneBodyComponent?: CustomEmptyLayoutDropZoneBodyComponent;

    /**
     * Specify the component rendered as save button.
     *
     * @remarks
     * If not provided, the default implementation {@link DefaultSaveButton} will be used.
     *
     * @internal
     */
    SaveButtonComponent?: CustomSaveButtonComponent;
}

/**
 * Properties for {@link Dashboard} customization.
 *
 * @remarks
 * IMPORTANT: while this interface is marked as public, you also need to heed the maturity annotations
 * on each property. A lot of these properties are at this moment alpha level.
 *
 * @public
 */
export interface IDashboardCustomizationProps extends IDashboardCustomComponentProps {
    /**
     * Provide custom configuration for the Menu button.
     *
     * @alpha
     */
    menuButtonConfig?: IMenuButtonConfiguration;

    /**
     * Provide custom provider to change items rendered in insight menus.
     *
     * @remarks
     * If the function returns an empty array, the menu will not be rendered at all.
     *
     * @alpha
     */
    insightMenuItemsProvider?: InsightMenuItemsProvider;

    /**
     * Specify customization functions.
     *
     * @remarks
     * The dashboard component will call out to these functions
     * at different points during its lifetime. See documentation of the different functions to learn more.
     *
     * @public
     */
    customizationFns?: DashboardModelCustomizationFns;
}

/**
 * Properties for {@link Dashboard} widgets overlay.
 *
 * @remarks
 * IMPORTANT: while this interface is marked as public, you also need to heed the maturity annotations
 * on each property. A lot of these properties are at this moment alpha level.
 *
 * @public
 */
export interface IDashboardWidgetsOverlayProps {
    /**
     * Provide settings for widgets overlay
     *
     * @alpha
     */
    widgetsOverlayFn?: WidgetsOverlayFn;
}

/**
 * @public
 */
export interface IDashboardThemingProps {
    /**
     * Theme to use.
     *
     * @remarks
     * Note: the theme can come either from this property or from ThemeContext or from the dashboard.
     * If you do not specify theme here, it will be taken from an existing ThemeContext or if there is no ThemeContext,
     * it will be loaded for the dashboard.
     */
    theme?: ITheme;

    /**
     * When true, disables the loading of the workspace theme and creation of a ThemeProvider (if there is none
     * already present in the parent scope).
     *
     * @remarks
     * Currently – for technical reasons – the ThemeProvider changes the theme
     * globally (i.e. the theme is NOT constrained inside of a ThemeProvider).
     *
     * Turn this property to true if you need to avoid the global aspect of the themes, or you do not want to use themes at all.
     *
     * Defaults to false.
     */
    disableThemeLoading?: boolean;

    /**
     * If provided it is called with loaded theme to allow its modification according to the app needs.
     *
     * @remarks
     * This is only applied to themes loaded from the backend, it is NOT applied to themes provided using
     * the "theme" prop.
     */
    themeModifier?: (theme: ITheme) => ITheme;
}

/**
 * {@link Dashboard} eventing configuration
 *
 * @remarks
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
 * @public
 */
export interface IDashboardEventing {
    /**
     * Specify event handlers to register at the dashboard creation time.
     *
     * @remarks
     * Note: all events that will be emitted during the initial load processing will have the `initialLoad`
     * correlationId.
     */
    eventHandlers?: DashboardEventHandler[];

    /**
     * Specify callback that will be called when the dashboard eventing subsystem initializes and
     * it is possible to register new or unregister existing event handlers.
     *
     * @remarks
     * Note: these callbacks allow modification of event handlers on an existing, initialized dashboard. See
     * {@link IDashboardEventing.eventHandlers} prop if you want to register handlers _before_ the dashboard
     * initialization starts.
     */
    onEventingInitialized?: (
        registerEventHandler: (handler: DashboardEventHandler) => void,
        unregisterEventHandler: (handler: DashboardEventHandler) => void,
    ) => void;

    /**
     * Specify callback that will be called each time the state changes.
     *
     * @remarks
     * Note: there is no need to use this in your own React components that you plug into the dashboard. Your
     * React component code can use {@link @gooddata/sdk-ui-dashboard#useDashboardSelector} and
     * {@link @gooddata/sdk-ui-dashboard#useDashboardDispatch} hooks instead.
     */
    onStateChange?: (state: DashboardState, dispatch: DashboardDispatch) => void;
}

/**
 * @public
 */
export interface IDashboardBaseProps {
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
 * Cumulative properties for {@link Dashboard} customization.
 *
 * @remarks
 * IMPORTANT: while this interface is marked as public, you also need to heed the maturity annotations
 * on each property. A lot of these properties are at this moment alpha level.
 *
 * @public
 */
export interface IDashboardExtensionProps
    extends IDashboardEventing,
        IDashboardCustomizationProps,
        IDashboardWidgetsOverlayProps,
        IDashboardThemingProps {
    /**
     * Pass instance of ReactReduxContext where the dashboard component's store should be saved.
     *
     * @remarks
     *
     * This is essential if you are dynamically loading dashboard engine and then enriching the
     * dashboard with embedded, local plugins. If such plugins are compiled against sdk-ui-dashboard and
     * use Redux hooks (useDashboardSelect, useDashboardDispatch) then your solution will not work
     * unless you explicitly send your application's `ReactDashboardContext` into this prop.
     *
     * Note: there is no need to use this prop unless you are dynamically loading the engine bundle.
     */
    additionalReduxContext?: React.Context<ReactReduxContextValue>;
}

/**
 * @public
 */
export interface IDashboardProps extends IDashboardBaseProps, IDashboardExtensionProps {
    children?: JSX.Element | ((dashboard: any) => JSX.Element);
    /**
     * Override the persisted dashboard. This is mainly useful for internal use cases.
     * @internal
     */
    persistedDashboard?: IDashboard;
}
