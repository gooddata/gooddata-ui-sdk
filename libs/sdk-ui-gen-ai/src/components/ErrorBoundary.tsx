// (C) 2024-2026 GoodData Corporation

import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
    AnalyticalBackendErrorTypes,
    isAnalyticalBackendError,
    isUnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";

import { asyncProcessSelector, globalErrorSelector } from "../store/messages/messagesSelectors.js";
import { clearThreadAction, setGlobalErrorAction } from "../store/messages/messagesSlice.js";

import { GlobalError } from "./GlobalError.js";

type ErrorBoundaryProps = {
    children: ReactNode;
    globalError: Record<string, unknown> | null;
    isClearing: boolean;
    setGlobalError: (payload: { error: Error }) => void;
    clearThread: () => void;
};

type ErrorBoundaryState = {
    ownError: Error | null;
};

class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { ownError: null };
    }

    static getDerivedStateFromError(error: unknown) {
        return { ownError: error };
    }

    override componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
        this.props.setGlobalError({ error });
    }

    clearError() {
        this.props.clearThread();
        this.setState({ ownError: null });
    }

    override render() {
        // Catch both global error from store or local React error
        // And treat them the same
        const error = this.props.globalError || this.state.ownError;
        if (error) {
            if (isUnexpectedResponseError(error)) {
                const traceId = (error.responseBody as any)?.traceId as string;
                return (
                    <GlobalError
                        errorDetails={error.message}
                        errorTraceId={error.traceId ?? traceId}
                        clearError={this.clearError.bind(this)}
                        clearing={this.props.isClearing}
                    />
                );
            }
            if (isAnalyticalBackendError(error) && error.abeType === AnalyticalBackendErrorTypes.UNEXPECTED) {
                return (
                    <GlobalError
                        errorDetails={error.message}
                        clearError={this.clearError.bind(this)}
                        clearing={this.props.isClearing}
                    />
                );
            }
            return (
                <GlobalError
                    errorDetails={error.message as string}
                    clearError={this.clearError.bind(this)}
                    clearing={this.props.isClearing}
                />
            );
        }

        return this.props.children;
    }
}

export function ErrorBoundary({ children }: PropsWithChildren) {
    const dispatch = useDispatch();
    const globalError = useSelector(globalErrorSelector);
    const isClearing = useSelector(asyncProcessSelector) === "clearing";

    const setGlobalError = useCallback(
        (payload: { error: Error }) => {
            dispatch(setGlobalErrorAction(payload));
        },
        [dispatch],
    );

    const clearThread = useCallback(() => {
        dispatch(clearThreadAction());
    }, [dispatch]);

    return (
        <ErrorBoundaryComponent
            globalError={globalError}
            isClearing={isClearing}
            setGlobalError={setGlobalError}
            clearThread={clearThread}
        >
            {children}
        </ErrorBoundaryComponent>
    );
}
