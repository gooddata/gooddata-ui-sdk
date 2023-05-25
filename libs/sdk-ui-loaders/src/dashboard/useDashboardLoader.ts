// (C) 2021-2023 GoodData Corporation
import { useEffect, useMemo, useState } from "react";
import stringify from "json-stable-stringify";
import { IDashboardBasePropsForLoader, IDashboardLoadOptions, IEmbeddedPlugin } from "./types.js";
import {
    IClientWorkspaceIdentifiers,
    useBackendStrict,
    useCancelablePromise,
    UseCancelablePromiseState,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { DashboardConfig, IDashboardBaseProps } from "@gooddata/sdk-ui-dashboard";
import { idRef, isDashboard, objRefToString } from "@gooddata/sdk-model";
import isArray from "lodash/isArray.js";
import compact from "lodash/compact.js";
import { DashboardLoader } from "./dashboardLoader.js";
import { DashboardLoadResult, IDashboardLoader } from "./loader.js";
import { invariant } from "ts-invariant";

/**
 * Returned by the `useDashboardLoader` to communicate the status of dashboard loading.
 *
 * @public
 */
export type DashboardLoadStatus = UseCancelablePromiseState<DashboardLoadResult, any>;

const InitialStatus: DashboardLoadStatus = {
    result: undefined,
    error: undefined,
    status: "loading",
};

const getDashboardConfig = (
    config: DashboardConfig = {},
    allowUnfinishedFeatures: IDashboardLoadOptions["allowUnfinishedFeatures"],
): DashboardConfig => {
    if (allowUnfinishedFeatures === "alwaysAllow" || allowUnfinishedFeatures === "staticOnly") {
        return {
            ...config,
            allowUnfinishedFeatures: true, // will be turned off in case of external plugins later during load
        };
    }
    return {
        ...config,
        allowUnfinishedFeatures: false,
    };
};

/**
 * This hook encapsulates load, bootstrap and teardown of a dashboard enhanced by plugins.
 *
 * @remarks
 * It is a one-stop hook to use for React embedding of a Dashboard and when building new dashboard plugins.
 *
 * See {@link IDashboardLoadOptions.loadingMode} to learn about loading modes
 *
 * @param options - load options
 * @public
 */
export function useDashboardLoader(options: IDashboardLoadOptions): DashboardLoadStatus {
    const backend = useBackendStrict(options.backend);
    const workspace = useWorkspaceStrict(options.workspace);
    const [loadStatus, setLoadStatus] = useState(InitialStatus);
    const {
        dashboard,
        filterContextRef,
        config,
        permissions,
        clientWorkspace,
        loadingMode,
        extraPlugins,
        adaptiveLoadOptions,
        allowUnfinishedFeatures = "alwaysPrevent",
    } = options;
    const dashboardRef =
        typeof dashboard === "string" ? idRef(dashboard) : isDashboard(dashboard) ? dashboard.ref : dashboard;

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
        const dashboardConfig = getDashboardConfig(config, allowUnfinishedFeatures);
        const baseProps: IDashboardBasePropsForLoader = {
            backend,
            workspace,
            dashboard,
            filterContextRef,
            config: dashboardConfig,
            permissions,
        };

        let loader: DashboardLoader;
        const useAdaptiveLoader = loadingMode !== "staticOnly";
        if (useAdaptiveLoader) {
            invariant(
                adaptiveLoadOptions,
                "'adaptiveLoadOptions' must be specified when adaptive loading mode is used.",
            );
            loader = DashboardLoader.adaptive(adaptiveLoadOptions);
        } else {
            loader = DashboardLoader.staticOnly();
        }

        const extraPluginsArr = isArray(extraPlugins) ? extraPlugins : compact([extraPlugins]);
        initializeLoader(loader, baseProps, extraPluginsArr, clientWorkspace);

        // eslint-disable-next-line no-console
        console.log(
            `Dashboard loader initialized in ${loadingMode} mode to load ${
                dashboardRef ? objRefToString(dashboardRef) : "empty dashboard"
            }.`,
        );

        return loader;
    }, [
        backend,
        workspace,
        dashboard && stringify(dashboard),
        filterContextRef,
        config,
        permissions,
        clientWorkspace,
        extraPlugins,
        loadingMode,
    ]);

    useCancelablePromise(
        {
            promise: () => dashboardLoader.load(options),
            onLoading: () => {
                setLoadStatus(InitialStatus);
            },
            onError: (error) => {
                console.error("Dashboard load failed", error);

                setLoadStatus({
                    status: "error",
                    error,
                    result: undefined,
                });
            },
            onSuccess: (result) => {
                // eslint-disable-next-line no-console
                console.log("Loaded dashboard engine", result.engine.version);
                // eslint-disable-next-line no-console
                console.log(
                    `Dashboard engine ${result.engine.version} initialized with plugins`,
                    result.plugins.map((plugin) => `${plugin.displayName}/${plugin.version}`).join(", "),
                );

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
