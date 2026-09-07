// (C) 2024-2026 GoodData Corporation

import { Component, type ReactNode } from "react";

import { useIntl } from "react-intl";

import { ErrorComponent } from "@gooddata/sdk-ui";

import { extractError } from "../../../store/sideEffects/utils.js";

interface IErrorBoundaryProps {
    children: ReactNode;
}

type ErrorBoundaryState = {
    error?: string;
};

function GlobalErrorMessage() {
    const intl = useIntl();

    return <ErrorComponent message={intl.formatMessage({ id: "gd.gen-ai.global-error" })} />;
}

export class VisualizationErrorBoundary extends Component<IErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: IErrorBoundaryProps) {
        super(props);
        this.state = { error: "" };
    }

    static getDerivedStateFromError(error: unknown) {
        return { error: extractError(error) };
    }

    override render() {
        if (this.state.error) {
            return <GlobalErrorMessage />;
        }

        return this.props.children;
    }
}
