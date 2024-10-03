// (C) 2024 GoodData Corporation
import React from "react";
import { GlobalError } from "./GlobalError.js";
import { extractError } from "../store/sideEffects/utils.js";

type ErrorBoundaryProps = {
    children: React.ReactNode;
};

type ErrorBoundaryState = {
    errorDetails: string;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { errorDetails: "" };
    }

    static getDerivedStateFromError(error: unknown) {
        return { errorDetails: extractError(error) };
    }

    render() {
        if (this.state.errorDetails) {
            return (
                <GlobalError
                    errorDetails={this.state.errorDetails}
                    clearError={() =>
                        this.setState({
                            errorDetails: "",
                        })
                    }
                />
            );
        }

        return this.props.children;
    }
}
