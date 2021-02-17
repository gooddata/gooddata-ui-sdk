// (C) 2020-2021 GoodData Corporation
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
    FilterContextItem,
    ILegacyKpi,
} from "@gooddata/sdk-backend-spi";
import { ObjRef, IInsight } from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IHeaderPredicate,
    OnFiredDrillEvent,
    IErrorProps,
    ILoadingProps,
    OnError,
    ILocale,
    VisType,
} from "@gooddata/sdk-ui";
import { IDashboardViewLayoutContentRenderProps, DashboardViewLayoutWidgetClass } from "../DashboardLayout";
import { IDashboardFilter } from "../types";
import { IDashboardViewLayoutBuilder } from "../DashboardLayout/builder/interfaces";

/**
 * @alpha
 */
export interface IDashboardViewLayoutTransformAdditionalProps {
    /**
     * Sanitized filters provided to the dashboard.
     */
    filters?: FilterContextItem[];

    /**
     * Get insight - returns insight only in case it's part of the layout, undefined otherwise.
     */
    getInsight: (insightRef: ObjRef) => IInsight | undefined;

    /**
     * Get widget alert - returns alert only in case it's a {@link IKpiWidget} and has alert set, undefined otherwise.
     */
    getWidgetAlert: (widgetRef: ObjRef) => IWidgetAlert;
}

/**
 * @alpha
 */
export type DashboardViewLayoutTransform<TContent = any> = (
    layoutBuilder: IDashboardViewLayoutBuilder<TContent>,
    additionalProps: IDashboardViewLayoutTransformAdditionalProps,
) => IDashboardViewLayoutBuilder<TContent>;

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
     * Optionally, specify filters to be applied to all the widgets in the dashboard.
     * If you specify this and want to merge your filters with the filters from the dashboard,
     * you need to use the data from the {@link onDashboardLoaded} callback.
     * To make the merging of the filters easier, you can use the {@link mergeFiltersWithDashboard} function.
     *
     * Note: These filters are also applied to created scheduled e-mails.
     * (the attached dashboard will use the filters that are set at the time we schedule it)
     * To suppress this behavior, set applyFiltersToScheduledMail property to false.
     * (and then the attached dashboard will use the original filters stored on the dashboard)
     */
    filters?: Array<IDashboardFilter | FilterContextItem>;

    /**
     * Optionally, specify a callback that will be triggered when the filters should be changed.
     * (e.g. to apply filters of a KPI alert to the whole dashboard)
     */
    onFiltersChange?: (filters: IDashboardFilter[]) => void;

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
     * Called when the dashboard is loaded. This is to allow the embedding code to read the dashboard data
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
     * Custom layout transforms for more advanced customizations.
     */
    transformLayout?: DashboardViewLayoutTransform<any>;

    /**
     * Component to customize widget rendering.
     * Note: Custom widget rendering is not supported for dashboard exports & scheduled e-mails.
     */
    widgetRenderer?: IDashboardWidgetRenderer;

    /**
     * If set to true, the dashboard will be embedded in a read-only mode disabling any user interaction
     * that would alter any backend state (disabling creating/changing alerts for example).
     *
     * @default false i.e. NOT a read-only mode.
     */
    isReadOnly?: boolean;
}

/**
 * TODO: RAIL-2869: docs
 *
 * @alpha
 */
export type IDashboardContentRenderProps = IDashboardViewLayoutContentRenderProps<IDashboardLayoutContent> & {
    backend?: IAnalyticalBackend;
    workspace?: string;
    dashboardRef: ObjRef;
    filters?: IDashboardFilter[];
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
 * Render props for custom widget rendering.
 *
 * @alpha
 */
export type IDashboardWidgetRenderProps = {
    /**
     * ErrorComponent provided to DashboardView, or default component used for error rendering.
     */
    ErrorComponent: React.ComponentType<IErrorProps>;

    /**
     * LoadingComponent provided to DashboardView, or default component used for loading rendering.
     */
    LoadingComponent: React.ComponentType<ILoadingProps>;

    /**
     * Dashboard widget (insight or kpi) rendered in a common way.
     * Use this as a fallback for custom widget rendering.
     * Note: Please don't modify this element in any way, implementation can be changed in the future.
     */
    renderedWidget: React.ReactElement;

    /**
     * Common predicates against which the widget can be tested.
     * Please use these predicates instead of areObjRefsEqual().
     */
    predicates: IWidgetPredicates;

    /**
     * Alert if set for this widget (in case it's a kpi widget).
     */
    alert?: IWidgetAlert;

    /**
     * Widget data.
     */
    widget: IWidget;

    /**
     * Insight set for this widget (in case it's an insight widget).
     */
    insight?: IInsight;

    /**
     * Custom widget provided from the user (in case it's a custom widget).
     */
    customWidget?: any;

    /**
     * Sanitized filters provided to the dashboard.
     */
    filters?: FilterContextItem[];
};

/**
 * Component used for the widget rendering.
 */
export type IDashboardWidgetRenderer = (renderProps: IDashboardWidgetRenderProps) => JSX.Element;

/**
 * Interface for testing the widget against common predicates
 *
 * @alpha
 */
export interface IWidgetPredicates {
    /**
     * Predicate to test whether the widget that is not part of the common layout model.
     */
    isCustomWidget: () => boolean;

    /**
     * Predicate to test whether the widget matches the provided ObjRef.
     * This is useful to customize rendering for the particular widget.
     */
    isWidgetWithRef: (ref: ObjRef) => boolean;

    /**
     * Predicate to test whether the widget contains insight that matches the provided ObjRef.
     * This is useful to customize rendering for the widget with particular insight.
     */
    isWidgetWithInsightRef: (ref: ObjRef) => boolean;

    /**
     * Predicate to test whether the widget contains insight of particular type (e.g. table, bar, column, scatter, etc).
     * This is useful to customize rendering for the insight widget of concrete type.
     */
    isWidgetWithInsightType: (type: VisType) => boolean;

    /**
     * Predicate to test whether the widget contains kpi that matches the provided ObjRef.
     * This is useful to customize rendering for the widget with particular kpi.
     */
    isWidgetWithKpiRef: (ref: ObjRef) => boolean;

    /**
     * Predicate to test whether the widget contains kpi of particular comparison type (none, previousPeriod or previousYear).
     * This is useful to customize rendering for the kpi widget of concrete type.
     */
    isWidgetWithKpiType: (comparisonType: ILegacyKpi["comparisonType"]) => boolean;
}
