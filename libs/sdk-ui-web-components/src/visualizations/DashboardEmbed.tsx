// (C) 2022-2026 GoodData Corporation

import type { ReactElement } from "react";
import { invariant } from "ts-invariant";

import { type FilterContextItem } from "@gooddata/sdk-model";
import { resolveLocale } from "@gooddata/sdk-ui";
import type {
    DashboardDispatch,
    DashboardEventHandler,
    DashboardEvents,
    IDashboardFilter,
    IDashboardProps,
} from "@gooddata/sdk-ui-dashboard";
import type { IEmbeddedPlugin, ModuleFederationIntegration } from "@gooddata/sdk-ui-loaders";

import {
    CustomElementAdapter,
    EVENT_BUILDER,
    EVENT_HANDLER,
    GET_COMPONENT,
    LOAD_COMPONENT,
} from "../common/CustomElementAdapter.js";
import { type CustomElementContext } from "../context.js";

import type {
    DashboardLoaderBridgeProps,
    DashboardPluginMode,
    DashboardRuntimeId,
} from "./internal/DashboardLoaderBridge.js";

type IDashboard = (props: DashboardLoaderBridgeProps) => ReactElement | null;
type DashboardCommandName = "refresh" | "replaceFilters";
const DASHBOARD_NOT_READY_MESSAGE = "Dashboard is not ready for commands yet.";
const DASHBOARD_RUNTIME_INACTIVE_MESSAGE = "Dashboard runtime is no longer active.";

type DashboardInFlightCommand = {
    runtimeId: DashboardRuntimeId;
    promise: Promise<void>;
    cancel: (message: string) => void;
};

type DashboardRuntimeController = {
    activeRuntimeId?: DashboardRuntimeId;
    readyRuntimeId?: DashboardRuntimeId;
    dispatch?: DashboardDispatch;
    registerEventHandler?: (handler: DashboardEventHandler) => void;
    unregisterEventHandler?: (handler: DashboardEventHandler) => void;
    inFlightCommands: Partial<Record<DashboardCommandName, DashboardInFlightCommand>>;
};

export class DashboardEmbed extends CustomElementAdapter<IDashboard> {
    private runtime: DashboardRuntimeController = {
        inFlightCommands: {},
    };

    private readonly forwardDashboardEvents: DashboardEventHandler = {
        eval: () => true,
        handler: (event) => {
            this[EVENT_HANDLER](event.type)(event.payload);
        },
    };

    private readonly retiredRuntimeIds = new Set<DashboardRuntimeId>();

    private allowPublicReadyDispatch = false;

    private commandSequence = 0;

    static get observedAttributes() {
        return ["workspace", "dashboard", "locale", "readonly", "mapbox", "agGrid"];
    }

    protected override getLiveProperties(): string[] {
        return [
            "context",
            "config",
            "dashboard",
            "pluginMode",
            "extraPlugins",
            "moduleFederationIntegration",
        ];
    }

    protected override getIdentityProperties(): string[] {
        return ["dashboard"];
    }

    protected override getResolvedContext(): CustomElementContext | undefined {
        const defaultContext = this.getDefaultContextSnapshot();
        const propertyContext = this.getLivePropertyValue<Partial<CustomElementContext>>("context");

        const backend = propertyContext?.backend ?? defaultContext?.backend;
        if (!backend) {
            return undefined;
        }

        return {
            backend,
            workspaceId:
                propertyContext?.workspaceId ?? this.getAttribute("workspace") ?? defaultContext?.workspaceId,
            mapboxToken: propertyContext?.mapboxToken ?? defaultContext?.mapboxToken,
            agGridToken: propertyContext?.agGridToken ?? defaultContext?.agGridToken,
        };
    }

    override async [LOAD_COMPONENT]() {
        return (await import("./internal/DashboardLoaderBridge.js")).DashboardLoaderBridge;
    }

    override dispatchEvent(event: Event): boolean {
        if (event.type === "gd-ready" && !this.allowPublicReadyDispatch) {
            return true;
        }

        return super.dispatchEvent(event);
    }

    override disconnectedCallback() {
        this.clearRuntime(DASHBOARD_RUNTIME_INACTIVE_MESSAGE, true);
        super.disconnectedCallback();
    }

    async refresh(): Promise<void> {
        const { initializeDashboard } = await import("@gooddata/sdk-ui-dashboard");

        return this.runCommand("refresh", (correlationId) =>
            initializeDashboard(this.getResolvedDashboardConfig(), undefined, correlationId),
        );
    }

    async replaceFilters(filters: (IDashboardFilter | FilterContextItem)[]): Promise<void> {
        const { changeFilterContextSelection } = await import("@gooddata/sdk-ui-dashboard");

        return this.runCommand("replaceFilters", (correlationId) =>
            changeFilterContextSelection(filters, true, correlationId),
        );
    }

    override [GET_COMPONENT](
        Component: IDashboard,
        { backend, workspaceId, mapboxToken, agGridToken }: CustomElementContext,
    ) {
        const dashboard = this.getResolvedInputValue<string>("dashboard");

        // "dashboard" property is mandatory
        invariant(dashboard, '"dashboard" is a mandatory attribute and it cannot be empty');

        return (
            <Component
                backend={backend}
                workspace={workspaceId}
                dashboard={dashboard}
                config={this.getResolvedDashboardConfig({
                    mapboxToken,
                    agGridToken,
                })}
                pluginMode={this.getLivePropertyValue<DashboardPluginMode>("pluginMode")}
                extraPlugins={this.getLivePropertyValue<IEmbeddedPlugin | IEmbeddedPlugin[]>("extraPlugins")}
                moduleFederationIntegration={this.getLivePropertyValue<ModuleFederationIntegration>(
                    "moduleFederationIntegration",
                )}
                onReady={(runtimeId) => this.handleRuntimeReady(runtimeId)}
                onWarning={(detail) => {
                    console.warn(detail.message, detail);
                    this.dispatchEvent(this[EVENT_BUILDER]("gd-warning", detail));
                }}
                onError={(detail) => {
                    this.dispatchEvent(
                        this[EVENT_BUILDER]("gd-error", {
                            ...detail,
                            dashboard: detail.dashboard ?? dashboard,
                        }),
                    );
                }}
                onStateChange={(runtimeId, _, dispatch) => this.handleRuntimeStateChange(runtimeId, dispatch)}
                onEventingInitialized={(runtimeId, registerEventHandler, unregisterEventHandler) =>
                    this.handleRuntimeEventingInitialized(
                        runtimeId,
                        registerEventHandler,
                        unregisterEventHandler,
                    )
                }
                onRuntimeDeactivated={(runtimeId) => this.deactivateRuntime(runtimeId)}
            />
        );
    }

    private getResolvedDashboardConfig(defaultTokens?: {
        mapboxToken?: string;
        agGridToken?: string;
    }): IDashboardProps["config"] | undefined {
        if (this.hasLivePropertyValue("config")) {
            return this.getLivePropertyValue<IDashboardProps["config"]>("config");
        }

        const bootstrapConfig: NonNullable<IDashboardProps["config"]> = {};

        if (this.hasAttribute("locale")) {
            bootstrapConfig.locale = resolveLocale(this.getAttribute("locale"));
        }

        if (this.hasAttribute("readonly")) {
            bootstrapConfig.isReadOnly = true;
        }

        if (this.hasAttribute("mapbox") || defaultTokens?.mapboxToken) {
            bootstrapConfig.mapboxToken = (this.getAttribute("mapbox") || defaultTokens?.mapboxToken) ?? "";
        }

        if (this.hasAttribute("agGrid") || defaultTokens?.agGridToken) {
            bootstrapConfig.agGridToken = (this.getAttribute("agGrid") || defaultTokens?.agGridToken) ?? "";
        }

        return Object.keys(bootstrapConfig).length > 0 ? bootstrapConfig : undefined;
    }

    private async runCommand(
        commandName: DashboardCommandName,
        createCommand: (correlationId: string) => PromiseLike<never> | unknown,
    ): Promise<void> {
        const inFlight = this.runtime.inFlightCommands[commandName];
        if (inFlight) {
            return inFlight.promise;
        }

        const { activeRuntimeId, readyRuntimeId, dispatch, registerEventHandler, unregisterEventHandler } =
            this.runtime;
        if (
            !activeRuntimeId ||
            readyRuntimeId !== activeRuntimeId ||
            !dispatch ||
            !registerEventHandler ||
            !unregisterEventHandler
        ) {
            return this.rejectInvalidUsage(commandName, DASHBOARD_NOT_READY_MESSAGE);
        }

        const correlationId = `${commandName}-${++this.commandSequence}`;
        const command = createCommand(correlationId);
        const commandEntry: DashboardInFlightCommand = {
            runtimeId: activeRuntimeId,
            promise: Promise.resolve(),
            cancel: () => undefined,
        };
        const promise = new Promise<void>((resolve, reject) => {
            let settled = false;

            const finalize = (callback: () => void) => {
                if (settled) {
                    return;
                }

                settled = true;
                unregisterEventHandler(commandHandler);
                callback();
            };

            const commandHandler: DashboardEventHandler = {
                eval: (event) =>
                    "correlationId" in event &&
                    event.correlationId === correlationId &&
                    (event.type === "GDC.DASH/EVT.INITIALIZED" ||
                        event.type === "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED" ||
                        event.type === "GDC.DASH/EVT.COMMAND.FAILED"),
                handler: (event) => {
                    const dashboardEvent = event as Extract<
                        DashboardEvents,
                        {
                            type:
                                | "GDC.DASH/EVT.INITIALIZED"
                                | "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED"
                                | "GDC.DASH/EVT.COMMAND.FAILED";
                        }
                    >;

                    if (dashboardEvent.type === "GDC.DASH/EVT.COMMAND.FAILED") {
                        const error =
                            dashboardEvent.payload.error ?? new Error(dashboardEvent.payload.message);
                        finalize(() => {
                            this.dispatchCommandError(commandName, error, dashboardEvent.payload.message);
                            reject(error);
                        });
                        return;
                    }

                    finalize(() => {
                        resolve();
                    });
                },
            };

            commandEntry.cancel = (message) => {
                finalize(() => {
                    const error = new Error(message);
                    this.dispatchCommandError(commandName, error, message);
                    reject(error);
                });
            };

            registerEventHandler(commandHandler);

            try {
                dispatch(command as Parameters<DashboardDispatch>[0]);
            } catch (error) {
                finalize(() => {
                    this.dispatchCommandError(commandName, error);
                    reject(error);
                });
            }
        }).finally(() => {
            if (this.runtime.inFlightCommands[commandName] === commandEntry) {
                delete this.runtime.inFlightCommands[commandName];
            }
        });

        commandEntry.promise = promise;
        this.runtime.inFlightCommands[commandName] = commandEntry;
        return promise;
    }

    private handleRuntimeStateChange(runtimeId: DashboardRuntimeId, dispatch: DashboardDispatch) {
        if (!this.activateRuntime(runtimeId)) {
            return;
        }

        this.runtime.dispatch = dispatch;
    }

    private handleRuntimeEventingInitialized(
        runtimeId: DashboardRuntimeId,
        registerEventHandler: (handler: DashboardEventHandler) => void,
        unregisterEventHandler: (handler: DashboardEventHandler) => void,
    ) {
        if (!this.activateRuntime(runtimeId)) {
            return;
        }

        this.runtime.unregisterEventHandler?.(this.forwardDashboardEvents);
        this.runtime.registerEventHandler = registerEventHandler;
        this.runtime.unregisterEventHandler = unregisterEventHandler;
        registerEventHandler(this.forwardDashboardEvents);
    }

    private handleRuntimeReady(runtimeId: DashboardRuntimeId) {
        if (
            this.retiredRuntimeIds.has(runtimeId) ||
            this.runtime.activeRuntimeId !== runtimeId ||
            !this.runtime.dispatch ||
            !this.runtime.registerEventHandler ||
            !this.runtime.unregisterEventHandler ||
            this.runtime.readyRuntimeId === runtimeId
        ) {
            return;
        }

        this.runtime.readyRuntimeId = runtimeId;
        this.dispatchDashboardReady();
    }

    private activateRuntime(runtimeId: DashboardRuntimeId): boolean {
        if (this.retiredRuntimeIds.has(runtimeId)) {
            return false;
        }

        if (this.runtime.activeRuntimeId === runtimeId) {
            return true;
        }

        this.clearRuntime(DASHBOARD_RUNTIME_INACTIVE_MESSAGE, true);
        this.runtime.activeRuntimeId = runtimeId;
        return true;
    }

    private deactivateRuntime(runtimeId: DashboardRuntimeId) {
        if (this.runtime.activeRuntimeId !== runtimeId) {
            this.retiredRuntimeIds.add(runtimeId);
            return;
        }

        this.clearRuntime(DASHBOARD_RUNTIME_INACTIVE_MESSAGE, true);
    }

    private clearRuntime(message: string, retireActiveRuntime: boolean) {
        if (retireActiveRuntime && this.runtime.activeRuntimeId) {
            this.retiredRuntimeIds.add(this.runtime.activeRuntimeId);
        }

        this.runtime.unregisterEventHandler?.(this.forwardDashboardEvents);

        const inFlightCommands = Object.values(this.runtime.inFlightCommands);

        this.runtime = {
            inFlightCommands: {},
        };

        for (const inFlightCommand of inFlightCommands) {
            inFlightCommand?.cancel(message);
        }
    }

    private dispatchDashboardReady() {
        this.allowPublicReadyDispatch = true;
        try {
            super.dispatchEvent(this[EVENT_BUILDER]("gd-ready", undefined));
        } finally {
            this.allowPublicReadyDispatch = false;
        }
    }

    private dispatchCommandError(commandName: DashboardCommandName, cause: unknown, message?: string) {
        this.dispatchEvent(
            new CustomEvent("gd-error", {
                detail: {
                    phase: commandName,
                    command: commandName,
                    dashboard: this.getResolvedInputValue("dashboard"),
                    message:
                        message ??
                        (cause instanceof Error
                            ? cause.message
                            : typeof cause === "string"
                              ? cause
                              : "Unknown command error"),
                    cause,
                },
                bubbles: false,
                cancelable: false,
                composed: false,
            }),
        );
    }

    private rejectInvalidUsage(commandName: DashboardCommandName, message: string): Promise<never> {
        const error = new Error(message);

        this.dispatchEvent(
            new CustomEvent("gd-error", {
                detail: {
                    phase: "invalidUsage",
                    command: commandName,
                    dashboard: this.getResolvedInputValue("dashboard"),
                    message,
                    cause: error,
                },
                bubbles: false,
                cancelable: false,
                composed: false,
            }),
        );

        return Promise.reject(error);
    }
}
