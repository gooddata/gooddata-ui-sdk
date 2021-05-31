// (C) 2021 GoodData Corporation
import React, { useEffect } from "react";
import { FilterBar, FilterBarComponent, IDefaultFilterBarProps } from "../filterBar";
import { IDefaultTopBarProps, TopBarComponent } from "../topBar";
import { Provider } from "react-redux";
import {
    createDashboardStore,
    ReactDashboardContext,
    useDashboardDispatch,
    useDashboardSelector,
} from "../model/state/dashboardStore";
import { InitialLoadCorrelationId, selectDashboardLoading, selectFilterContextFilters } from "../model";
import { loadDashboard } from "../model/commands/dashboard";
import {
    changeAttributeFilterSelection,
    changeDateFilterSelection,
    clearDateFilterSelection,
} from "../model/commands/filters";
import {
    IAnalyticalBackend,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    IWorkspacePermissions,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import {
    ErrorComponent as DefaultError,
    IErrorProps,
    LoadingComponent as DefaultLoading,
    ILoadingProps,
    useBackendStrict,
    useWorkspaceStrict,
    IDrillableItem,
    IHeaderPredicate,
} from "@gooddata/sdk-ui";
import { DashboardEventHandler } from "../model/events/eventHandler";
import { DashboardConfig } from "../model/types/commonTypes";
import { Layout, LayoutProps } from "../layout/Layout";
import invariant from "ts-invariant";

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
     *
     * TODO: flesh out interfaces & types; this is where existing stuff from DashboardView / DashboardLayout will
     *  start connecting up.
     */
    dashboardLayoutConfig?: {
        /**
         * Specify component to use for rendering the layout.
         *
         * If you want to implement an ad-hoc dashboard layout yourself, you can provide children render function.
         */
        Component?: React.ComponentType<LayoutProps>;

        /**
         * Optionally specify props to customize the default implementation of Dashboard View.
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: LayoutProps;
    };

    /**
     *
     */
    children?: JSX.Element | ((dashboard: any) => JSX.Element);
}

const DashboardInner: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const {
        dashboardRef,
        dashboardLayoutConfig,
        drillableItems,
        filterBarConfig,
        ErrorComponent,
        LoadingComponent,
    } = props;
    const customLayout = typeof props.children === "function" ? props.children?.(null) : props.children;
    const LayoutComponent = dashboardLayoutConfig?.Component ?? Layout;
    const FilterBarComponent = filterBarConfig?.Component ?? FilterBar;

    const filters = useDashboardSelector(selectFilterContextFilters);
    const dispatch = useDashboardDispatch();

    return (
        <React.Fragment>
            <FilterBarComponent
                filters={filters}
                onFilterChanged={(filter) => {
                    if (!filter) {
                        // all time filter
                        dispatch(clearDateFilterSelection());
                    } else if (isDashboardDateFilter(filter)) {
                        const { type, granularity, from, to } = filter.dateFilter;
                        dispatch(changeDateFilterSelection(type, granularity, from, to));
                    } else if (isDashboardAttributeFilter(filter)) {
                        const { attributeElements, negativeSelection, localIdentifier } =
                            filter.attributeFilter;
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
                }}
            />
            {customLayout ?? (
                <LayoutComponent
                    dashboardRef={dashboardRef}
                    drillableItems={drillableItems}
                    transformLayout={dashboardLayoutConfig?.defaultComponentProps?.transformLayout}
                    widgetRenderer={dashboardLayoutConfig?.defaultComponentProps?.widgetRenderer}
                    ErrorComponent={ErrorComponent}
                    LoadingComponent={LoadingComponent}
                />
            )}
        </React.Fragment>
    );
};

const DashboardLoading: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const dispatch = useDashboardDispatch();
    const { ErrorComponent = DefaultError, LoadingComponent = DefaultLoading } = props;
    const { loading, error, result } = useDashboardSelector(selectDashboardLoading);

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
            <DashboardLoading {...props} />
        </Provider>
    );
};
