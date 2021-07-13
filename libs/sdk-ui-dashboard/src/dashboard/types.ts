// (C) 2021 GoodData Corporation
import { ComponentType } from "react";
import { IAnalyticalBackend, ITheme, IWorkspacePermissions } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { IDrillableItem, IErrorProps, IHeaderPredicate, ILoadingProps } from "@gooddata/sdk-ui";

import { CustomFilterBarComponent, IDefaultFilterBarProps, IFilterBarCoreProps } from "../filterBar";
import { DashboardLayoutProps, DashboardWidgetProps } from "../layout";
import { DashboardConfig, DashboardEventHandler } from "../model";
import {
    CustomScheduledEmailDialogComponent,
    IDefaultScheduledEmailDialogCallbackProps,
} from "../scheduledEmail";
import { CustomTopBarComponent, IDefaultTopBarProps, ITopBarCoreProps } from "../topBar";
import {
    CustomDashboardInsightComponent,
    IDashboardInsightCoreProps,
    IDefaultDashboardInsightProps,
    DashboardKpiProps,
} from "../widget";

/**
 * @internal
 */
export interface IDashboardProps {
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
     * Reference of the persisted dashboard to render.
     */
    dashboardRef: ObjRef;

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

    /**
     * Configure drillability; e.g. which parts of the visualization can be interacted with.
     * These are applied to all the widgets in the dashboard. If specified, these override any drills specified in the dashboards.
     *
     * TODO: do we need more sophisticated logic to specify drillability?
     */
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;

    /**
     * Optionally specify event handlers to register at the dashboard creation time.
     *
     * Note: all events that will be emitted during the initial load processing will have the `initialLoad`
     * correlationId.
     *
     * TODO: this needs more attention.
     */
    eventHandlers?: DashboardEventHandler[];

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
     * Optionally configure how the top bar looks and behaves.
     */
    topBarConfig?: {
        /**
         * Optionally specify component to use for rendering and handling the dashboard's Top Bar.
         *
         * If not specified the default {@link DefaultTopBar} will be used. If you do not want to render the top bar, then
         * use the {@link HiddenTopBar} component.
         */
        Component?: CustomTopBarComponent;

        /**
         * Optionally specify props to customize the default implementation of Top bar.
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: Omit<IDefaultTopBarProps, keyof ITopBarCoreProps>;
    };

    /**
     * Optionally configure how the filter bar looks and behaves
     */
    filterBarConfig?: {
        /**
         * Specify component to use for rendering and handling the dashboard's Filter Bar.
         *
         * If not specified the default {@link DefaultFilterBar} will be used. If you do not want to render the filter bar, then
         * use the {@link HiddenFilterBar} component.
         */
        Component?: CustomFilterBarComponent;

        /**
         * Optionally specify props to customize the default implementation of Filter Bar
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: Omit<IDefaultFilterBarProps, keyof IFilterBarCoreProps>;
    };

    /**
     * Optionally configure how the dashboard layout looks and behaves.
     */
    dashboardLayoutConfig?: {
        /**
         * Specify component to use for rendering the layout.
         */
        Component?: ComponentType<DashboardLayoutProps>;

        /**
         * Optionally specify props to customize the default implementation of Dashboard View.
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: DashboardLayoutProps;
    };

    /**
     * Optionally configure how the dashboard widget looks and behaves.
     */
    widgetConfig?: {
        /**
         * Specify component to use for rendering the widget.
         */
        Component?: ComponentType<DashboardWidgetProps>;

        /**
         * Optionally specify props to customize the default implementation of Dashboard View.
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: DashboardWidgetProps;

        /**
         * Insight config
         */
        insight?: {
            /**
             * Specify component to use for rendering the insight
             */
            Component?: CustomDashboardInsightComponent;

            /**
             * Optionally specify props to customize the default implementation of Insight.
             *
             * This has no effect if custom component is used.
             */
            defaultComponentProps?: Omit<IDefaultDashboardInsightProps, keyof IDashboardInsightCoreProps>; // TODO: also how to propagate these?
        };

        /**
         * Kpi config
         */
        kpi?: {
            /**
             * Specify component to use for rendering the KPI
             */
            Component?: ComponentType<DashboardKpiProps>;

            /**
             * Optionally specify props to customize the default implementation of Insight.
             *
             * This has no effect if custom component is used.
             */
            defaultComponentProps?: DashboardKpiProps;
        };
    };

    /**
     * Optionally configure how the scheduled email dialog looks and behaves.
     */
    scheduledEmailDialogConfig?: {
        /**
         * Specify component to use for rendering the scheduled email dialog
         */
        Component?: CustomScheduledEmailDialogComponent;

        /**
         * Optionally specify callbacks props to be called by the default implementation of scheduled email dialog.
         *
         * These will have no effect if custom component is used.
         */
        defaultComponentCallbackProps?: IDefaultScheduledEmailDialogCallbackProps;
    };

    /**
     *
     */
    children?: JSX.Element | ((dashboard: any) => JSX.Element);

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
