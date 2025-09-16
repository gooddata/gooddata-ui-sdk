// (C) 2024-2025 GoodData Corporation

import { Component, ErrorInfo, FC, PropsWithChildren, ReactNode } from "react";

import { connect } from "react-redux";

import { GlobalError } from "./GlobalError.js";
import {
    RootState,
    asyncProcessSelector,
    clearThreadAction,
    globalErrorSelector,
    setGlobalErrorAction,
} from "../store/index.js";
import { extractError } from "../store/sideEffects/utils.js";

type ErrorBoundaryProps = {
    children: ReactNode;
    globalError?: string;
    isClearing: boolean;
    setGlobalError: typeof setGlobalErrorAction;
    clearThread: () => void;
};

type ErrorBoundaryState = {
    ownError?: string;
};

class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { ownError: "" };
    }

    static getDerivedStateFromError(error: unknown) {
        return { ownError: extractError(error) };
    }

    override componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
        this.props.setGlobalError({ error: extractError(error) });
    }

    clearError() {
        this.props.clearThread();
        this.setState({ ownError: "" });
    }

    override render() {
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

export const ErrorBoundary: FC<PropsWithChildren> = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ErrorBoundaryComponent) as any;
