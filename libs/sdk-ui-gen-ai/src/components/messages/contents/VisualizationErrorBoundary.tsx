// (C) 2024-2025 GoodData Corporation
import { Component, ReactNode } from "react";
import { extractError } from "../../../store/sideEffects/utils.js";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { injectIntl, WrappedComponentProps } from "react-intl";

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
