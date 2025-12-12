// (C) 2021-2025 GoodData Corporation

import { type ComponentType } from "react";

import {
    ErrorComponent as DefaultErrorComponent,
    LoadingComponent as DefaultLoadingComponent,
    type IErrorProps,
    type ILoadingProps,
} from "@gooddata/sdk-ui";

import { type IDashboardLoadOptions } from "./types.js";
import { useDashboardLoader } from "./useDashboardLoader.js";

/**
 * @public
 */
export interface IDashboardStubProps extends IDashboardLoadOptions {
    /**
     * Component to render if embedding fails.
     */
    ErrorComponent?: ComponentType<IErrorProps>;

    /**
     * Component to render while the insight is loading.
     */
    LoadingComponent?: ComponentType<ILoadingProps>;
}

/**
 * DashboardStub encapsulates load, bootstrap and teardown of a dashboard enhanced by plugins.
 *
 * @remarks
 * This component is a thin wrapper on top of the {@link useDashboardLoader} hook which does the heavy lifting - you can
 * use the hook in your own component if this simple stub does not suffice.
 *
 * @public
 */
export function DashboardStub(props: IDashboardStubProps) {
    const { ErrorComponent = DefaultErrorComponent, LoadingComponent = DefaultLoadingComponent } = props;
    const { status, error, result } = useDashboardLoader(props);

    if (status === "loading") {
        return <LoadingComponent />;
    }

    if (status === "error" || result === undefined) {
        return <ErrorComponent message={error?.message ?? ""} />;
    }

    return <result.DashboardComponent {...result.props} />;
}
