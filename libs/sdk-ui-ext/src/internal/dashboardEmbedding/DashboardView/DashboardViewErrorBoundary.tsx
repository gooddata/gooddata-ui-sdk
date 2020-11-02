// (C) 2020 GoodData Corporation
import React from "react";
import { ErrorComponent as DefaultError } from "@gooddata/sdk-ui";
import { DashboardView } from "./DashboardView";
import { IDashboardViewProps } from "./types";

interface IDashboardViewErrorBoundaryState {
    error: Error | undefined;
}

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
