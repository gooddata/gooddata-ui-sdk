// (C) 2021-2026 GoodData Corporation

import { type ReactNode, createElement, useCallback, useRef, useState } from "react";

// @ts-expect-error sdk-ui-web-components does not expose declarations through its current package exports.
import { setContext } from "@gooddata/sdk-ui-web-components";

import { createBackend } from "../../../backend";
import { workspace } from "../../../constants";

import "./webComponentScenario.module.scss";

type WebComponentScenarioHarnessProps = {
    element: string;
    hostClassName?: string;
    hostAttributes?: Record<string, string | number | boolean | undefined>;
    onHostReady?: (host: HTMLElement) => void | (() => void);
    children?: ReactNode;
};

type GdErrorDetail = {
    phase?: string;
    message?: string;
};

function formatLastDetail(detail: GdErrorDetail | undefined): string {
    if (!detail) {
        return "";
    }

    return [detail.phase, detail.message].filter(Boolean).join(": ");
}

function getHostProps(
    hostAttributes: Record<string, string | number | boolean | undefined> | undefined,
): Record<string, string | number | boolean> {
    if (!hostAttributes) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(hostAttributes).filter(([, value]) => value !== undefined),
    ) as Record<string, string | number | boolean>;
}

export function WebComponentScenarioHarness({
    element,
    hostClassName,
    hostAttributes,
    onHostReady,
    children,
}: WebComponentScenarioHarnessProps) {
    const backendRef = useRef(createBackend());
    const hostRef = useRef<HTMLElement | null>(null);
    const hostCleanupRef = useRef<VoidFunction | undefined>(undefined);
    const onHostReadyRef = useRef(onHostReady);
    const contextInitializedRef = useRef(false);
    const [readyCount, setReadyCount] = useState(0);
    const [lastError, setLastError] = useState("");
    const [lastWarning, setLastWarning] = useState("");
    const context = useRef({
        backend: backendRef.current,
        workspaceId: workspace,
    });
    onHostReadyRef.current = onHostReady;

    const cleanupHost = useCallback(() => {
        hostCleanupRef.current?.();
        hostCleanupRef.current = undefined;
        hostRef.current = null;
    }, []);

    const attachHost = useCallback(
        (host: HTMLElement | null) => {
            if (!host) {
                cleanupHost();
                return;
            }

            if (hostRef.current === host) {
                return;
            }

            cleanupHost();

            if (!contextInitializedRef.current) {
                setContext(context.current);
                contextInitializedRef.current = true;
            }

            hostRef.current = host;

            const handleReady = () => {
                setReadyCount((count) => count + 1);
            };
            const handleError = (event: Event) => {
                setLastError(formatLastDetail((event as CustomEvent<GdErrorDetail>).detail));
            };
            const handleWarning = (event: Event) => {
                setLastWarning(formatLastDetail((event as CustomEvent<GdErrorDetail>).detail));
            };

            host.addEventListener("gd-ready", handleReady);
            host.addEventListener("gd-error", handleError);
            host.addEventListener("gd-warning", handleWarning);

            Object.assign(host as unknown as Record<string, unknown>, {
                context: context.current,
            });

            const scenarioCleanup = onHostReadyRef.current?.(host);

            hostCleanupRef.current = () => {
                scenarioCleanup?.();
                host.removeEventListener("gd-ready", handleReady);
                host.removeEventListener("gd-error", handleError);
                host.removeEventListener("gd-warning", handleWarning);
            };
        },
        [cleanupHost],
    );

    return (
        <div className="s-wc-scenario-root">
            <div className="s-wc-status">
                <div className="s-wc-ready-count" data-scenario-ready-count="">
                    {readyCount}
                </div>
                <div className="s-wc-last-error" data-scenario-last-error="">
                    {lastError}
                </div>
                <div className="s-wc-last-warning" data-scenario-last-warning="">
                    {lastWarning}
                </div>
            </div>
            {children}
            {createElement(element, {
                ...getHostProps(hostAttributes),
                ref: attachHost,
                className: ["s-wc-host", hostClassName].filter(Boolean).join(" "),
            })}
        </div>
    );
}
