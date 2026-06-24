// (C) 2022-2026 GoodData Corporation

// @vitest-environment happy-dom

import { type ReactElement, act, createElement } from "react";

import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import type { IDashboardProps } from "@gooddata/sdk-ui-dashboard";
import type {
    DashboardLoadResult,
    DashboardLoadStatus,
    IDashboardLoadOptions,
    IEmbeddedPlugin,
    ModuleFederationIntegration,
} from "@gooddata/sdk-ui-loaders";

import type { DashboardLoaderBridgeProps } from "../visualizations/internal/DashboardLoaderBridge.js";

const timeout = 20000;
const renderSpy = vi.fn();
const dashboardDispatch = vi.fn();
const registerEventHandler = vi.fn();
const unregisterEventHandler = vi.fn();
const useDashboardLoaderMock = vi.fn<(options: IDashboardLoadOptions) => DashboardLoadStatus>();
const initializeDashboard = vi.fn((config, permissions, correlationId) => ({
    type: "GDC.DASH/CMD.INITIALIZE",
    correlationId,
    payload: {
        config,
        permissions,
    },
}));
const changeFilterContextSelection = vi.fn((filters, resetOthers, correlationId) => ({
    type: "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
    correlationId,
    payload: {
        filters,
        resetOthers,
    },
}));

vi.mock("@gooddata/sdk-ui-loaders", () => ({
    useDashboardLoader: useDashboardLoaderMock,
}));

vi.mock("@gooddata/sdk-ui-dashboard", () => ({
    Dashboard: (props: IDashboardProps) => {
        renderSpy(props);
        props.onStateChange?.({} as never, dashboardDispatch);
        props.onEventingInitialized?.(registerEventHandler, unregisterEventHandler);

        return createElement("div");
    },
    initializeDashboard,
    changeFilterContextSelection,
}));

const flushMicrotasks = async (count = 4) => {
    for (let i = 0; i < count; i += 1) {
        await Promise.resolve();
    }

    await new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
};

const actAndFlush = async (callback?: () => void, count = 4) => {
    await act(async () => {
        callback?.();
        await flushMicrotasks(count);
    });
};

const createBridgeProps = (
    overrides: Partial<DashboardLoaderBridgeProps> = {},
): DashboardLoaderBridgeProps => ({
    backend: dummyBackend(),
    workspace: "workspace",
    dashboard: "dashboard-id",
    config: undefined,
    pluginMode: "all",
    extraPlugins: undefined,
    moduleFederationIntegration: undefined,
    onReady: vi.fn(),
    onWarning: vi.fn(),
    onError: vi.fn(),
    onStateChange: vi.fn(),
    onEventingInitialized: vi.fn(),
    onRuntimeDeactivated: vi.fn(),
    ...overrides,
});

const createModuleFederationIntegration = (): ModuleFederationIntegration => ({
    __webpack_init_sharing__: vi.fn(async () => undefined),
    __webpack_share_scopes__: {},
});

const createMockDashboardComponent = (
    onRender: (dashboardProps: IDashboardProps) => void,
): DashboardLoadResult["DashboardComponent"] =>
    vi.fn((dashboardProps: IDashboardProps) => {
        renderSpy(dashboardProps);
        onRender(dashboardProps);

        return createElement("div");
    });

const createLoaderResult = (props: DashboardLoaderBridgeProps): DashboardLoadResult => ({
    DashboardComponent: createMockDashboardComponent((dashboardProps) => {
        dashboardProps.onStateChange?.({} as never, dashboardDispatch);
        dashboardProps.onEventingInitialized?.(registerEventHandler, unregisterEventHandler);
    }),
    props: {
        backend: props.backend,
        dashboard: props.dashboard,
    },
    ctx: {} as never,
    engine: {} as never,
    plugins: [],
});

const renderReact = async (element: ReactElement) => {
    const container = document.createElement("div");
    document.body.append(container);

    const root = createRoot(container);

    await actAndFlush(() => {
        root.render(element);
    }, 1);

    return {
        container,
        rerender: async (nextElement: ReactElement) => {
            await actAndFlush(() => {
                root.render(nextElement);
            }, 1);
        },
        unmount: async () => {
            await actAndFlush(() => {
                root.unmount();
            }, 1);
            container.remove();
        },
    };
};

const createSuccessfulLoaderStatus = (options: Partial<IDashboardLoadOptions> = {}): DashboardLoadStatus => ({
    status: "success",
    result: createLoaderResult(
        createBridgeProps({
            backend: (options.backend as DashboardLoaderBridgeProps["backend"] | undefined) ?? dummyBackend(),
            workspace: options.workspace as string | undefined,
            dashboard: (options.dashboard as string | undefined) ?? "dashboard-id",
            config: options.config as DashboardLoaderBridgeProps["config"],
        }),
    ),
    error: undefined,
});

type DeferredDashboardRuntime = {
    onStateChange?: (state: unknown, dispatch: typeof dashboardDispatch) => void;
    onEventingInitialized?: (
        register: typeof registerEventHandler,
        unregister: typeof unregisterEventHandler,
    ) => void;
};

const createDeferredLoaderStatus = (options: Partial<IDashboardLoadOptions> = {}) => {
    const runtime: DeferredDashboardRuntime = {};
    const props = createBridgeProps({
        backend: (options.backend as DashboardLoaderBridgeProps["backend"] | undefined) ?? dummyBackend(),
        workspace: options.workspace as string | undefined,
        dashboard: (options.dashboard as string | undefined) ?? "dashboard-id",
        config: options.config as DashboardLoaderBridgeProps["config"],
    });

    return {
        runtime,
        loadStatus: {
            status: "success",
            result: {
                ...createLoaderResult(props),
                DashboardComponent: createMockDashboardComponent((dashboardProps) => {
                    runtime.onStateChange = dashboardProps.onStateChange as
                        | DeferredDashboardRuntime["onStateChange"]
                        | undefined;
                    runtime.onEventingInitialized = dashboardProps.onEventingInitialized as
                        | DeferredDashboardRuntime["onEventingInitialized"]
                        | undefined;
                }),
            },
            error: undefined,
        } satisfies DashboardLoadStatus,
    };
};

describe("Dashboard", () => {
    beforeEach(async () => {
        (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
            true;
        await actAndFlush(() => {
            document.body.replaceChildren();
        }, 1);
        vi.resetModules();
        renderSpy.mockClear();
        dashboardDispatch.mockClear();
        registerEventHandler.mockClear();
        unregisterEventHandler.mockClear();
        useDashboardLoaderMock.mockReset();
        useDashboardLoaderMock.mockReturnValue({
            status: "loading",
            result: undefined,
            error: undefined,
        });
        initializeDashboard.mockClear();
        changeFilterContextSelection.mockClear();
    });

    it(
        "registers gd-dashboard as the legacy runtime and gd-dashboard-embed as the strict runtime",
        async () => {
            const { Dashboard } = await import("../visualizations/Dashboard.js");
            const { DashboardEmbed } = await import("../visualizations/DashboardEmbed.js");

            await import("../index.js");

            expect(customElements.get("gd-dashboard")).toBe(Dashboard);
            expect(customElements.get("gd-dashboard-embed")).toBe(DashboardEmbed);
        },
        timeout,
    );

    it(
        "renders legacy gd-dashboard directly instead of wrapping gd-dashboard-embed",
        async () => {
            const { setContext } = await import("../context.js");
            const { Dashboard: DashboardElement } = await import("../visualizations/Dashboard.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });

            const tagName = "test-legacy-gd-dashboard-direct";
            customElements.define(tagName, DashboardElement);

            const element = document.createElement(tagName) as HTMLElement;
            element.setAttribute("dashboard", "first-dashboard");

            await actAndFlush(() => {
                document.body.append(element);
            }, 1);

            expect(element.querySelector("gd-dashboard-embed")).toBeNull();
            expect(renderSpy.mock.lastCall?.[0]).toMatchObject({
                dashboard: "first-dashboard",
            });

            await actAndFlush(() => {
                element.setAttribute("dashboard", "second-dashboard");
            }, 1);

            expect(element.querySelector("gd-dashboard-embed")).toBeNull();
            expect(renderSpy.mock.lastCall?.[0]).toMatchObject({
                dashboard: "second-dashboard",
            });
        },
        timeout,
    );

    it(
        "should map embeddedOnly pluginMode to staticOnly and keep extraPlugins",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const extraPlugin: IEmbeddedPlugin = {
                factory: vi.fn(),
            };
            const props = createBridgeProps({
                pluginMode: "embeddedOnly",
                extraPlugins: extraPlugin,
            });

            const rendered = await renderReact(createElement(DashboardLoaderBridge, props));

            expect(useDashboardLoaderMock).toHaveBeenCalledTimes(1);
            expect(useDashboardLoaderMock).toHaveBeenCalledWith({
                backend: props.backend,
                workspace: props.workspace,
                dashboard: props.dashboard,
                config: props.config,
                loadingMode: "staticOnly",
                extraPlugins: extraPlugin,
            });
            expect(props.onWarning).not.toHaveBeenCalled();

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should map all pluginMode to adaptive and keep extraPlugins",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const extraPlugin: IEmbeddedPlugin = {
                factory: vi.fn(),
            };
            const moduleFederationIntegration = createModuleFederationIntegration();
            const props = createBridgeProps({
                pluginMode: "all",
                extraPlugins: [extraPlugin],
                moduleFederationIntegration,
            });

            const rendered = await renderReact(createElement(DashboardLoaderBridge, props));

            expect(useDashboardLoaderMock).toHaveBeenCalledTimes(1);
            expect(useDashboardLoaderMock).toHaveBeenCalledWith({
                backend: props.backend,
                workspace: props.workspace,
                dashboard: props.dashboard,
                config: props.config,
                loadingMode: "adaptive",
                extraPlugins: [extraPlugin],
                adaptiveLoadOptions: {
                    moduleFederationIntegration,
                },
            });

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should map backendOnly pluginMode to adaptive, ignore extraPlugins and emit warning",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const moduleFederationIntegration = createModuleFederationIntegration();
            const props = createBridgeProps({
                pluginMode: "backendOnly",
                extraPlugins: [{ factory: vi.fn() }],
                moduleFederationIntegration,
            });

            const rendered = await renderReact(createElement(DashboardLoaderBridge, props));

            expect(useDashboardLoaderMock).toHaveBeenCalledTimes(1);
            expect(useDashboardLoaderMock).toHaveBeenCalledWith({
                backend: props.backend,
                workspace: props.workspace,
                dashboard: props.dashboard,
                config: props.config,
                loadingMode: "adaptive",
                adaptiveLoadOptions: {
                    moduleFederationIntegration,
                },
            });
            expect(props.onWarning).toHaveBeenCalledWith({
                phase: "pluginMode",
                ignoredSource: "extraPlugins",
                pluginMode: "backendOnly",
                dashboard: "dashboard-id",
                message: expect.stringContaining('pluginMode="backendOnly"'),
            });

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should emit init error when backendOnly mode misses moduleFederationIntegration",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const props = createBridgeProps({
                pluginMode: "backendOnly",
            });

            const rendered = await renderReact(createElement(DashboardLoaderBridge, props));

            expect(useDashboardLoaderMock).not.toHaveBeenCalled();
            expect(props.onError).toHaveBeenCalledWith({
                phase: "init",
                dashboard: "dashboard-id",
                message: expect.stringContaining("moduleFederationIntegration"),
                cause: expect.any(Error),
            });

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should map unset pluginMode to adaptive when moduleFederationIntegration is provided",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const extraPlugin: IEmbeddedPlugin = { factory: vi.fn() };
            const moduleFederationIntegration = createModuleFederationIntegration();
            const props = createBridgeProps({
                pluginMode: undefined,
                extraPlugins: [extraPlugin],
                moduleFederationIntegration,
            });

            const rendered = await renderReact(createElement(DashboardLoaderBridge, props));

            expect(useDashboardLoaderMock).toHaveBeenCalledTimes(1);
            expect(useDashboardLoaderMock).toHaveBeenCalledWith({
                backend: props.backend,
                workspace: props.workspace,
                dashboard: props.dashboard,
                config: props.config,
                loadingMode: "adaptive",
                extraPlugins: [extraPlugin],
                adaptiveLoadOptions: {
                    moduleFederationIntegration,
                },
            });
            expect(props.onError).not.toHaveBeenCalled();
            expect(props.onWarning).not.toHaveBeenCalled();

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should fall back to staticOnly and warn when pluginMode is unset and moduleFederationIntegration is missing",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const extraPlugin: IEmbeddedPlugin = { factory: vi.fn() };
            const props = createBridgeProps({
                pluginMode: undefined,
                extraPlugins: [extraPlugin],
                moduleFederationIntegration: undefined,
            });

            const rendered = await renderReact(createElement(DashboardLoaderBridge, props));

            // The dashboard still loads (with static plugins) instead of rendering null.
            expect(useDashboardLoaderMock).toHaveBeenCalledTimes(1);
            expect(useDashboardLoaderMock).toHaveBeenCalledWith({
                backend: props.backend,
                workspace: props.workspace,
                dashboard: props.dashboard,
                config: props.config,
                loadingMode: "staticOnly",
                extraPlugins: [extraPlugin],
            });
            // No hard failure - only an actionable warning about skipped backend plugins.
            expect(props.onError).not.toHaveBeenCalled();
            expect(props.onWarning).toHaveBeenCalledWith({
                phase: "pluginMode",
                ignoredSource: "backendPlugins",
                pluginMode: "all",
                dashboard: "dashboard-id",
                message: expect.stringContaining("moduleFederationIntegration"),
            });

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should emit init error when explicit all mode misses moduleFederationIntegration",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const props = createBridgeProps({
                pluginMode: "all",
            });

            const rendered = await renderReact(createElement(DashboardLoaderBridge, props));

            expect(useDashboardLoaderMock).not.toHaveBeenCalled();
            expect(props.onError).toHaveBeenCalledWith({
                phase: "init",
                dashboard: "dashboard-id",
                message: expect.stringContaining("moduleFederationIntegration"),
                cause: expect.any(Error),
            });

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should call onReady again when the same dashboard gets a new runtime instance",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const props = createBridgeProps({
                pluginMode: "embeddedOnly",
            });
            const firstLoaderResult = createLoaderResult(props);
            let loadStatus: DashboardLoadStatus = {
                status: "success",
                result: firstLoaderResult,
                error: undefined,
            };
            useDashboardLoaderMock.mockImplementation(() => loadStatus);

            const rendered = await renderReact(createElement(DashboardLoaderBridge, props));
            await actAndFlush(undefined, 1);

            expect(props.onReady).toHaveBeenCalledTimes(1);

            loadStatus = {
                status: "loading",
                result: undefined,
                error: undefined,
            };
            await rendered.rerender(createElement(DashboardLoaderBridge, props));
            await actAndFlush(undefined, 1);

            loadStatus = {
                status: "error",
                result: undefined,
                error: new Error("Loader failed"),
            };
            await rendered.rerender(createElement(DashboardLoaderBridge, props));
            await actAndFlush(undefined, 1);

            loadStatus = {
                status: "success",
                result: createLoaderResult(props),
                error: undefined,
            };
            await rendered.rerender(createElement(DashboardLoaderBridge, props));
            await actAndFlush(undefined, 1);

            expect(props.onReady).toHaveBeenCalledTimes(2);

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should call onReady again when dashboard identity changes",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const initialProps = createBridgeProps({
                pluginMode: "embeddedOnly",
                dashboard: "dashboard-id-1",
            });
            const nextProps = {
                ...initialProps,
                dashboard: "dashboard-id-2",
            };

            useDashboardLoaderMock.mockImplementation(
                (options: IDashboardLoadOptions) =>
                    ({
                        status: "success" as const,
                        result: createLoaderResult({
                            ...initialProps,
                            dashboard: options.dashboard as string,
                        }),
                        error: undefined,
                    }) satisfies DashboardLoadStatus,
            );

            const rendered = await renderReact(createElement(DashboardLoaderBridge, initialProps));
            await actAndFlush(undefined, 1);

            expect(initialProps.onReady).toHaveBeenCalledTimes(1);

            await rendered.rerender(createElement(DashboardLoaderBridge, nextProps));
            await actAndFlush(undefined, 1);

            expect(initialProps.onReady).toHaveBeenCalledTimes(2);

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should mount a successful loader result even when dashboard props resolve to an ObjRef-like value",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const props = createBridgeProps({
                pluginMode: "embeddedOnly",
            });

            useDashboardLoaderMock.mockImplementation(() => ({
                status: "success",
                result: {
                    ...createLoaderResult(props),
                    props: {
                        backend: props.backend,
                        dashboard: {
                            identifier: props.dashboard,
                        } as never,
                    },
                },
                error: undefined,
            }));

            const rendered = await renderReact(createElement(DashboardLoaderBridge, props));
            await actAndFlush(undefined, 1);

            expect(renderSpy).toHaveBeenCalled();
            expect(props.onReady).toHaveBeenCalledTimes(1);

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should not re-emit the same invalid init error on rerender",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const onError = vi.fn();
            const baseProps = createBridgeProps({
                pluginMode: "backendOnly",
                onError,
            });

            const rendered = await renderReact(createElement(DashboardLoaderBridge, baseProps));

            expect(onError).toHaveBeenCalledTimes(1);

            await rendered.rerender(
                createElement(DashboardLoaderBridge, {
                    ...baseProps,
                    config: {},
                }),
            );

            expect(onError).toHaveBeenCalledTimes(1);

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should not re-emit the same pluginMode warning on rerender",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const onWarning = vi.fn();
            const extraPlugin: IEmbeddedPlugin = {
                factory: vi.fn(),
            };
            const baseProps = createBridgeProps({
                pluginMode: "disabled",
                extraPlugins: [extraPlugin],
                onWarning,
            });

            const rendered = await renderReact(createElement(DashboardLoaderBridge, baseProps));

            expect(onWarning).toHaveBeenCalledTimes(1);

            await rendered.rerender(
                createElement(DashboardLoaderBridge, {
                    ...baseProps,
                    extraPlugins: [extraPlugin],
                }),
            );

            expect(onWarning).toHaveBeenCalledTimes(1);

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should emit warning when embeddedOnly suppresses backend-linked plugins",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const backend = {
                workspace: vi.fn(() => ({
                    dashboards: vi.fn(() => ({
                        getDashboardWithReferences: vi.fn(async () => ({
                            dashboard: {},
                            references: {
                                plugins: [{ url: "https://example.test/plugin.js" }],
                            },
                        })),
                    })),
                })),
            } as unknown as DashboardLoaderBridgeProps["backend"];
            const props = createBridgeProps({
                backend,
                pluginMode: "embeddedOnly",
            });

            const rendered = await renderReact(createElement(DashboardLoaderBridge, props));
            await actAndFlush(undefined, 1);

            expect(props.onWarning).toHaveBeenCalledWith({
                phase: "pluginMode",
                ignoredSource: "backendPlugins",
                pluginMode: "embeddedOnly",
                dashboard: "dashboard-id",
                message: expect.stringContaining('pluginMode="embeddedOnly"'),
            });

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should not re-check backend-linked plugins when only onWarning callback identity changes",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const getDashboardWithReferences = vi.fn(async () => ({
                dashboard: {},
                references: {
                    plugins: [{ url: "https://example.test/plugin.js" }],
                },
            }));
            const backend = {
                workspace: vi.fn(() => ({
                    dashboards: vi.fn(() => ({
                        getDashboardWithReferences,
                    })),
                })),
            } as unknown as DashboardLoaderBridgeProps["backend"];
            const baseProps = createBridgeProps({
                backend,
                pluginMode: "embeddedOnly",
            });

            const rendered = await renderReact(createElement(DashboardLoaderBridge, baseProps));
            await actAndFlush(undefined, 1);

            expect(getDashboardWithReferences).toHaveBeenCalledTimes(1);

            await rendered.rerender(
                createElement(DashboardLoaderBridge, {
                    ...baseProps,
                    onWarning: vi.fn(),
                }),
            );
            await actAndFlush(undefined, 1);

            expect(getDashboardWithReferences).toHaveBeenCalledTimes(1);

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should not dispatch ready after the dashboard runtime unmounts before the ready microtask runs",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const props = createBridgeProps({
                pluginMode: "embeddedOnly",
            });
            const { runtime, loadStatus } = createDeferredLoaderStatus();
            useDashboardLoaderMock.mockReturnValue(loadStatus);

            const container = document.createElement("div");
            document.body.append(container);
            const root = createRoot(container);

            await act(async () => {
                root.render(createElement(DashboardLoaderBridge, props));
            });

            await act(async () => {
                runtime.onStateChange?.({}, dashboardDispatch);
                runtime.onEventingInitialized?.(registerEventHandler, unregisterEventHandler);
                root.unmount();
                await flushMicrotasks(1);
            });

            expect(props.onReady).not.toHaveBeenCalled();
            expect(props.onRuntimeDeactivated).toHaveBeenCalledTimes(1);

            container.remove();
        },
        timeout,
    );

    it(
        "should not re-emit the same runtime loader error on rerender",
        async () => {
            const { DashboardLoaderBridge } =
                await import("../visualizations/internal/DashboardLoaderBridge.js");
            const onError = vi.fn();
            const baseProps = createBridgeProps({
                pluginMode: "embeddedOnly",
                onError,
            });

            useDashboardLoaderMock.mockImplementation(() => ({
                status: "error",
                result: undefined,
                error: new Error("Loader failed"),
            }));

            const rendered = await renderReact(createElement(DashboardLoaderBridge, baseProps));
            await actAndFlush(undefined, 1);

            expect(onError).toHaveBeenCalledTimes(1);

            await rendered.rerender(
                createElement(DashboardLoaderBridge, {
                    ...baseProps,
                    config: {},
                }),
            );
            await actAndFlush(undefined, 1);

            expect(onError).toHaveBeenCalledTimes(1);

            await rendered.unmount();
        },
        timeout,
    );

    it(
        "should prefer property snapshots over bootstrap attributes for loader-backed dashboard props",
        async () => {
            const { setContext } = await import("../context.js");
            const { DashboardEmbed: DashboardElement } = await import("../visualizations/DashboardEmbed.js");

            const defaultBackend = dummyBackend();
            const propertyBackend = dummyBackend();

            setContext({ backend: defaultBackend, workspaceId: "default-workspace" });
            useDashboardLoaderMock.mockImplementation((options) => createSuccessfulLoaderStatus(options));

            const tagName = "test-gd-dashboard-props";
            customElements.define(tagName, DashboardElement);

            const element = document.createElement(tagName) as HTMLElement & {
                context?: unknown;
                config?: unknown;
                dashboard?: string;
                pluginMode?: "embeddedOnly";
            };

            element.setAttribute("dashboard", "attribute-dashboard");
            element.setAttribute("readonly", "");

            await actAndFlush(() => {
                document.body.append(element);
                element.context = { backend: propertyBackend, workspaceId: "property-workspace" };
                element.config = { isReadOnly: false, custom: "config" };
                element.dashboard = "property-dashboard";
                element.pluginMode = "embeddedOnly";
            });

            expect(useDashboardLoaderMock).toHaveBeenCalledWith({
                backend: propertyBackend,
                workspace: "property-workspace",
                dashboard: "property-dashboard",
                config: { isReadOnly: false, custom: "config" },
                loadingMode: "staticOnly",
            });
        },
        timeout,
    );

    it(
        "should emit gd-warning when disabled pluginMode suppresses extraPlugins",
        async () => {
            const { setContext } = await import("../context.js");
            const { DashboardEmbed: DashboardElement } = await import("../visualizations/DashboardEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });
            useDashboardLoaderMock.mockImplementation((options) => createSuccessfulLoaderStatus(options));

            const tagName = "test-gd-dashboard-warning";
            customElements.define(tagName, DashboardElement);

            const element = document.createElement(tagName) as HTMLElement & {
                dashboard?: string;
                pluginMode?: "disabled";
                extraPlugins?: unknown[];
            };
            const warnings: Array<{ pluginMode: string; ignoredSource: string; message: string }> = [];
            const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            element.addEventListener("gd-warning", (event) => {
                warnings.push(
                    (event as CustomEvent<{ pluginMode: string; ignoredSource: string; message: string }>)
                        .detail,
                );
            });

            try {
                await actAndFlush(() => {
                    document.body.append(element);
                    element.dashboard = "dashboard-id";
                    element.pluginMode = "disabled";
                    element.extraPlugins = [{ factory: vi.fn() }];
                });

                expect(warnings.at(-1)).toMatchObject({
                    pluginMode: "disabled",
                    ignoredSource: "extraPlugins",
                });
                expect(warnSpy).toHaveBeenCalledWith(
                    expect.stringContaining('pluginMode="disabled"'),
                    expect.objectContaining({
                        pluginMode: "disabled",
                        ignoredSource: "extraPlugins",
                    }),
                );
                expect(useDashboardLoaderMock.mock.lastCall?.[0]).toMatchObject({
                    dashboard: "dashboard-id",
                    loadingMode: "staticOnly",
                });
                expect(useDashboardLoaderMock.mock.lastCall?.[0]).not.toHaveProperty("extraPlugins");
            } finally {
                warnSpy.mockRestore();
            }
        },
        timeout,
    );

    it(
        "should forward dashboard runtime events through the loader-backed path",
        async () => {
            const { setContext } = await import("../context.js");
            const { DashboardEmbed: DashboardElement } = await import("../visualizations/DashboardEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });
            useDashboardLoaderMock.mockImplementation((options) => createSuccessfulLoaderStatus(options));

            const tagName = "test-gd-dashboard-events";
            customElements.define(tagName, DashboardElement);

            const element = document.createElement(tagName) as HTMLElement & {
                dashboard?: string;
                pluginMode?: "embeddedOnly";
            };
            const runtimeEvents: Array<Record<string, unknown>> = [];

            element.addEventListener("GDC.DASH/EVT.TEST", (event) => {
                runtimeEvents.push((event as CustomEvent<Record<string, unknown>>).detail);
            });

            await actAndFlush(() => {
                document.body.append(element);
                element.dashboard = "dashboard-id";
                element.pluginMode = "embeddedOnly";
            });

            const forwardedHandler = registerEventHandler.mock.calls.find(([handler]) =>
                (handler as { eval: (event: Record<string, unknown>) => boolean }).eval({
                    type: "GDC.DASH/EVT.TEST",
                    payload: {},
                }),
            )?.[0] as { handler: (event: Record<string, unknown>) => void } | undefined;

            expect(forwardedHandler).toBeDefined();

            forwardedHandler?.handler({
                type: "GDC.DASH/EVT.TEST",
                payload: { scope: "loader-backed" },
            });

            expect(runtimeEvents).toEqual([{ scope: "loader-backed" }]);
        },
        timeout,
    );

    it(
        "should unregister forwarded dashboard runtime events when the loader-backed dashboard disconnects",
        async () => {
            const { setContext } = await import("../context.js");
            const { DashboardEmbed: DashboardElement } = await import("../visualizations/DashboardEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });
            useDashboardLoaderMock.mockImplementation((options) => createSuccessfulLoaderStatus(options));

            const tagName = "test-gd-dashboard-event-cleanup";
            customElements.define(tagName, DashboardElement);

            const element = document.createElement(tagName) as HTMLElement & {
                dashboard?: string;
                pluginMode?: "embeddedOnly";
            };

            await actAndFlush(() => {
                document.body.append(element);
                element.dashboard = "dashboard-id";
                element.pluginMode = "embeddedOnly";
            });

            const forwardedHandler = registerEventHandler.mock.calls.find(([handler]) =>
                (handler as { eval: (event: Record<string, unknown>) => boolean }).eval({
                    type: "GDC.DASH/EVT.TEST",
                    payload: {},
                }),
            )?.[0];

            expect(forwardedHandler).toBeDefined();

            await actAndFlush(() => {
                element.remove();
            });

            expect(unregisterEventHandler).toHaveBeenCalledWith(forwardedHandler);
        },
        timeout,
    );

    it(
        "should only emit gd-ready once loader-backed command hooks are available",
        async () => {
            const { setContext } = await import("../context.js");
            const { DashboardEmbed: DashboardElement } = await import("../visualizations/DashboardEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });
            const deferred = createDeferredLoaderStatus();
            useDashboardLoaderMock.mockImplementation(() => deferred.loadStatus);

            const tagName = "test-gd-dashboard-ready";
            customElements.define(tagName, DashboardElement);

            const element = document.createElement(tagName) as HTMLElement & {
                dashboard?: string;
                pluginMode?: "embeddedOnly";
                refresh: () => Promise<void>;
            };
            const readyEvents: Event[] = [];

            element.addEventListener("gd-ready", (event) => {
                readyEvents.push(event);
            });

            await actAndFlush(() => {
                document.body.append(element);
                element.dashboard = "dashboard-id";
                element.pluginMode = "embeddedOnly";
            });

            expect(readyEvents).toHaveLength(0);
            await expect(element.refresh()).rejects.toThrow("Dashboard is not ready for commands yet.");

            await actAndFlush(() => {
                deferred.runtime.onStateChange?.({}, dashboardDispatch);
            }, 1);

            expect(readyEvents).toHaveLength(0);

            await actAndFlush(() => {
                deferred.runtime.onEventingInitialized?.(registerEventHandler, unregisterEventHandler);
            }, 1);

            expect(readyEvents).toHaveLength(1);
        },
        timeout,
    );

    it(
        "should dispatch refresh after loader-backed runtime becomes command-ready",
        async () => {
            const { setContext } = await import("../context.js");
            const { DashboardEmbed: DashboardElement } = await import("../visualizations/DashboardEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });
            const deferred = createDeferredLoaderStatus();
            useDashboardLoaderMock.mockImplementation(() => deferred.loadStatus);

            const tagName = "test-gd-dashboard-refresh-ready";
            customElements.define(tagName, DashboardElement);

            const element = document.createElement(tagName) as HTMLElement & {
                config?: unknown;
                dashboard?: string;
                pluginMode?: "embeddedOnly";
                refresh: () => Promise<void>;
            };

            await actAndFlush(() => {
                document.body.append(element);
                element.dashboard = "dashboard-id";
                element.config = { isReadOnly: true };
                element.pluginMode = "embeddedOnly";
            });

            await actAndFlush(() => {
                deferred.runtime.onEventingInitialized?.(registerEventHandler, unregisterEventHandler);
                deferred.runtime.onStateChange?.({}, dashboardDispatch);
            }, 1);

            const refreshPromise = element.refresh();
            await actAndFlush(undefined, 1);

            expect(initializeDashboard).toHaveBeenCalledWith(
                { isReadOnly: true },
                undefined,
                expect.any(String),
            );
            expect(dashboardDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "GDC.DASH/CMD.INITIALIZE",
                    correlationId: expect.any(String),
                }),
            );

            const handler = registerEventHandler.mock.lastCall?.[0] as {
                handler: (event: Record<string, unknown>) => void;
            };
            const command = dashboardDispatch.mock.lastCall?.[0] as { correlationId: string };

            handler.handler({
                type: "GDC.DASH/EVT.INITIALIZED",
                correlationId: command.correlationId,
                payload: {},
            });

            await expect(refreshPromise).resolves.toBeUndefined();
        },
        timeout,
    );

    it(
        "should dispatch replaceFilters after loader-backed runtime becomes command-ready",
        async () => {
            const { setContext } = await import("../context.js");
            const { DashboardEmbed: DashboardElement } = await import("../visualizations/DashboardEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });
            const deferred = createDeferredLoaderStatus();
            useDashboardLoaderMock.mockImplementation(() => deferred.loadStatus);

            const tagName = "test-gd-dashboard-filters-ready";
            customElements.define(tagName, DashboardElement);

            const element = document.createElement(tagName) as HTMLElement & {
                dashboard?: string;
                pluginMode?: "embeddedOnly";
                replaceFilters: (filters: unknown[]) => Promise<void>;
            };

            await actAndFlush(() => {
                document.body.append(element);
                element.dashboard = "dashboard-id";
                element.pluginMode = "embeddedOnly";
            });

            await actAndFlush(() => {
                deferred.runtime.onStateChange?.({}, dashboardDispatch);
                deferred.runtime.onEventingInitialized?.(registerEventHandler, unregisterEventHandler);
            }, 1);

            const filters = [{ filter: "snapshot" }];
            const replacePromise = element.replaceFilters(filters);
            await actAndFlush(undefined, 1);

            expect(changeFilterContextSelection).toHaveBeenCalledWith(filters, true, expect.any(String));
            expect(dashboardDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
                    correlationId: expect.any(String),
                }),
            );

            const handler = registerEventHandler.mock.lastCall?.[0] as {
                handler: (event: Record<string, unknown>) => void;
            };
            const command = dashboardDispatch.mock.lastCall?.[0] as { correlationId: string };

            handler.handler({
                type: "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
                correlationId: command.correlationId,
                payload: {},
            });

            await expect(replacePromise).resolves.toBeUndefined();
        },
        timeout,
    );

    it(
        "should reject commands after the loader-backed runtime becomes inactive",
        async () => {
            const { setContext } = await import("../context.js");
            const { DashboardEmbed: DashboardElement } = await import("../visualizations/DashboardEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });
            const deferred = createDeferredLoaderStatus();
            let loadStatus: DashboardLoadStatus = deferred.loadStatus;
            useDashboardLoaderMock.mockImplementation(() => loadStatus);

            const tagName = "test-gd-dashboard-runtime-reset";
            customElements.define(tagName, DashboardElement);

            const element = document.createElement(tagName) as HTMLElement & {
                config?: unknown;
                dashboard?: string;
                pluginMode?: "embeddedOnly";
                refresh: () => Promise<void>;
            };

            await actAndFlush(() => {
                document.body.append(element);
                element.dashboard = "dashboard-id";
                element.pluginMode = "embeddedOnly";
            });

            await actAndFlush(() => {
                deferred.runtime.onStateChange?.({}, dashboardDispatch);
                deferred.runtime.onEventingInitialized?.(registerEventHandler, unregisterEventHandler);
            }, 1);

            const forwardedHandler = registerEventHandler.mock.calls.find(([handler]) =>
                (handler as { eval: (event: Record<string, unknown>) => boolean }).eval({
                    type: "GDC.DASH/EVT.TEST",
                    payload: {},
                }),
            )?.[0];

            loadStatus = {
                status: "error",
                result: undefined,
                error: new Error("Loader failed"),
            };

            await actAndFlush(() => {
                element.config = { isReadOnly: true };
            }, 1);

            expect(unregisterEventHandler).toHaveBeenCalledWith(forwardedHandler);

            await actAndFlush(() => {
                deferred.runtime.onStateChange?.({}, dashboardDispatch);
                deferred.runtime.onEventingInitialized?.(registerEventHandler, unregisterEventHandler);
            }, 1);

            const dispatchCallsBeforeRefresh = dashboardDispatch.mock.calls.length;

            await expect(element.refresh()).rejects.toThrow();
            expect(dashboardDispatch).toHaveBeenCalledTimes(dispatchCallsBeforeRefresh);
        },
        timeout,
    );

    it(
        "should dispatch refresh through the dashboard command channel",
        async () => {
            const { setContext } = await import("../context.js");
            const { DashboardEmbed: DashboardElement } = await import("../visualizations/DashboardEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });
            useDashboardLoaderMock.mockImplementation((options) => createSuccessfulLoaderStatus(options));

            const tagName = "test-gd-dashboard-refresh";
            customElements.define(tagName, DashboardElement);

            const element = document.createElement(tagName) as HTMLElement & {
                config?: unknown;
                dashboard?: string;
                pluginMode?: "embeddedOnly";
                refresh: () => Promise<void>;
            };

            await actAndFlush(() => {
                document.body.append(element);
                element.dashboard = "dashboard-id";
                element.config = { isReadOnly: true };
                element.pluginMode = "embeddedOnly";
            });

            const refreshPromise = element.refresh();
            await actAndFlush(undefined, 1);

            expect(initializeDashboard).toHaveBeenCalledWith(
                { isReadOnly: true },
                undefined,
                expect.any(String),
            );
            expect(dashboardDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "GDC.DASH/CMD.INITIALIZE",
                    correlationId: expect.any(String),
                }),
            );

            const handler = registerEventHandler.mock.lastCall?.[0] as {
                handler: (event: Record<string, unknown>) => void;
            };
            const command = dashboardDispatch.mock.lastCall?.[0] as { correlationId: string };

            handler.handler({
                type: "GDC.DASH/EVT.INITIALIZED",
                correlationId: command.correlationId,
                payload: {},
            });

            await expect(refreshPromise).resolves.toBeUndefined();
            expect(unregisterEventHandler).toHaveBeenCalledWith(handler);
        },
        timeout,
    );

    it(
        "should reject failed replaceFilters commands and emit gd-error",
        async () => {
            const { setContext } = await import("../context.js");
            const { DashboardEmbed: DashboardElement } = await import("../visualizations/DashboardEmbed.js");

            setContext({ backend: dummyBackend(), workspaceId: "workspace" });
            useDashboardLoaderMock.mockImplementation((options) => createSuccessfulLoaderStatus(options));

            const tagName = "test-gd-dashboard-filters";
            customElements.define(tagName, DashboardElement);

            const element = document.createElement(tagName) as HTMLElement & {
                dashboard?: string;
                pluginMode?: "embeddedOnly";
                replaceFilters: (filters: unknown[]) => Promise<void>;
            };

            const gdErrors: Array<{ phase: string; command?: string; message: string }> = [];
            element.addEventListener("gd-error", (event) => {
                gdErrors.push(
                    (event as CustomEvent<{ phase: string; command?: string; message: string }>).detail,
                );
            });

            await actAndFlush(() => {
                document.body.append(element);
                element.dashboard = "dashboard-id";
                element.pluginMode = "embeddedOnly";
            });

            const filters = [{ filter: "snapshot" }];
            const replacePromise = element.replaceFilters(filters);
            await actAndFlush(undefined, 1);

            expect(changeFilterContextSelection).toHaveBeenCalledWith(filters, true, expect.any(String));
            expect(dashboardDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
                    correlationId: expect.any(String),
                }),
            );

            const handler = registerEventHandler.mock.lastCall?.[0] as {
                handler: (event: Record<string, unknown>) => void;
            };
            const command = dashboardDispatch.mock.lastCall?.[0] as { correlationId: string };
            const commandError = new Error("Filter command failed");

            handler.handler({
                type: "GDC.DASH/EVT.COMMAND.FAILED",
                correlationId: command.correlationId,
                payload: {
                    message: "Filter command failed",
                    error: commandError,
                },
            });

            await expect(replacePromise).rejects.toThrow("Filter command failed");
            expect(gdErrors.at(-1)).toMatchObject({
                phase: "replaceFilters",
                command: "replaceFilters",
                message: "Filter command failed",
            });
        },
        timeout,
    );
});
