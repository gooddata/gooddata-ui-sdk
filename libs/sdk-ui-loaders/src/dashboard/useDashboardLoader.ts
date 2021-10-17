// (C) 2021 GoodData Corporation
import { useEffect, useMemo, useState } from "react";
import { IDashboardBasePropsForLoader, IDashboardLoadOptions } from "./types";
import {
    IClientWorkspaceIdentifiers,
    useBackendStrict,
    useCancelablePromise,
    UseCancelablePromiseState,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { IDashboardBaseProps } from "@gooddata/sdk-ui-dashboard";
import isArray from "lodash/isArray";
import compact from "lodash/compact";
import { DashboardLoader } from "./dashboardLoader";
import { DashboardLoadResult, IDashboardLoader, IEmbeddedPlugin } from "./loader";

/**
 * @alpha
 */
export type DashboardLoadStatus = UseCancelablePromiseState<DashboardLoadResult, any>;

const InitialStatus: DashboardLoadStatus = {
    result: undefined,
    error: undefined,
    status: "loading",
};

/**
 * This hook encapsulates load, bootstrap and teardown of a dashboard enhanced by plugins. It is a one-stop
 * hook to use for React embedding of a Dashboard and when building new dashboard plugins.
 *
 * -  The hook can be used in 'dev' mode when developing new dashboard plugins; in this mode, the hook
 *    expects that it is running inside plugin development toolkit that depends on `@gooddata/sdk-ui-dashboards`
 *    and includes code for plugin that is under development.
 *
 *    In this mode, the hook will combine the dashboard engine with the plugin under development and return
 *    load result that contains everything needed to mount the dashboard into your application.
 *
 * -  The hook can be used in 'prod' mode in order to include a dashboard enhanced with plugins into your
 *    application.
 *
 *    In this mode, the code will dynamically load bundles with the dashboard engine and again
 *    return load result that contains everything needed to mount the dashboard into your application.
 *
 * @param options - load options
 * @alpha
 */
export function useDashboardLoader(options: IDashboardLoadOptions): DashboardLoadStatus {
    const backend = useBackendStrict(options.backend);
    const workspace = useWorkspaceStrict(options.workspace);
    const [loadStatus, setLoadStatus] = useState(InitialStatus);
    const { dashboard, config, permissions, clientWorkspace, mode, extraPlugins } = options;
    const baseProps: IDashboardBasePropsForLoader = {
        backend,
        workspace,
        dashboard,
        config,
        permissions,
    };

    useEffect(() => {
        return () => {
            if (!loadStatus || loadStatus.status !== "success") {
                return;
            }

            const { ctx, plugins } = loadStatus.result;

            plugins.forEach((plugin) => {
                plugin.onPluginUnload?.(ctx);
            });
        };
    }, []);

    const dashboardLoader = useMemo(() => {
        const extraPluginsArr = isArray(extraPlugins) ? extraPlugins : compact([extraPlugins]);
        const loader = mode === "dev" ? DashboardLoader.dev() : DashboardLoader.prod();

        initializeLoader(loader, baseProps, extraPluginsArr, clientWorkspace);

        return loader;
    }, [backend, workspace, dashboard, clientWorkspace, extraPlugins]);

    useCancelablePromise(
        {
            promise: dashboardLoader.load,
            onLoading: () => {
                setLoadStatus(InitialStatus);
            },
            onError: (error) => {
                if (mode === "dev") {
                    // eslint-disable-next-line no-console
                    console.error("Dashboard load failed", error);
                }

                setLoadStatus({
                    status: "error",
                    error,
                    result: undefined,
                });
            },
            onSuccess: (result) => {
                if (mode === "dev") {
                    // eslint-disable-next-line no-console
                    console.log("Loaded dashboard engine", result.engine);
                    // eslint-disable-next-line no-console
                    console.log("Dashboard engine initialized with plugins", result.plugins);
                }

                setLoadStatus({
                    status: "success",
                    result,
                    error: undefined,
                });
            },
        },
        [dashboardLoader],
    );

    return loadStatus;
}

function initializeLoader(
    loader: IDashboardLoader,
    baseProps: IDashboardBaseProps,
    extraPlugins: IEmbeddedPlugin[],
    clientWorkspace?: IClientWorkspaceIdentifiers,
): IDashboardLoader {
    loader.withBaseProps(baseProps).withEmbeddedPlugins(...extraPlugins);

    if (clientWorkspace) {
        loader.fromClientWorkspace(clientWorkspace);
    }

    return loader;
}
