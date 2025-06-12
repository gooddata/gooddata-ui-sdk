// (C) 2024 GoodData Corporation
import React from "react";
import { extractError } from "../../../store/sideEffects/utils.js";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { injectIntl, WrappedComponentProps } from "react-intl";

type ErrorBoundaryProps = WrappedComponentProps & {
    children: React.ReactNode;
};

type ErrorBoundaryState = {
    error?: string;
};

class VisualizationErrorBoundaryComponent extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { error: "" };
    }

    static getDerivedStateFromError(error: unknown) {
        return { error: extractError(error) };
    }

    render() {
        if (this.state.error) {
            return (
                <ErrorComponent message={this.props.intl.formatMessage({ id: "gd.gen-ai.global-error" })} />
            );
        }

        return this.props.children;
    }
}

export const VisualizationErrorBoundary = injectIntl(VisualizationErrorBoundaryComponent);
