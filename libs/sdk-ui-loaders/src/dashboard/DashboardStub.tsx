// (C) 2021-2022 GoodData Corporation
import React from "react";
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
    ErrorComponent?: React.ComponentType<IErrorProps>;

    /**
     * Component to render while the insight is loading.
     */
    LoadingComponent?: React.ComponentType<ILoadingProps>;
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
export const DashboardStub: React.FC<IDashboardStubProps> = (props) => {
    const { ErrorComponent = DefaultErrorComponent, LoadingComponent = DefaultLoadingComponent } = props;
    const { status, error, result } = useDashboardLoader(props);

    if (status === "loading") {
        return <LoadingComponent />;
    }

    if (status === "error" || result === undefined) {
        return <ErrorComponent message={error?.message ?? ""} />;
    }

    return <result.DashboardComponent {...result.props} />;
};
