// (C) 2024 GoodData Corporation
import React from "react";
import { extractError } from "../../../store/sideEffects/utils.js";

type ErrorBoundaryProps = {
    children: React.ReactNode;
};

type ErrorBoundaryState = {
    error?: string;
};

export class VisualizationErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { error: "" };
    }

    static getDerivedStateFromError(error: unknown) {
        return { error: extractError(error) };
    }

    render() {
        if (this.state.error) {
            // TODO - proper error
            return <div>Error! Failed to render the visualization</div>;
        }

        return this.props.children;
    }
}
