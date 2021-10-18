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
 * @remarks See {@link IDashboardLoadOptions.loadingMode} to learn about loading modes
 *
 * @param options - load options
 * @alpha
 */
export function useDashboardLoader(options: IDashboardLoadOptions): DashboardLoadStatus {
    const backend = useBackendStrict(options.backend);
    const workspace = useWorkspaceStrict(options.workspace);
    const [loadStatus, setLoadStatus] = useState(InitialStatus);
    const { dashboard, config, permissions, clientWorkspace, loadingMode, extraPlugins } = options;
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
        const loader =
            loadingMode === "staticOnly" ? DashboardLoader.staticOnly() : DashboardLoader.adaptive();

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
                // eslint-disable-next-line no-console
                console.error("Dashboard load failed", error);

                setLoadStatus({
                    status: "error",
                    error,
                    result: undefined,
                });
            },
            onSuccess: (result) => {
                // eslint-disable-next-line no-console
                console.log("Loaded dashboard engine", result.engine);
                // eslint-disable-next-line no-console
                console.log("Dashboard engine initialized with plugins", result.plugins);

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
