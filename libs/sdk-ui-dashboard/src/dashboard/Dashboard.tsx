// (C) 2021 GoodData Corporation
import React, { useCallback, useEffect, useState } from "react";
import { FilterBar, FilterBarComponent, IDefaultFilterBarProps } from "../filterBar";
import { IDefaultTopBarProps, TopBar, TopBarComponent } from "../topBar";
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
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    IWorkspacePermissions,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import {
    ErrorComponent as DefaultError,
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    LoadingComponent as DefaultLoading,
    useBackendStrict,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { DashboardEventHandler } from "../model/events/eventHandler";
import { DashboardConfig } from "../model/types/commonTypes";
import invariant from "ts-invariant";
import { DashboardEventsProvider } from "./DashboardEventsContext";
import { DashboardComponentsProvider, useDashboardComponentsContext } from "./DashboardComponentsContext";
import { InternalIntlWrapper } from "@gooddata/sdk-ui-ext/esm/internal/utils/internalIntlProvider";
import { DashboardInsightProps, DefaultDashboardInsight } from "../insight";
import { DashboardKpiProps, DefaultDashboardKpi } from "../kpi";
import {
    DashboardLayout,
    DashboardLayoutProps,
    DashboardWidgetProps,
    DefaultDashboardLayout,
    DefaultDashboardWidget,
} from "../layout";
import { DefaultScheduledEmailDialog, ScheduledEmailDialogProps } from "../scheduledEmail";
import { IDefaultMenuButtonCallbackProps } from "../topBar/TopBar";

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
         * If not specified the default {@link TopBar} will be used. If you do not want to render the top bar, then
         * use the {@link NoTopBar} component.
         */
        Component?: TopBarComponent;

        /**
         * Optionally specify props to customize the default implementation of Top bar.
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: IDefaultTopBarProps;
    };

    /**
     * Optionally configure how the filter bar looks and behaves
     */
    filterBarConfig?: {
        /**
         * Specify component to use for rendering and handling the dashboard's Filter Bar.
         *
         * If not specified the default {@link FilterBar} will be used. If you do not want to render the filter bar, then
         * use the {@link HiddenFilterBar} component.
         */
        Component?: FilterBarComponent;

        /**
         * Optionally specify props to customize the default implementation of Filter Bar
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: IDefaultFilterBarProps;
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
            Component?: React.ComponentType<DashboardInsightProps>;

            /**
             * Optionally specify props to customize the default implementation of Insight.
             *
             * This has no effect if custom component is used.
             */
            defaultComponentProps?: DashboardInsightProps;
        };

        /**
         * Kpi config
         */
        kpi?: {
            /**
             * Specify component to use for rendering the insight
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
        Component?: React.ComponentType<ScheduledEmailDialogProps>;

        /**
         * Optionally specify props to customize the default implementation of scheduled email dialog.
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: ScheduledEmailDialogProps;
    };

    /**
     *
     */
    children?: JSX.Element | ((dashboard: any) => JSX.Element);
}

const DashboardInner: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const { drillableItems, filterBarConfig, topBarConfig } = props;
    const locale = useDashboardSelector(selectLocale);
    const FilterBarComponent = filterBarConfig?.Component ?? FilterBar;
    const TopBarComponent = topBarConfig?.Component ?? TopBar;
    const { ScheduledEmailDialogComponent } = useDashboardComponentsContext();
    const { filters, onFilterChanged } = useFilterBar();
    const { title, onTitleChanged } = useTopBar();

    const [isScheduleEmailingDialogOpen, setIsScheduleEmailingDialogOpen] = useState(false);

    const defaultOnScheduleEmailing = (isDialogOpen: boolean) => {
        setIsScheduleEmailingDialogOpen(isDialogOpen);
    };

    const menuButtonCallbacks: IDefaultMenuButtonCallbackProps = {
        onScheduleEmailingCallback: defaultOnScheduleEmailing,
    };

    const onCancel = (): void => {
        setIsScheduleEmailingDialogOpen(false);
    };

    return (
        <InternalIntlWrapper locale={locale}>
            {isScheduleEmailingDialogOpen && (
                <ScheduledEmailDialogComponent isVisible={isScheduleEmailingDialogOpen} onCancel={onCancel} />
            )}
            <TopBarComponent
                titleConfig={{ title, onTitleChanged }}
                menuButtonConfig={{ defaultComponentCallbackProps: menuButtonCallbacks }}
            />
            <FilterBarComponent filters={filters} onFilterChanged={onFilterChanged} />
            <DashboardLayout drillableItems={drillableItems} />
        </InternalIntlWrapper>
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
        },
        initialEventHandlers: props.eventHandlers,
    });

    return (
        <Provider store={dashboardStore.store} context={ReactDashboardContext}>
            <DashboardEventsProvider
                registerHandler={dashboardStore.registerEventHandler}
                unregisterHandler={dashboardStore.unregisterEventHandler}
            >
                <DashboardComponentsProvider
                    ErrorComponent={props.ErrorComponent ?? DefaultError}
                    LoadingComponent={props.LoadingComponent ?? DefaultLoading}
                    LayoutComponent={props.dashboardLayoutConfig?.Component ?? DefaultDashboardLayout}
                    InsightComponent={props.widgetConfig?.insight?.Component ?? DefaultDashboardInsight}
                    KpiComponent={props.widgetConfig?.kpi?.Component ?? DefaultDashboardKpi}
                    WidgetComponent={props.widgetConfig?.Component ?? DefaultDashboardWidget}
                    ScheduledEmailDialogComponent={
                        props.scheduledEmailDialogConfig?.Component ?? DefaultScheduledEmailDialog
                    }
                >
                    <DashboardLoading {...props} />
                </DashboardComponentsProvider>
            </DashboardEventsProvider>
        </Provider>
    );
};
