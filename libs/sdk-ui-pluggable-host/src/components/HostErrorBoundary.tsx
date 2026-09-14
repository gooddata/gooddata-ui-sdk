// (C) 2026 GoodData Corporation

import { Component, type ErrorInfo, type ReactNode } from "react";

import { FormattedMessage } from "react-intl";

import { type ILocale } from "@gooddata/sdk-model";
import { DEFAULT_LANGUAGE } from "@gooddata/sdk-ui";
import { bemFactory } from "@gooddata/sdk-ui-kit";

import { HostIntlProvider } from "../ui/HostIntlProvider.js";

import "./Root.scss";

const { e } = bemFactory("gd-host-root");

/**
 * Properties of {@link HostErrorBoundary}.
 *
 * @alpha
 */
export interface IHostErrorBoundaryProps {
    /**
     * Reports the caught error together with the React component stack it was thrown from.
     */
    onError?: (error: string, context: string) => void;
    locale?: ILocale;
    /**
     * A caught error is cleared when this value changes, so the subtree gets a fresh
     * mount attempt (e.g. on navigation) instead of showing the fallback forever.
     */
    resetKey?: string | number;
    children: ReactNode;
}

/**
 * State of {@link HostErrorBoundary}.
 *
 * @alpha
 */
export interface IHostErrorBoundaryState {
    hasError: boolean;
    resetKey?: string | number;
}

/**
 * Last-resort boundary for errors escaping to the host application root. The host page is
 * composed of nested React roots rendering into DOM owned by the topmost root, so without
 * a boundary React unmounts the entire tree — header included — leaving a blank page.
 *
 * @alpha
 */
export class HostErrorBoundary extends Component<IHostErrorBoundaryProps, IHostErrorBoundaryState> {
    override state: IHostErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): Partial<IHostErrorBoundaryState> {
        return { hasError: true };
    }

    static getDerivedStateFromProps(
        props: IHostErrorBoundaryProps,
        state: IHostErrorBoundaryState,
    ): Partial<IHostErrorBoundaryState> | null {
        if (props.resetKey !== state.resetKey) {
            return { resetKey: props.resetKey, hasError: false };
        }
        return null;
    }

    override componentDidCatch(error: Error, info: ErrorInfo): void {
        this.props.onError?.(String(error), info.componentStack ?? "");
    }

    override render(): ReactNode {
        if (!this.state.hasError) {
            return this.props.children;
        }

        // Exception details go to telemetry (onError) and the console only — rendering them
        // could expose internal backend details in the UI.
        return (
            <HostIntlProvider locale={this.props.locale ?? DEFAULT_LANGUAGE}>
                {/* Not a <main>: the app-slot fallback renders inside the chrome's <main>,
                    and nested main landmarks break screen-reader landmark navigation. */}
                <div className={e("error")} role="alert">
                    <h1>
                        <FormattedMessage id="gs.host.error.somethingWentWrong" />
                    </h1>
                </div>
            </HostIntlProvider>
        );
    }
}
