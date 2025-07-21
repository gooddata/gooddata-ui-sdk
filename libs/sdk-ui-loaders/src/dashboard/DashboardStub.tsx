// (C) 2021-2025 GoodData Corporation
import { ComponentType } from "react";
import {
    ErrorComponent as DefaultErrorComponent,
    IErrorProps,
    ILoadingProps,
    LoadingComponent as DefaultLoadingComponent,
} from "@gooddata/sdk-ui";
import { useDashboardLoader } from "./useDashboardLoader.js";
import { IDashboardLoadOptions } from "./types.js";

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
