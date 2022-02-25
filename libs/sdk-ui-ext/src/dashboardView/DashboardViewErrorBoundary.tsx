// (C) 2020-2022 GoodData Corporation
import React from "react";
import { ErrorComponent as DefaultError } from "@gooddata/sdk-ui";
import { DashboardView } from "./DashboardView";
import { IDashboardViewProps } from "./types";

/**
 * @beta
 * @deprecated Will be removed in the 8.10.0 release. Superseded by Dashboard component; please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
 */
export interface IDashboardViewErrorBoundaryState {
    error: Error | undefined;
}

/**
 * Component allowing you to embed a KPI dashboard into your application.
 *
 * @beta
 * @deprecated Will be removed in the 8.10.0 release. please see `@gooddata/sdk-ui-dashboard` and GoodData.UI documentation for v8.7
 */
export class DashboardViewErrorBoundary extends React.Component<
    IDashboardViewProps,
    IDashboardViewErrorBoundaryState
> {
    state: IDashboardViewErrorBoundaryState = {
        error: undefined,
    };

    static getDerivedStateFromError(error: Error): IDashboardViewErrorBoundaryState {
        return {
            error,
        };
    }

    render(): React.ReactNode {
        if (this.state.error) {
            const ErrorFallback = this.props.ErrorComponent ?? DefaultError;
            return <ErrorFallback message={this.state.error.message} />;
        }

        return <DashboardView {...this.props} />;
    }
}
