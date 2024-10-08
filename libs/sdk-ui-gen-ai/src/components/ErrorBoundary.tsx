// (C) 2024 GoodData Corporation
import React from "react";
import { connect } from "react-redux";
import { GlobalError } from "./GlobalError.js";
import { extractError } from "../store/sideEffects/utils.js";
import {
    RootState,
    globalErrorSelector,
    setGlobalErrorAction,
    clearThreadAction,
    asyncProcessSelector,
} from "../store/index.js";

type ErrorBoundaryProps = {
    children: React.ReactNode;
    globalError?: string;
    isClearing: boolean;
    setGlobalError: typeof setGlobalErrorAction;
    clearThread: () => void;
};

type ErrorBoundaryState = {
    ownError?: string;
};

class ErrorBoundaryComponent extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { ownError: "" };
    }

    static getDerivedStateFromError(error: unknown) {
        return { ownError: extractError(error) };
    }

    componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
        this.props.setGlobalError({ error: extractError(error) });
    }

    clearError() {
        this.props.clearThread();
        this.setState({ ownError: "" });
    }

    render() {
        // Catch both global error from store or local React error
        // And treat them the same
        const error = this.props.globalError || this.state.ownError;
        if (error) {
            return (
                <GlobalError
                    errorDetails={error}
                    clearError={this.clearError.bind(this)}
                    clearing={this.props.isClearing}
                />
            );
        }

        return this.props.children;
    }
}

const mapStateToProps = (state: RootState) => ({
    globalError: globalErrorSelector(state),
    isClearing: asyncProcessSelector(state) === "clearing",
});

const mapDispatchToProps = {
    setGlobalError: setGlobalErrorAction,
    clearThread: clearThreadAction,
};

export const ErrorBoundary = connect(mapStateToProps, mapDispatchToProps)(ErrorBoundaryComponent);
