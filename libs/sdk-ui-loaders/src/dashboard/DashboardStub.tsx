// (C) 2021 GoodData Corporation
import React, { useMemo } from "react";
import { IDashboardBaseProps } from "@gooddata/sdk-ui-dashboard";
import {
    ErrorComponent,
    IClientWorkspaceIdentifiers,
    LoadingComponent,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { IDashboardLoader, IEmbeddedPlugin } from "./loader";
import { DashboardLoader } from "./dashboardLoader";
import isArray from "lodash/isArray";
import compact from "lodash/compact";

/**
 * @alpha
 */
export interface IDashboardStubProps extends IDashboardBaseProps {
    clientWorkspace?: IClientWorkspaceIdentifiers;
    mode?: "prod" | "dev";
    extraPlugins?: IEmbeddedPlugin | IEmbeddedPlugin[];
}

/**
 * @alpha
 */
export const DashboardStub: React.FC<IDashboardStubProps> = (props) => {
    const backend = useBackendStrict(props.backend);
    const workspace = useWorkspaceStrict(props.workspace);
    const { dashboardRef, config, permissions, clientWorkspace, mode, extraPlugins } = props;
    const baseProps: IDashboardBaseProps = {
        backend,
        workspace,
        dashboardRef,
        config,
        permissions,
    };

    const dashboardLoader = useMemo(() => {
        const extraPluginsArr = isArray(extraPlugins) ? extraPlugins : compact([extraPlugins]);
        const loader = mode === "dev" ? DashboardLoader.dev() : DashboardLoader.prod();

        initializeLoader(loader, baseProps, extraPluginsArr, clientWorkspace);

        return loader;
    }, [backend, workspace, dashboardRef, clientWorkspace, extraPlugins]);

    const { result, status, error } = useCancelablePromise(
        {
            promise: dashboardLoader.load,
        },
        [dashboardLoader],
    );

    if (status === "loading") {
        return <LoadingComponent />;
    }

    if (status === "error" || result === undefined) {
        // eslint-disable-next-line no-console
        console.error("An error has occurred while loading dashboard stub", error);

        return <ErrorComponent />;
    }

    if (mode === "dev") {
        // eslint-disable-next-line no-console
        console.log("Loaded dashboard engine", result.engine);
        // eslint-disable-next-line no-console
        console.log("Dashboard engine initialized with plugins", result.plugins);
    }

    return <result.DashboardComponent {...result.props} />;
};

//
//
//

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
