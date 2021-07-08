// (C) 2021 GoodData Corporation
import React, { useCallback, useEffect, useState } from "react";
import {
    CustomFilterBarComponent,
    DefaultFilterBar,
    IDefaultFilterBarProps,
    IFilterBarCoreProps,
} from "../filterBar";
import {
    CustomTopBarComponent,
    IDefaultTopBarProps,
    DefaultTopBar,
    IDefaultMenuButtonComponentCallbacks,
    ITopBarCoreProps,
} from "../topBar";
import { Provider } from "react-redux";
import {
    createDashboardStore,
    ReactDashboardContext,
    useDashboardDispatch,
    useDashboardSelector,
} from "../model/state/dashboardStore";
import {
    InitialLoadCorrelationId,
    renameDashboard,
    selectDashboardLoading,
    selectDashboardTitle,
    selectFilterContextFilters,
    selectLocale,
} from "../model";
import { loadDashboard } from "../model/commands/dashboard";
import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
} from "../model/commands/filters";
import {
    FilterContextItem,
    IAnalyticalBackend,
    IScheduledMail,
    IScheduledMailDefinition,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    ITheme,
    IWorkspacePermissions,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import {
    ErrorComponent as DefaultError,
    GoodDataSdkError,
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    LoadingComponent as DefaultLoading,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";
import { defaultDashboardThemeModifier } from "./defaultDashboardThemeModifier";
import { DashboardEventHandler } from "../model/events/eventHandler";
import { DashboardConfig } from "../model/types/commonTypes";
import invariant from "ts-invariant";
import {
    DashboardComponentsProvider,
    DashboardEventsProvider,
    useDashboardComponentsContext,
} from "../dashboardContexts";
import {
    CustomDashboardInsightComponent,
    DefaultDashboardInsightWithDrillDialog,
    IDashboardInsightCoreProps,
    IDefaultDashboardInsightProps,
} from "../insight";
import { DashboardKpiProps, DefaultDashboardKpi } from "../kpi";
import {
    DashboardLayout,
    DashboardLayoutProps,
    DashboardWidgetProps,
    DefaultDashboardLayout,
    DefaultDashboardWidget,
} from "../layout";
import {
    CustomScheduledEmailDialogComponent,
    DefaultScheduledEmailDialog,
    IDefaultScheduledEmailDialogCallbackProps,
} from "../scheduledEmail";
import { ToastMessageContextProvider, ToastMessages, useToastMessage } from "@gooddata/sdk-ui-kit";
import { IntlWrapper } from "../localization/IntlWrapper";
import { useDashboardPdfExporter } from "./useDashboardPdfExporter";

const useFilterBar = (): {
    filters: FilterContextItem[];
    onFilterChanged: (filter: FilterContextItem | undefined) => void;
} => {
    const filters = useDashboardSelector(selectFilterContextFilters);
    const dispatch = useDashboardDispatch();
    const onFilterChanged = useCallback(
        (filter: FilterContextItem | undefined) => {
            if (!filter) {
                // all time filter
                dispatch(clearDateFilterSelection());
            } else if (isDashboardDateFilter(filter)) {
                const { type, granularity, from, to } = filter.dateFilter;
                dispatch(changeDateFilterSelection(type, granularity, from, to));
            } else if (isDashboardAttributeFilter(filter)) {
                const { attributeElements, negativeSelection, localIdentifier } = filter.attributeFilter;
                dispatch(
                    changeAttributeFilterSelection(
                        localIdentifier!,
                        attributeElements,
                        negativeSelection ? "NOT_IN" : "IN",
                    ),
                );
            } else {
                invariant(false, "Unknown filter type");
            }
        },
        [dispatch],
    );

    return { filters, onFilterChanged };
};

const useTopBar = () => {
    const dispatch = useDashboardDispatch();
    const title = useDashboardSelector(selectDashboardTitle);

    const onTitleChanged = useCallback(
        (title: string) => {
            dispatch(renameDashboard(title));
        },
        [dispatch],
    );

    return {
        title,
        onTitleChanged,
    };
};

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
     * Data product identifier.
     * This property is required, if the current backend implementation allows usage of data product identifier
     * and data product identifier is set (workspace is provisioned via LCM).
     *
     * It's used to resolve drill to custom url data product identifier parameter.
     * For more details, see: {@link https://help.gooddata.com/pages/viewpage.action?pageId=86794855}
     */
    dataProductId?: string;

    /**
     * Client identifier.
     * This property is required, if current backend implementation allows usage of client identifier
     * and client identifier is set (workspace is provisioned via LCM).
     *
     * It's used to resolve drill to custom url client identifier parameter.
     * For more details, see: {@link https://help.gooddata.com/pages/viewpage.action?pageId=86794855}
     */
    clientId?: string;

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
    ErrorComponent?: React.ComponentType<IErrorProps>;

    /**
     * Component to render while the dashboard or a widget is loading.
     * This component is also used in all the individual widgets while they are loading.
     *
     * TODO do we need separate component for the dashboard as a whole and individual widgets?
     */
    LoadingComponent?: React.ComponentType<ILoadingProps>;

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
        Component?: React.ComponentType<DashboardLayoutProps>;

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
        Component?: React.ComponentType<DashboardWidgetProps>;

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
            Component?: React.ComponentType<DashboardKpiProps>;

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

const DashboardInnerCore: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const {
        drillableItems,
        filterBarConfig,
        topBarConfig,
        scheduledEmailDialogConfig,
        dashboardRef,
        backend,
        workspace,
    } = props;

    const FilterBarComponent = filterBarConfig?.Component ?? DefaultFilterBar;
    const TopBarComponent = topBarConfig?.Component ?? DefaultTopBar;
    const ScheduledEmailDialogComponent =
        scheduledEmailDialogConfig?.Component ?? DefaultScheduledEmailDialog;
    const isDefaultScheduledEmailDialogUsed = !scheduledEmailDialogConfig?.Component;
    const { filters, onFilterChanged } = useFilterBar();
    const { title, onTitleChanged } = useTopBar();
    const { addSuccess, addError } = useToastMessage();

    const [isScheduleEmailingDialogOpen, setIsScheduleEmailingDialogOpen] = useState(false);
    const { exportDashboard } = useDashboardPdfExporter({
        backend,
        workspace,
        onError: () => {
            addError({ id: "options.menu.export.PDF.error" });
        },
    });

    const defaultOnScheduleEmailing = () => {
        setIsScheduleEmailingDialogOpen(true);
    };

    const defaultOnExportToPdf = () => {
        exportDashboard(dashboardRef, filters);
    };

    const menuButtonCallbacks: IDefaultMenuButtonComponentCallbacks = {
        onScheduleEmailingCallback: defaultOnScheduleEmailing,
        onExportToPdfCallback: defaultOnExportToPdf,
    };

    function onScheduleEmailingError(error: GoodDataSdkError) {
        if (isDefaultScheduledEmailDialogUsed) {
            scheduledEmailDialogConfig?.defaultComponentCallbackProps?.onError?.(error);
        }

        setIsScheduleEmailingDialogOpen(false);
        addError({ id: "dialogs.schedule.email.submit.error" });
    }

    function onScheduleEmailingSuccess(scheduledMail: IScheduledMail) {
        if (isDefaultScheduledEmailDialogUsed) {
            scheduledEmailDialogConfig?.defaultComponentCallbackProps?.onSuccess?.(scheduledMail);
        }

        setIsScheduleEmailingDialogOpen(false);
        addSuccess({ id: "dialogs.schedule.email.submit.success" });
    }

    function onScheduleEmailingCancel() {
        if (isDefaultScheduledEmailDialogUsed) {
            scheduledEmailDialogConfig?.defaultComponentCallbackProps?.onCancel?.();
        }

        setIsScheduleEmailingDialogOpen(false);
    }

    function onScheduleEmailingSubmit(scheduledMail: IScheduledMailDefinition) {
        if (isDefaultScheduledEmailDialogUsed) {
            scheduledEmailDialogConfig?.defaultComponentCallbackProps?.onSubmit?.(scheduledMail);
        }
    }

    return (
        <>
            <ToastMessages />
            {isScheduleEmailingDialogOpen && (
                <ScheduledEmailDialogComponent
                    isVisible={isScheduleEmailingDialogOpen}
                    onCancel={onScheduleEmailingCancel}
                    onError={onScheduleEmailingError}
                    onSuccess={onScheduleEmailingSuccess}
                    onSubmit={onScheduleEmailingSubmit}
                />
            )}
            <TopBarComponent
                {...topBarConfig?.defaultComponentProps}
                titleProps={{ title, onTitleChanged }}
                menuButtonConfig={{
                    defaultComponentCallbackProps: menuButtonCallbacks,
                    ...topBarConfig?.defaultComponentProps?.menuButtonConfig,
                }}
            />
            <FilterBarComponent
                {...filterBarConfig?.defaultComponentProps}
                filters={filters}
                onFilterChanged={onFilterChanged}
            />
            <DashboardLayout drillableItems={drillableItems} />
        </>
    );
};

const DashboardInner: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const locale = useDashboardSelector(selectLocale);

    return (
        <IntlWrapper locale={locale}>
            <div className="gd-dashboards-root">
                <DashboardInnerCore {...props} />
            </div>
        </IntlWrapper>
    );
};

const DashboardLoading: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const dispatch = useDashboardDispatch();
    const { loading, error, result } = useDashboardSelector(selectDashboardLoading);
    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();

    useEffect(() => {
        if (!loading && result === undefined) {
            dispatch(loadDashboard(props.config, props.permissions, InitialLoadCorrelationId));
        }
    }, [loading, result]);

    if (error) {
        return <ErrorComponent message={error.message} />;
    }

    if (loading || !result) {
        return <LoadingComponent />;
    }

    return <DashboardInner {...props} />;
};

/**
 * @internal
 */
export const Dashboard: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspaceStrict(props.workspace);
    const dashboardStore = createDashboardStore({
        sagaContext: {
            backend,
            workspace,
            dashboardRef: props.dashboardRef,
            clientId: props.clientId,
            dataProductId: props.dataProductId,
        },
        initialEventHandlers: props.eventHandlers,
    });

    return (
        <Provider store={dashboardStore.store} context={ReactDashboardContext}>
            <ToastMessageContextProvider>
                <ThemeProvider
                    theme={props.theme}
                    modifier={props.themeModifier ?? defaultDashboardThemeModifier}
                >
                    <DashboardEventsProvider
                        registerHandler={dashboardStore.registerEventHandler}
                        unregisterHandler={dashboardStore.unregisterEventHandler}
                    >
                        <DashboardComponentsProvider
                            ErrorComponent={props.ErrorComponent ?? DefaultError}
                            LoadingComponent={props.LoadingComponent ?? DefaultLoading}
                            LayoutComponent={props.dashboardLayoutConfig?.Component ?? DefaultDashboardLayout}
                            InsightComponent={
                                props.widgetConfig?.insight?.Component ??
                                DefaultDashboardInsightWithDrillDialog
                            }
                            KpiComponent={props.widgetConfig?.kpi?.Component ?? DefaultDashboardKpi}
                            WidgetComponent={props.widgetConfig?.Component ?? DefaultDashboardWidget}
                        >
                            <DashboardLoading {...props} />
                        </DashboardComponentsProvider>
                    </DashboardEventsProvider>
                </ThemeProvider>
            </ToastMessageContextProvider>
        </Provider>
    );
};
