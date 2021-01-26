// (C) 2020-2021 GoodData Corporation
import { CSSProperties } from "react";
import {
    IAnalyticalBackend,
    ITheme,
    IDashboard,
    IWidgetAlert,
    ISeparators,
    IScheduledMailDefinition,
    IScheduledMail,
    IDashboardLayoutContent,
    IFilterContext,
    ITempFilterContext,
    IWidget,
    ResponsiveScreenType,
    IFluidLayoutColumnMethods,
} from "@gooddata/sdk-backend-spi";
import {
    ObjRef,
    IAbsoluteDateFilter,
    IRelativeDateFilter,
    IPositiveAttributeFilter,
    INegativeAttributeFilter,
    IInsight,
    IFilter,
} from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IHeaderPredicate,
    OnFiredDrillEvent,
    IErrorProps,
    ILoadingProps,
    OnError,
    ILocale,
} from "@gooddata/sdk-ui";
import { IDashboardViewLayoutContentRenderProps, DashboardViewLayoutWidgetClass } from "../DashboardLayout";

/**
 * Supported dashboard filter type.
 * @alpha
 */
export type IDashboardFilter =
    | IAbsoluteDateFilter
    | IRelativeDateFilter
    | IPositiveAttributeFilter
    | INegativeAttributeFilter;

/**
 * @beta
 */
export interface IDashboardViewConfig {
    /**
     * Token for Mapbox API. You need this to use GeoCharts in your dashboards.
     *
     * @remarks To create a Mapbox account and an access token, see [this guide](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/).
     */
    mapboxToken: string;

    /**
     * Regional number formatting to use for measures on the dashboard.
     */
    separators?: ISeparators;

    /**
     * If true, drillable items in KPI's will not be underlined.
     *
     * @default false
     */
    disableKpiDrillUnderline?: boolean;

    /**
     * Locale to use for localization of texts appearing in the dashboard.
     *
     * Note: text values coming from the data itself are not localized.
     */
    locale?: ILocale;
}

/**
 * @beta
 */
export interface IDashboardViewProps {
    /**
     * Reference to the dashboard to display.
     */
    dashboard: ObjRef;

    /**
     * Optionally, specify filters to be applied to all the widgets in the dashboard
     * on top of any filters the dashboard already has saved within.
     *
     * Note: These filters are also applied to created scheduled e-mails.
     * (the attached dashboard will use the filters that are set at the time we schedule it)
     * To suppress this behavior, set applyFiltersToScheduledMail property to false.
     * (and then the attached dashboard will use the original filters stored on the dashboard)
     */
    filters?: IDashboardFilter[];

    /**
     * Configure drillability; e.g. which parts of the visualization can be interacted with.
     * These are applied to all the widgets in the dashboard. If specified, these override any drills specified in the dashboards.
     *
     * TODO: do we need more sophisticated logic to specify drillability?
     */
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;

    /**
     * Called when user triggers a drill on a visualization.
     */
    onDrill?: OnFiredDrillEvent;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace where the dashboard exists.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Theme to use.
     *
     * Note: the theme can come either from this property or from ThemeContext or from the dashboard.
     * If you do not specify theme here, it will be taken from an existing ThemeContext or if there is no ThemeContext,
     * it will be loaded for the dashboard.
     */
    theme?: ITheme;

    /**
     * When true, disables the loading of the workspace theme and creation of a ThemeProvider (if there is none
     * already present in the parent scope). Currently – for technical reasons – the ThemeProvider changes the theme
     * globally (i.e. the theme is NOT constrained inside of a ThemeProvider).
     *
     * Turn this property to true if you need to avoid the global aspect of the themes, or you do not want to use themes at all.
     * @default false
     */
    disableThemeLoading?: boolean;

    /**
     * If provided it is called with loaded theme to allow its modification according to the app needs.
     * This is only applied to themes loaded from the backend, it is NOT applied to themes provided using
     * the "theme" prop.
     */
    themeModifier?: (theme: ITheme) => ITheme;

    /**
     * Component to render if embedding fails.
     * This component is also used in all the individual widgets when they have some error occur.
     *
     * TODO do we need separate component for the dashboard as a whole and individual widgets?
     */
    ErrorComponent?: React.ComponentType<IErrorProps>;

    /**
     * Component to render while the dashboard or a widget is loading.
     * This component is also used in all the individual widgets while they are loading.
     *
     * TODO do we need separate component for the dashboard as a whole and individual widgets?
     */
    LoadingComponent?: React.ComponentType<ILoadingProps>;

    /**
     * Called when the dashboard is loaded. This is to allow the imbedding code to read the dashboard data
     * (for example to adapt its filter UI according to the filters saved in the dashboard).
     */
    onDashboardLoaded?: (params: { dashboard: IDashboard; alerts: IWidgetAlert[] }) => void;

    /**
     * Called in case of any error, either in the dashboard loading or any of the widgets execution.
     */
    onError?: OnError;

    /**
     * When embedding a dashboard that contains insights, you can specify extra options to merge with existing
     * options saved for the insights.
     */
    config?: IDashboardViewConfig;

    /**
     * Indicates, whether the dialog for scheduling emails with the exported dashboard as an attachment is visible.
     */
    isScheduledMailDialogVisible?: boolean;

    /**
     * Indicates whether the scheduled e-mail should contain the current filter configuration.
     * True - the exported dashboard in the scheduled email will be filtered in the same way as when the scheduled email was created.
     * False - the dashboard will be filtered according to the filters stored on the dashboard.
     *
     * Default value: true
     */
    applyFiltersToScheduledMail?: boolean;

    /**
     * Callback to be called, when user submit the scheduled email dialog.
     */
    onScheduledMailDialogSubmit?: (scheduledEmailDefinition: IScheduledMailDefinition) => void;

    /**
     * Callback to be called, when user close the scheduled email dialog.
     */
    onScheduledMailDialogCancel?: () => void;

    /**
     * Callback to be called, when submitting of the scheduled email was successful.
     */
    onScheduledMailSubmitSuccess?: (scheduledEmail: IScheduledMail) => void;

    /**
     * Callback to be called, when submitting of the scheduled email failed.
     */
    onScheduledMailSubmitError?: OnError;

    /**
     * Component to customize widget rendering
     */
    widgetRenderer?: IDashboardWidgetRenderer;
}

/**
 * TODO: RAIL-2869: docs
 *
 * @alpha
 */
export type IDashboardContentRenderProps = IDashboardViewLayoutContentRenderProps<IDashboardLayoutContent> & {
    alerts: IWidgetAlert[];
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: IFilter[];
    filterContext: IFilterContext | ITempFilterContext;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    onError?: OnError;
    widgetClass?: DashboardViewLayoutWidgetClass;
    insight?: IInsight;
    widgetRenderer: IDashboardWidgetRenderer;
};

/**
 * TODO: RAIL-2869: docs
 *
 * @alpha
 */
export type IDashboardWidgetRenderProps = {
    alerts: IWidgetAlert[];
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: IFilter[];
    filterContext: IFilterContext | ITempFilterContext;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
    onError?: OnError;
    widgetClass?: DashboardViewLayoutWidgetClass;
    insight?: IInsight;
    widget: IWidget;
    DefaultRenderer: IDashboardWidgetRenderer;
    screen: ResponsiveScreenType;
    column: IFluidLayoutColumnMethods<IDashboardLayoutContent>;

    /**
     * Minimum height of the widget calculated according to the visualization type.
     */
    minHeight?: CSSProperties["minHeight"];

    /**
     * Height of the widget calculated according to the column size configuration for the current screen.
     */
    height?: CSSProperties["height"];
};

/**
 * Component used for the widget rendering.
 */
export type IDashboardWidgetRenderer = React.ComponentType<IDashboardWidgetRenderProps>;
