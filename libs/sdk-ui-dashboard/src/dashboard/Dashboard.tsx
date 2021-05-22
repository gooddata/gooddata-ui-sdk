// (C) 2021 GoodData Corporation
import React, { useEffect } from "react";
import { FilterBarComponent, IDefaultFilterBarProps } from "../filterBar";
import { IDefaultTopBarProps, TopBarComponent } from "../topBar";
import { Provider } from "react-redux";
import { createDashboardStore, useDashboardDispatch, useDashboardSelector } from "./state/dashboardStore";
import { loadingSelector } from "./state";
import { loadDashboard } from "../commands/dashboard";
import { rootCommandHandler } from "./commandHandlers/rootCommandHandler";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

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
    dashboardRef?: ObjRef;

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
        Component?: any;

        /**
         * Optionally specify props to customize the default implementation of Dashboard View.
         *
         * This has no effect if custom component is used.
         */
        defaultComponentProps?: any;
    };

    /**
     *
     */
    children?: JSX.Element | ((dashboard: any) => JSX.Element);
}

const DashboardInner: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    return (
        <React.Fragment>
            {typeof props.children === "function" ? props.children?.(null) : props.children}
        </React.Fragment>
    );
};

const DashboardLoading: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const dispatch = useDashboardDispatch();
    const { loading, error, result } = useDashboardSelector(loadingSelector);

    useEffect(() => {
        if (!loading && result === undefined) {
            dispatch(loadDashboard());
        }
    }, [loading, result]);

    if (!loading && result === undefined) {
        return <div>Initializing...</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return <DashboardInner {...props} />;
};

/**
 * @internal
 */
export const Dashboard: React.FC<IDashboardProps> = (props: IDashboardProps) => {
    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspaceStrict(props.workspace);
    const store = createDashboardStore({
        sagaContext: {
            backend,
            workspace,
            dashboardRef: props.dashboardRef,
        },
        rootCommandHandler,
    });

    return (
        <Provider store={store}>
            <DashboardLoading {...props} />
        </Provider>
    );
};
