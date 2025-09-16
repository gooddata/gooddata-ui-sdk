// (C) 2024-2025 GoodData Corporation

import { Component, ReactNode } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { ErrorComponent } from "@gooddata/sdk-ui";

import { extractError } from "../../../store/sideEffects/utils.js";

type ErrorBoundaryProps = WrappedComponentProps & {
    children: ReactNode;
};

type ErrorBoundaryState = {
    error?: string;
};

class VisualizationErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { error: "" };
    }

    static getDerivedStateFromError(error: unknown) {
        return { error: extractError(error) };
    }

    override render() {
        if (this.state.error) {
            return (
                <ErrorComponent message={this.props.intl.formatMessage({ id: "gd.gen-ai.global-error" })} />
            );
        }

        return this.props.children;
    }
}

export const VisualizationErrorBoundary = injectIntl(VisualizationErrorBoundaryComponent);
