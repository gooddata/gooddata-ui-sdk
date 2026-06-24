// (C) 2022-2026 GoodData Corporation

import { type ReactElement, useEffect, useMemo, useRef } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import type {
    DashboardConfig,
    DashboardDispatch,
    DashboardEventHandler,
    DashboardState,
} from "@gooddata/sdk-ui-dashboard";
import {
    type AdaptiveLoadOptions,
    type DashboardLoadResult,
    type IDashboardLoadOptions,
    type IEmbeddedPlugin,
    type ModuleFederationIntegration,
    useDashboardLoader,
} from "@gooddata/sdk-ui-loaders";

export type DashboardPluginMode = "all" | "embeddedOnly" | "backendOnly" | "disabled";
export type DashboardRuntimeId = string;

type DashboardExtraPlugins = IEmbeddedPlugin | IEmbeddedPlugin[];

type DashboardLoaderWarning = {
    phase: "pluginMode";
    message: string;
    pluginMode: DashboardPluginMode;
    ignoredSource: "extraPlugins" | "backendPlugins";
    dashboard?: string;
};

type DashboardLoaderError = {
    phase: "init" | "update";
    message: string;
    dashboard?: string;
    cause: unknown;
};

type DashboardLoaderBridgeOptions = {
    backend: IAnalyticalBackend;
    workspace?: string;
    dashboard: string;
    config?: DashboardConfig;
    pluginMode?: DashboardPluginMode;
    extraPlugins?: DashboardExtraPlugins;
    moduleFederationIntegration?: ModuleFederationIntegration;
};

export type DashboardLoaderBridgeProps = {
    backend: IAnalyticalBackend;
    workspace?: string;
    dashboard: string;
    config?: DashboardConfig;
    /**
     * Controls which plugins are loaded. When left unset, the bridge picks a safe default:
     * adaptive loading when `moduleFederationIntegration` is available, otherwise a graceful
     * fallback to static-only loading (the dashboard still renders; a warning is emitted).
     */
    pluginMode?: DashboardPluginMode;
    extraPlugins?: DashboardExtraPlugins;
    moduleFederationIntegration?: ModuleFederationIntegration;
    onReady: (runtimeId: DashboardRuntimeId) => void;
    onWarning: (detail: DashboardLoaderWarning) => void;
    onError: (detail: DashboardLoaderError) => void;
    onStateChange: (
        runtimeId: DashboardRuntimeId,
        state: DashboardState,
        dispatch: DashboardDispatch,
    ) => void;
    onEventingInitialized: (
        runtimeId: DashboardRuntimeId,
        registerEventHandler: (handler: DashboardEventHandler) => void,
        unregisterEventHandler: (handler: DashboardEventHandler) => void,
    ) => void;
    onRuntimeDeactivated: (runtimeId: DashboardRuntimeId) => void;
};

type RunnableResolution = {
    kind: "runnable";
    loaderOptions: IDashboardLoadOptions;
    warning?: DashboardLoaderWarning;
};

type InvalidResolution = {
    kind: "invalid";
    error: DashboardLoaderError;
    warning?: DashboardLoaderWarning;
};

function getWarningKey(warning: DashboardLoaderWarning): string {
    return `${warning.phase}|${warning.ignoredSource}|${warning.pluginMode}|${warning.dashboard ?? ""}|${warning.message}`;
}

function getErrorKey(error: DashboardLoaderError): string {
    return `${error.phase}|${error.dashboard ?? ""}|${error.message}`;
}

function hasExtraPlugins(extraPlugins: DashboardExtraPlugins | undefined): boolean {
    if (Array.isArray(extraPlugins)) {
        return extraPlugins.length > 0;
    }

    return extraPlugins !== undefined;
}

function getSuppressedPluginsWarning(
    dashboard: string,
    pluginMode: DashboardPluginMode | undefined,
    extraPlugins: DashboardExtraPlugins | undefined,
): DashboardLoaderWarning | undefined {
    if (!hasExtraPlugins(extraPlugins) || (pluginMode !== "backendOnly" && pluginMode !== "disabled")) {
        return undefined;
    }

    return {
        phase: "pluginMode",
        ignoredSource: "extraPlugins",
        pluginMode,
        dashboard,
        message: `extraPlugins are ignored for dashboard "${dashboard}" when pluginMode="${pluginMode}".`,
    };
}

function getSuppressedBackendPluginsWarning(
    dashboard: string,
    pluginMode: DashboardPluginMode,
): DashboardLoaderWarning {
    return {
        phase: "pluginMode",
        ignoredSource: "backendPlugins",
        pluginMode,
        dashboard,
        message: `Backend-linked plugins are ignored for dashboard "${dashboard}" when pluginMode="${pluginMode}".`,
    };
}

function getMissingModuleFederationWarning(dashboard: string): DashboardLoaderWarning {
    return {
        phase: "pluginMode",
        ignoredSource: "backendPlugins",
        // The user did not pick a mode; "all" is the effective default that was degraded.
        pluginMode: "all",
        dashboard,
        message:
            `Backend-linked plugins for dashboard "${dashboard}" were skipped because ` +
            `moduleFederationIntegration was not provided; the dashboard was loaded with static plugins only. ` +
            `Provide moduleFederationIntegration to enable adaptive loading of backend-linked plugins, ` +
            `or set pluginMode="disabled" to silence this warning.`,
    };
}

function createAdaptiveLoadOptions(
    dashboard: string,
    moduleFederationIntegration: ModuleFederationIntegration | undefined,
): AdaptiveLoadOptions | DashboardLoaderError {
    if (moduleFederationIntegration) {
        return {
            moduleFederationIntegration,
        };
    }

    const message = `Adaptive dashboard loading for dashboard "${dashboard}" requires moduleFederationIntegration.`;

    return {
        phase: "init",
        dashboard,
        message,
        cause: new Error(message),
    };
}

function resolveBridge(props: DashboardLoaderBridgeOptions): RunnableResolution | InvalidResolution {
    const { backend, workspace, dashboard, config, pluginMode, extraPlugins, moduleFederationIntegration } =
        props;
    const baseOptions: Pick<IDashboardLoadOptions, "backend" | "workspace" | "dashboard" | "config"> = {
        backend,
        workspace,
        dashboard,
        config,
    };
    const warning = getSuppressedPluginsWarning(dashboard, pluginMode, extraPlugins);

    switch (pluginMode) {
        case "embeddedOnly":
            return {
                kind: "runnable",
                warning,
                loaderOptions: {
                    ...baseOptions,
                    loadingMode: "staticOnly",
                    extraPlugins,
                },
            };
        case "disabled":
            return {
                kind: "runnable",
                warning,
                loaderOptions: {
                    ...baseOptions,
                    loadingMode: "staticOnly",
                },
            };
        case "all": {
            const adaptiveLoadOptions = createAdaptiveLoadOptions(dashboard, moduleFederationIntegration);
            if ("phase" in adaptiveLoadOptions) {
                return {
                    kind: "invalid",
                    warning,
                    error: adaptiveLoadOptions,
                };
            }

            return {
                kind: "runnable",
                warning,
                loaderOptions: {
                    ...baseOptions,
                    loadingMode: "adaptive",
                    extraPlugins,
                    adaptiveLoadOptions,
                },
            };
        }
        case "backendOnly": {
            const adaptiveLoadOptions = createAdaptiveLoadOptions(dashboard, moduleFederationIntegration);
            if ("phase" in adaptiveLoadOptions) {
                return {
                    kind: "invalid",
                    warning,
                    error: adaptiveLoadOptions,
                };
            }

            return {
                kind: "runnable",
                warning,
                loaderOptions: {
                    ...baseOptions,
                    loadingMode: "adaptive",
                    adaptiveLoadOptions,
                },
            };
        }
        default: {
            // No pluginMode was explicitly requested. Prefer full (adaptive) loading when the
            // host can supply moduleFederationIntegration, but never hard-fail the whole dashboard
            // when it cannot: degrade to static-only loading and surface an actionable warning.
            // This keeps the unconfigured "just embed it" path working, while explicit
            // "all"/"backendOnly" remain strict (they error when moduleFederationIntegration is missing).
            if (moduleFederationIntegration) {
                return {
                    kind: "runnable",
                    loaderOptions: {
                        ...baseOptions,
                        loadingMode: "adaptive",
                        extraPlugins,
                        adaptiveLoadOptions: { moduleFederationIntegration },
                    },
                };
            }

            return {
                kind: "runnable",
                warning: getMissingModuleFederationWarning(dashboard),
                loaderOptions: {
                    ...baseOptions,
                    loadingMode: "staticOnly",
                    extraPlugins,
                },
            };
        }
    }
}

type RunnableDashboardLoaderBridgeProps = Pick<
    DashboardLoaderBridgeProps,
    "dashboard" | "onError" | "onEventingInitialized" | "onReady" | "onRuntimeDeactivated" | "onStateChange"
> & {
    loaderOptions: IDashboardLoadOptions;
};

let dashboardRuntimeSequence = 0;

function createDashboardRuntimeId(): DashboardRuntimeId {
    dashboardRuntimeSequence += 1;
    return `dashboard-runtime-${dashboardRuntimeSequence}`;
}

type MountedDashboardRuntimeProps = Pick<
    DashboardLoaderBridgeProps,
    "onEventingInitialized" | "onReady" | "onRuntimeDeactivated" | "onStateChange"
> & {
    DashboardComponent: DashboardLoadResult["DashboardComponent"];
    dashboardProps: DashboardLoadResult["props"];
};

function useLatestRef<T>(value: T) {
    const valueRef = useRef(value);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    return valueRef;
}

function MountedDashboardRuntime({
    DashboardComponent,
    dashboardProps,
    onReady,
    onStateChange,
    onEventingInitialized,
    onRuntimeDeactivated,
}: MountedDashboardRuntimeProps): ReactElement {
    const runtimeIdRef = useRef<DashboardRuntimeId>(createDashboardRuntimeId());
    const hasDispatchRef = useRef(false);
    const hasEventingRef = useRef(false);
    const readyDispatchedRef = useRef(false);
    const mountedRef = useRef(true);

    const maybeDispatchReady = () => {
        queueMicrotask(() => {
            if (
                !mountedRef.current ||
                readyDispatchedRef.current ||
                !hasDispatchRef.current ||
                !hasEventingRef.current
            ) {
                return;
            }

            readyDispatchedRef.current = true;
            onReady(runtimeIdRef.current);
        });
    };

    useEffect(() => {
        const runtimeId = runtimeIdRef.current;

        return () => {
            mountedRef.current = false;
            onRuntimeDeactivated(runtimeId);
        };
    }, [onRuntimeDeactivated]);

    return (
        <DashboardComponent
            {...dashboardProps}
            onStateChange={(state, dispatch) => {
                hasDispatchRef.current = true;
                onStateChange(runtimeIdRef.current, state, dispatch);
                maybeDispatchReady();
            }}
            onEventingInitialized={(registerEventHandler, unregisterEventHandler) => {
                hasEventingRef.current = true;
                onEventingInitialized(runtimeIdRef.current, registerEventHandler, unregisterEventHandler);
                maybeDispatchReady();
            }}
        />
    );
}

function RunnableDashboardLoaderBridge({
    dashboard,
    loaderOptions,
    onReady,
    onError,
    onStateChange,
    onEventingInitialized,
    onRuntimeDeactivated,
}: RunnableDashboardLoaderBridgeProps): ReactElement | null {
    const loadStatus = useDashboardLoader(loaderOptions);
    const onErrorRef = useLatestRef(onError);
    const lastRuntimeErrorKeyRef = useRef<string | undefined>(undefined);
    const lastRuntimeIdentityRef = useRef<
        | {
              dashboard: string;
              result: DashboardLoadResult | undefined;
              key: number;
          }
        | undefined
    >(undefined);

    useEffect(() => {
        if (loadStatus.status !== "error") {
            lastRuntimeErrorKeyRef.current = undefined;
            return;
        }

        const message =
            loadStatus.error instanceof Error
                ? loadStatus.error.message
                : typeof loadStatus.error === "string"
                  ? loadStatus.error
                  : "Dashboard loader initialization failed.";
        const errorKey = getErrorKey({
            phase: "init",
            dashboard,
            message,
            cause: loadStatus.error,
        });

        if (lastRuntimeErrorKeyRef.current === errorKey) {
            return;
        }

        lastRuntimeErrorKeyRef.current = errorKey;
        onErrorRef.current({
            phase: "init",
            message,
            dashboard,
            cause: loadStatus.error,
        });
    }, [dashboard, loadStatus.error, loadStatus.status, onErrorRef]);

    if (loadStatus.status !== "success" || !loadStatus.result) {
        return null;
    }

    if (
        lastRuntimeIdentityRef.current?.dashboard !== dashboard ||
        lastRuntimeIdentityRef.current?.result !== loadStatus.result
    ) {
        lastRuntimeIdentityRef.current = {
            dashboard,
            result: loadStatus.result,
            key: (lastRuntimeIdentityRef.current?.key ?? 0) + 1,
        };
    }

    const { DashboardComponent, props } = loadStatus.result;

    return (
        <MountedDashboardRuntime
            key={`${dashboard}:${lastRuntimeIdentityRef.current.key}`}
            DashboardComponent={DashboardComponent}
            dashboardProps={props}
            onReady={onReady}
            onStateChange={onStateChange}
            onEventingInitialized={onEventingInitialized}
            onRuntimeDeactivated={onRuntimeDeactivated}
        />
    );
}

export function DashboardLoaderBridge(props: DashboardLoaderBridgeProps): ReactElement | null {
    const {
        backend,
        workspace,
        dashboard,
        config,
        pluginMode,
        extraPlugins,
        moduleFederationIntegration,
        onReady,
        onWarning,
        onError,
        onStateChange,
        onEventingInitialized,
        onRuntimeDeactivated,
    } = props;
    const resolution = useMemo(() => {
        return resolveBridge({
            backend,
            workspace,
            dashboard,
            config,
            pluginMode,
            extraPlugins,
            moduleFederationIntegration,
        });
    }, [backend, workspace, dashboard, config, pluginMode, extraPlugins, moduleFederationIntegration]);
    const lastWarningKeyRef = useRef<string | undefined>(undefined);
    const lastErrorKeyRef = useRef<string | undefined>(undefined);
    const lastSuppressedBackendWarningKeyRef = useRef<string | undefined>(undefined);
    const onWarningRef = useLatestRef(onWarning);
    const onErrorRef = useLatestRef(onError);

    useEffect(() => {
        if (!resolution.warning) {
            lastWarningKeyRef.current = undefined;
            return;
        }

        const warningKey = getWarningKey(resolution.warning);
        if (lastWarningKeyRef.current === warningKey) {
            return;
        }

        lastWarningKeyRef.current = warningKey;
        onWarningRef.current(resolution.warning);
    }, [onWarningRef, resolution.warning]);

    useEffect(() => {
        if (pluginMode !== "embeddedOnly") {
            lastSuppressedBackendWarningKeyRef.current = undefined;
            return;
        }

        if (!workspace) {
            return;
        }

        let cancelled = false;
        try {
            const dashboardWithReferences = backend
                .workspace(workspace)
                .dashboards()
                .getDashboardWithReferences(idRef(dashboard), undefined, { loadUserData: true }, [
                    "dashboardPlugin",
                ]);

            void Promise.resolve(dashboardWithReferences)
                .then((loadedDashboard) => {
                    if (cancelled || !loadedDashboard.references.plugins.length) {
                        return;
                    }

                    const warning = getSuppressedBackendPluginsWarning(dashboard, pluginMode);
                    const warningKey = getWarningKey(warning);
                    if (lastSuppressedBackendWarningKeyRef.current === warningKey) {
                        return;
                    }

                    lastSuppressedBackendWarningKeyRef.current = warningKey;
                    onWarningRef.current(warning);
                })
                .catch(() => undefined);
        } catch {
            return;
        }

        return () => {
            cancelled = true;
        };
    }, [backend, dashboard, onWarningRef, pluginMode, workspace]);

    useEffect(() => {
        if (resolution.kind !== "invalid") {
            lastErrorKeyRef.current = undefined;
            return;
        }

        const errorKey = getErrorKey(resolution.error);
        if (lastErrorKeyRef.current === errorKey) {
            return;
        }

        lastErrorKeyRef.current = errorKey;
        onErrorRef.current(resolution.error);
    }, [onErrorRef, resolution]);

    if (resolution.kind !== "runnable") {
        return null;
    }

    return (
        <RunnableDashboardLoaderBridge
            dashboard={dashboard}
            loaderOptions={resolution.loaderOptions}
            onReady={onReady}
            onError={onError}
            onStateChange={onStateChange}
            onEventingInitialized={onEventingInitialized}
            onRuntimeDeactivated={onRuntimeDeactivated}
        />
    );
}
