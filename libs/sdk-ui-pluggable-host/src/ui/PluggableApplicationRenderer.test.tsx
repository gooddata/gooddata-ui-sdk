// (C) 2026 GoodData Corporation

import { type ComponentProps, type ReactElement } from "react";

import { act, render } from "@testing-library/react";
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type ILocalPluggableApplicationRegistryItemV1,
    type PluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import {
    type IAiAssistantChatEvent,
    type IHostNavigationRequest,
    type IPlatformContext,
    type IPluggableApp,
    type IPluggableAppEvent,
    type IPluggableApplicationMountHandle,
    aiAssistantContextChanged,
    aiAssistantEventSent,
    aiAssistantPublisherDocumentSaved,
    openAiAssistantRequested,
    openPricingDialogRequested,
} from "@gooddata/sdk-pluggable-application-model";

import { type AppSecurityFailure } from "../loader/appSecurityValidation.js";
import { type IAppLifecycleCallbacks } from "../types/lifecycle.js";

const mocks = vi.hoisted(() => ({
    loadPluggableApplication: vi.fn<(app: PluggableApplicationRegistryItem) => Promise<IPluggableApp>>(),
    getAppLifecycleCallbacks: vi.fn<() => IAppLifecycleCallbacks | undefined>(),
    validateAppSecurity:
        vi.fn<
            (
                app: PluggableApplicationRegistryItem,
                loadedApp: IPluggableApp,
                ctx: IPlatformContext,
            ) => AppSecurityFailure | undefined
        >(),
    getSecuredRemoteAppValidUntil:
        vi.fn<(app: PluggableApplicationRegistryItem, loadedApp: IPluggableApp) => number | undefined>(),
    registerAppStylesheetScope: vi.fn<(appId: string, remoteEntryUrl: string) => void>(),
    activateAppStylesheets: vi.fn<(appId: string) => void>(),
    deactivateAppStylesheets: vi.fn<(appId: string) => void>(),
    resetStylesheetRegistry: vi.fn<() => void>(),
}));

vi.mock("../loader/pluggableApplicationsLoader.js", () => ({
    loadPluggableApplication: mocks.loadPluggableApplication,
    getAppLifecycleCallbacks: mocks.getAppLifecycleCallbacks,
    getHostTelemetryServices: () => undefined,
}));

vi.mock("../loader/appSecurityValidation.js", () => ({
    validateAppSecurity: mocks.validateAppSecurity,
    getSecuredRemoteAppValidUntil: mocks.getSecuredRemoteAppValidUntil,
}));

vi.mock("../lib/stylesheetRegistry.js", () => ({
    registerAppStylesheetScope: mocks.registerAppStylesheetScope,
    activateAppStylesheets: mocks.activateAppStylesheets,
    deactivateAppStylesheets: mocks.deactivateAppStylesheets,
    resetStylesheetRegistry: mocks.resetStylesheetRegistry,
}));

type NavigationGuard = (request: IHostNavigationRequest) => boolean;
type NavigationGuardRef = { current: NavigationGuard | undefined };

const userSettings = {} as IPlatformContext["userSettings"];

function context(): IPlatformContext {
    return {
        version: "1.0",
        embeddingMode: "none",
        auth: { type: "contextDeferred" },
        user: { login: "john.doe" } as IPlatformContext["user"],
        userSettings,
        settings: userSettings,
        whiteLabeling: undefined,
        organization: { id: "org1", title: "Acme Corp" },
        preferredLocale: "en-US",
    };
}

const app: ILocalPluggableApplicationRegistryItemV1 = {
    apiVersion: "1.0",
    id: "gdc-analytical-designer",
    title: "Analytical Designer",
    applicationScope: "workspace",
    menuOrder: 10,
    local: { routeBase: "/analyze" },
};

const catalogApp: ILocalPluggableApplicationRegistryItemV1 = {
    apiVersion: "1.0",
    id: "gdc-catalog",
    title: "Catalog",
    applicationScope: "workspace",
    menuOrder: 20,
    local: { routeBase: "/catalog" },
};

const WS1_PATHNAME = "/workspace/ws1/analyze";
const WS2_PATHNAME = "/workspace/ws2/analyze";

// The components are also imported by HostUiContainer, so with isolation off a test file that rendered
// the host container earlier left them cached — wired to the *real* loader and security validation
// rather than the mocks above. Dropping the cached graph re-imports them through the mocks.
//
// This runs while the file is still being imported, not from a `beforeAll`: loading this graph for the
// first time in a worker costs seconds (the intl/ui-kit/gen-ai dependencies behind the renderer), and
// on a loaded CI machine that overran the 10s `hookTimeout`. Module loading has no such budget. The
// reset itself is cheap — only this package's own modules are re-evaluated, its dependencies stay
// cached by Node — so there is nothing left to move off the import path.
vi.resetModules();
const { HostIntlProvider } = await import("./HostIntlProvider.js");
const { PluggableApplicationRenderer } = await import("./PluggableApplicationRenderer.js");

type AiAssistantAppEvent = Parameters<
    NonNullable<ComponentProps<typeof PluggableApplicationRenderer>["onAiAssistantAppEvent"]>
>[0];

type AiAssistantContext = Parameters<
    NonNullable<ComponentProps<typeof PluggableApplicationRenderer>["onAiAssistantContext"]>
>[0];

function renderer(options: {
    pathname: string;
    ctx: IPlatformContext;
    navigationRequestRef: NavigationGuardRef;
    app?: PluggableApplicationRegistryItem;
    onOpenAiAssistant?: ComponentProps<typeof PluggableApplicationRenderer>["onOpenAiAssistant"];
    onAiAssistantContext?: ComponentProps<typeof PluggableApplicationRenderer>["onAiAssistantContext"];
    onAiAssistantAppEvent?: ComponentProps<typeof PluggableApplicationRenderer>["onAiAssistantAppEvent"];
    onOpenPricingDialog?: () => void;
    aiEventReceiveRef?: ComponentProps<typeof PluggableApplicationRenderer>["aiEventReceiveRef"];
}): ReactElement {
    return (
        <HostIntlProvider locale="en-US">
            <PluggableApplicationRenderer
                app={options.app ?? app}
                ctx={options.ctx}
                pathname={options.pathname}
                navigationRequestRef={options.navigationRequestRef}
                onOpenAiAssistant={options.onOpenAiAssistant}
                onAiAssistantContext={options.onAiAssistantContext}
                onAiAssistantAppEvent={options.onAiAssistantAppEvent}
                onOpenPricingDialog={options.onOpenPricingDialog}
                aiEventReceiveRef={options.aiEventReceiveRef}
            />
        </HostIntlProvider>
    );
}

function activeAppAttribute(): string | null {
    return document.documentElement.getAttribute("data-activeApp");
}

// The mount effect awaits the app load, so the guard is registered a microtask after render.
async function flushMount(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
    });
}

describe("PluggableApplicationRenderer", () => {
    let onHostNavigationRequested: Mock<NavigationGuard>;
    let navigationRequestRef: NavigationGuardRef;

    beforeEach(() => {
        vi.clearAllMocks();

        navigationRequestRef = { current: undefined };
        mocks.validateAppSecurity.mockReturnValue(undefined);
        mocks.getSecuredRemoteAppValidUntil.mockReturnValue(undefined);
        mocks.getAppLifecycleCallbacks.mockReturnValue(undefined);
        onHostNavigationRequested = vi.fn<NavigationGuard>().mockReturnValue(true);
        mocks.loadPluggableApplication.mockResolvedValue({
            mount: (): IPluggableApplicationMountHandle => ({
                unmount: vi.fn(),
                onHostNavigationRequested,
            }),
        });
    });

    // A console spy must be undone even when the assertions after it fail.
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("asks the mounted application whether the host may navigate away", async () => {
        render(renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }));
        await flushMount();

        const request: IHostNavigationRequest = { url: WS2_PATHNAME, proceed: vi.fn() };

        expect(navigationRequestRef.current?.(request)).toBe(true);
        expect(onHostNavigationRequested).toHaveBeenCalledWith(request);
    });

    it("forwards the conversation ID as the final open-assistant argument", async () => {
        const emitted: { onEvent?: (event: IPluggableAppEvent) => void } = {};
        mocks.loadPluggableApplication.mockResolvedValue({
            mount: (options): IPluggableApplicationMountHandle => {
                emitted.onEvent = options.onEvent;
                return { unmount: vi.fn(), onHostNavigationRequested };
            },
        });
        const onOpenAiAssistant = vi.fn();
        render(renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef, onOpenAiAssistant }));
        await flushMount();
        const payload = {
            question: "Summarize",
            agentId: "agent-1",
            userContext: { view: { publisherDocument: { title: "Draft" } } },
            appendToChat: true,
            replaceUserContext: true,
            effort: "HIGH" as const,
            conversationId: "conversation-1",
        };

        emitted.onEvent?.(openAiAssistantRequested(payload));

        expect(onOpenAiAssistant).toHaveBeenCalledExactlyOnceWith(
            payload.question,
            payload.agentId,
            payload.userContext,
            payload.appendToChat,
            payload.replaceUserContext,
            payload.effort,
            payload.conversationId,
        );
    });

    it("forwards a pricing dialog open request to the host", async () => {
        const emitted: { onEvent?: (event: IPluggableAppEvent) => void } = {};
        mocks.loadPluggableApplication.mockResolvedValue({
            mount: (options): IPluggableApplicationMountHandle => {
                emitted.onEvent = options.onEvent;
                return { unmount: vi.fn(), onHostNavigationRequested };
            },
        });
        const onOpenPricingDialog = vi.fn();
        render(
            renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef, onOpenPricingDialog }),
        );
        await flushMount();

        emitted.onEvent?.(openPricingDialogRequested());

        expect(onOpenPricingDialog).toHaveBeenCalledOnce();
    });

    it("forwards every AI assistant context field unchanged", async () => {
        const emitted: { onEvent?: (event: IPluggableAppEvent) => void } = {};
        mocks.loadPluggableApplication.mockResolvedValue({
            mount: (options): IPluggableApplicationMountHandle => {
                emitted.onEvent = options.onEvent;
                return { unmount: vi.fn(), onHostNavigationRequested };
            },
        });
        const onAiAssistantContext = vi.fn<(context: AiAssistantContext) => void>();
        const payload: AiAssistantContext = {
            includeTags: ["included"],
            excludeTags: ["excluded"],
            dialogPosition: "right",
            embedded: true,
            disabled: false,
            userContext: { view: { publisherDocument: { title: "Draft" } } },
            userContextLoading: true,
        };
        render(
            renderer({
                pathname: WS1_PATHNAME,
                ctx: context(),
                navigationRequestRef,
                onAiAssistantContext,
            }),
        );
        await flushMount();

        emitted.onEvent?.(aiAssistantContextChanged(payload));

        expect(onAiAssistantContext).toHaveBeenCalledExactlyOnceWith(payload);
    });

    describe("chat events during application startup", () => {
        let aiEventReceiveRef: { current: ((event: IAiAssistantChatEvent) => void) | undefined };
        let onAiAssistantEventReceive: Mock<(event: IAiAssistantChatEvent) => void>;

        const event = (index: number): IAiAssistantChatEvent => ({
            name: "chat.something-new",
            payload: { index },
        });
        const pendingLoad = () => {
            let resolve!: (application: IPluggableApp) => void;
            let reject!: (error: Error) => void;
            const promise = new Promise<IPluggableApp>((resolvePromise, rejectPromise) => {
                resolve = resolvePromise;
                reject = rejectPromise;
            });
            mocks.loadPluggableApplication.mockReturnValueOnce(promise);
            return { resolve, reject };
        };
        const renderEvents = (pathname = WS1_PATHNAME, application: PluggableApplicationRegistryItem = app) =>
            renderer({ pathname, ctx: context(), navigationRequestRef, aiEventReceiveRef, app: application });

        beforeEach(() => {
            aiEventReceiveRef = { current: undefined };
            onAiAssistantEventReceive = vi.fn();
            mocks.loadPluggableApplication.mockResolvedValue({
                mount: () => ({ unmount: vi.fn(), onAiAssistantEventReceive }),
            });
        });

        it("replays opaque events in order only after mount returns, then forwards live events once", async () => {
            const load = pendingLoad();
            const definition: IAiAssistantChatEvent = {
                name: "chat.definition-received",
                payload: { definitionType: "dashboard", content: { title: "Draft" } },
            };
            const duringMount = event(2);
            const live = event(3);
            const { rerender } = render(renderEvents());

            aiEventReceiveRef.current?.(definition);
            expect(onAiAssistantEventReceive).not.toHaveBeenCalled();

            load.resolve({
                mount: () => {
                    aiEventReceiveRef.current?.(duringMount);
                    expect(onAiAssistantEventReceive).not.toHaveBeenCalled();
                    return { unmount: vi.fn(), onAiAssistantEventReceive };
                },
            });
            await flushMount();
            aiEventReceiveRef.current?.(live);
            rerender(renderEvents());
            await flushMount();

            expect(onAiAssistantEventReceive.mock.calls).toEqual([[definition], [duringMount], [live]]);
            expect(onAiAssistantEventReceive.mock.calls[0]?.[0]).toBe(definition);
        });

        it("keeps events received during replay behind events already queued", async () => {
            const load = pendingLoad();
            render(renderEvents());
            aiEventReceiveRef.current?.(event(1));
            aiEventReceiveRef.current?.(event(2));
            onAiAssistantEventReceive.mockImplementationOnce(() => aiEventReceiveRef.current?.(event(3)));

            load.resolve({ mount: () => ({ unmount: vi.fn(), onAiAssistantEventReceive }) });
            await flushMount();

            expect(onAiAssistantEventReceive.mock.calls).toEqual([[event(1)], [event(2)], [event(3)]]);
        });

        it("reports each replay failure and drains queued and reentrant events without failing mount", async () => {
            const load = pendingLoad();
            const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
            const lifecycle = {
                onLoadFailed: vi.fn(),
                onMountCompleted: vi.fn(),
                onRendered: vi.fn(),
            };
            mocks.getAppLifecycleCallbacks.mockReturnValue(lifecycle);
            render(renderEvents());
            const delegate = aiEventReceiveRef.current;
            delegate?.(event(1));
            delegate?.(event(2));
            const firstError = new Error("First event failed");
            const secondError = "Second event failed";
            onAiAssistantEventReceive
                .mockImplementationOnce(() => {
                    delegate?.(event(3));
                    throw firstError;
                })
                .mockImplementationOnce(() => {
                    throw secondError;
                });

            load.resolve({ mount: () => ({ unmount: vi.fn(), onAiAssistantEventReceive }) });
            await flushMount();
            aiEventReceiveRef.current?.(event(4));

            expect(onAiAssistantEventReceive.mock.calls).toEqual([
                [event(1)],
                [event(2)],
                [event(3)],
                [event(4)],
            ]);
            expect(consoleError.mock.calls).toEqual([
                [
                    `[host-runtime/renderer] Failed to replay AI assistant event for app "${app.id}".`,
                    firstError,
                ],
                [
                    `[host-runtime/renderer] Failed to replay AI assistant event for app "${app.id}".`,
                    secondError,
                ],
            ]);
            expect(lifecycle.onLoadFailed).not.toHaveBeenCalled();
            expect(lifecycle.onMountCompleted).toHaveBeenCalledOnce();
            expect(lifecycle.onRendered).toHaveBeenCalledOnce();
            expect(mocks.deactivateAppStylesheets).not.toHaveBeenCalled();
            expect(aiEventReceiveRef.current).toBe(delegate);
        });

        it("replays all startup events in arrival order", async () => {
            const load = pendingLoad();
            render(renderEvents());
            const events = Array.from({ length: 35 }, (_, index) => event(index));
            events.forEach((value) => aiEventReceiveRef.current?.(value));

            load.resolve({ mount: () => ({ unmount: vi.fn(), onAiAssistantEventReceive }) });
            await flushMount();

            expect(onAiAssistantEventReceive.mock.calls).toEqual(events.map((value) => [value]));
            expect(onAiAssistantEventReceive.mock.calls[0]?.[0]).toBe(events[0]);
        });

        it.each([
            { pathname: WS2_PATHNAME, application: app },
            { pathname: "/workspace/ws1/catalog", application: catalogApp },
        ])("discards prior startup events on navigation to $pathname", async ({ pathname, application }) => {
            const oldLoad = pendingLoad();
            const { rerender } = render(renderEvents());
            const oldDelegate = aiEventReceiveRef.current;
            aiEventReceiveRef.current?.(event(1));

            const newLoad = pendingLoad();
            rerender(renderEvents(pathname, application));
            oldDelegate?.(event(2));
            aiEventReceiveRef.current?.(event(3));
            const oldMount = vi.fn(() => ({ unmount: vi.fn(), onAiAssistantEventReceive }));
            oldLoad.resolve({ mount: oldMount });
            newLoad.resolve({ mount: () => ({ unmount: vi.fn(), onAiAssistantEventReceive }) });
            await flushMount();

            expect(oldMount).not.toHaveBeenCalled();
            expect(onAiAssistantEventReceive.mock.calls).toEqual([[event(3)]]);
            oldDelegate?.(event(4));
            expect(onAiAssistantEventReceive).toHaveBeenCalledOnce();
        });

        it("clears the delegate and pending events on unmount", async () => {
            const load = pendingLoad();
            const { unmount } = render(renderEvents());
            const delegate = aiEventReceiveRef.current;
            aiEventReceiveRef.current?.(event(1));

            unmount();
            delegate?.(event(2));
            const mount = vi.fn(() => ({ unmount: vi.fn(), onAiAssistantEventReceive }));
            load.resolve({ mount });
            await flushMount();

            expect(aiEventReceiveRef.current).toBeUndefined();
            expect(mount).not.toHaveBeenCalled();
            expect(onAiAssistantEventReceive).not.toHaveBeenCalled();
        });

        it.each(["load", "security", "mount"])("discards events after a %s failure", async (failure) => {
            const load = pendingLoad();
            vi.spyOn(console, "error").mockImplementation(() => undefined);
            render(renderEvents());
            aiEventReceiveRef.current?.(event(1));
            if (failure === "load") {
                load.reject(new Error("load failed"));
            } else {
                if (failure === "security") {
                    mocks.validateAppSecurity.mockReturnValue({ kind: "organization-not-allowed" });
                }
                load.resolve({
                    mount: () => {
                        throw new Error("mount failed");
                    },
                });
            }
            await flushMount();

            expect(aiEventReceiveRef.current).toBeUndefined();
            expect(onAiAssistantEventReceive).not.toHaveBeenCalled();
        });

        it("does not retain events for an application without a chat receiver", async () => {
            const load = pendingLoad();
            const { rerender } = render(renderEvents());
            aiEventReceiveRef.current?.(event(1));
            load.resolve({ mount: () => ({ unmount: vi.fn() }) });
            await flushMount();
            aiEventReceiveRef.current?.(event(2));

            rerender(renderEvents(WS2_PATHNAME));
            aiEventReceiveRef.current?.(event(3));
            await flushMount();

            expect(onAiAssistantEventReceive.mock.calls).toEqual([[event(3)]]);
        });
    });

    describe("a document the application saved", () => {
        const payload = {
            conversationId: "c1",
            itemId: "i1",
            documentRef: "report_1",
            savedDocumentId: "r1",
        };
        const mountEmitting = () => {
            const emitted: { onEvent?: (event: IPluggableAppEvent) => void } = {};
            mocks.loadPluggableApplication.mockResolvedValue({
                mount: (options): IPluggableApplicationMountHandle => {
                    emitted.onEvent = options.onEvent;
                    return { unmount: vi.fn(), onHostNavigationRequested };
                },
            });
            return emitted;
        };

        it("is handed to the host chat as sent", async () => {
            const emitted = mountEmitting();
            const onAiAssistantAppEvent = vi.fn<(event: AiAssistantAppEvent) => void>();
            render(
                renderer({
                    pathname: WS1_PATHNAME,
                    ctx: context(),
                    navigationRequestRef,
                    onAiAssistantAppEvent,
                }),
            );
            await flushMount();

            emitted.onEvent?.(aiAssistantPublisherDocumentSaved(payload));

            expect(onAiAssistantAppEvent).toHaveBeenCalledExactlyOnceWith({
                name: "app.publisher-document-saved",
                payload: {
                    conversationId: "c1",
                    itemId: "i1",
                    documentRef: "report_1",
                    savedDocumentId: "r1",
                },
            });
        });

        it("is handed to the host chat even when the host does not know it", async () => {
            const emitted = mountEmitting();
            const onAiAssistantAppEvent = vi.fn<(event: AiAssistantAppEvent) => void>();
            render(
                renderer({
                    pathname: WS1_PATHNAME,
                    ctx: context(),
                    navigationRequestRef,
                    onAiAssistantAppEvent,
                }),
            );
            await flushMount();

            emitted.onEvent?.(aiAssistantEventSent({ name: "app.something-new", payload: { any: 1 } }));

            expect(onAiAssistantAppEvent).toHaveBeenCalledExactlyOnceWith({
                name: "app.something-new",
                payload: { any: 1 },
            });
        });

        it("is ignored when its envelope is malformed", async () => {
            const emitted = mountEmitting();
            const onAiAssistantAppEvent = vi.fn<(event: AiAssistantAppEvent) => void>();
            render(
                renderer({
                    pathname: WS1_PATHNAME,
                    ctx: context(),
                    navigationRequestRef,
                    onAiAssistantAppEvent,
                }),
            );
            await flushMount();

            emitted.onEvent?.({
                type: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.EVENT_SENT",
                payload: { name: 1 },
            } as unknown as IPluggableAppEvent);

            expect(onAiAssistantAppEvent).not.toHaveBeenCalled();
        });
    });

    it("registers a new guard when the application remounts", async () => {
        const { rerender } = render(
            renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }),
        );
        await flushMount();
        const firstGuard = navigationRequestRef.current;
        expect(firstGuard).toBeDefined();

        // A workspace switch changes the base path, remounting inside the same renderer instance.
        rerender(renderer({ pathname: WS2_PATHNAME, ctx: context(), navigationRequestRef }));
        await flushMount();

        expect(navigationRequestRef.current).toBeDefined();
        expect(navigationRequestRef.current).not.toBe(firstGuard);
    });

    it("leaves no guard registered once the application is gone", async () => {
        const { unmount } = render(
            renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }),
        );
        await flushMount();
        expect(navigationRequestRef.current).toBeDefined();

        unmount();

        expect(navigationRequestRef.current).toBeUndefined();
    });

    it("leaves no guard registered when the application fails after it was mounted", async () => {
        let guardWhenFailed: NavigationGuard | undefined;
        // Held in one object so the renderer's lifecycle dependency stays referentially stable.
        const lifecycle: IAppLifecycleCallbacks = {
            onRendered: () => {
                guardWhenFailed = navigationRequestRef.current;
                throw new Error("lifecycle callback failed");
            },
        };
        mocks.getAppLifecycleCallbacks.mockReturnValue(lifecycle);
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

        render(renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }));
        await flushMount();

        expect(guardWhenFailed).toBeDefined();
        expect(navigationRequestRef.current).toBeUndefined();
        expect(consoleError).toHaveBeenCalledOnce();
    });

    it("leaves no guard registered when a context change unmounts the application as insecure", async () => {
        const { rerender } = render(
            renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }),
        );
        await flushMount();
        expect(navigationRequestRef.current).toBeDefined();

        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
        mocks.validateAppSecurity.mockReturnValue({ kind: "organization-not-allowed" });
        rerender(renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }));
        await flushMount();

        expect(navigationRequestRef.current).toBeUndefined();
        expect(consoleError).toHaveBeenCalledOnce();
    });

    describe("data-activeApp", () => {
        // The document is shared with every other test file in the worker.
        afterEach(() => {
            document.documentElement.removeAttribute("data-activeApp");
        });

        // The write happens on render, not on load, so assert before the load resolves — then
        // drain it inside `act`.
        it("names the application on the document element as soon as it renders", async () => {
            render(renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }));

            expect(activeAppAttribute()).toBe(app.id);

            await flushMount();
        });

        it("names the newly rendered application after a switch", async () => {
            const { rerender } = render(
                renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }),
            );
            await flushMount();

            rerender(
                renderer({
                    pathname: "/workspace/ws1/catalog",
                    ctx: context(),
                    navigationRequestRef,
                    app: catalogApp,
                }),
            );
            await flushMount();

            expect(activeAppAttribute()).toBe(catalogApp.id);
        });

        it("clears the attribute once the application is gone", async () => {
            const { unmount } = render(
                renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }),
            );
            await flushMount();
            expect(activeAppAttribute()).toBe(app.id);

            unmount();

            expect(activeAppAttribute()).toBeNull();
        });
    });

    describe("stylesheet lifecycle", () => {
        it("enables the application's stylesheets while it is mounted and disables them once it is gone", async () => {
            const { unmount } = render(
                renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }),
            );
            expect(mocks.activateAppStylesheets).toHaveBeenCalledWith(app.id);
            await flushMount();
            expect(mocks.deactivateAppStylesheets).not.toHaveBeenCalled();

            unmount();

            expect(mocks.deactivateAppStylesheets).toHaveBeenCalledWith(app.id);
        });

        it("disables the stylesheets of an application the security check refuses to mount", async () => {
            mocks.validateAppSecurity.mockReturnValue({ kind: "organization-not-allowed" });
            const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

            render(renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }));
            await flushMount();

            expect(mocks.deactivateAppStylesheets).toHaveBeenCalledWith(app.id);
            expect(consoleError).toHaveBeenCalledOnce();
        });

        it("disables the stylesheets of an application that fails to load", async () => {
            mocks.loadPluggableApplication.mockRejectedValue(new Error("remote entry unreachable"));
            const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

            render(renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }));
            await flushMount();

            expect(mocks.deactivateAppStylesheets).toHaveBeenCalledWith(app.id);
            expect(consoleError).toHaveBeenCalledOnce();
        });

        it("disables the stylesheets of an application evicted by a security re-check after a context change", async () => {
            const { rerender } = render(
                renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }),
            );
            await flushMount();
            expect(mocks.deactivateAppStylesheets).not.toHaveBeenCalled();

            const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
            mocks.validateAppSecurity.mockReturnValue({ kind: "organization-not-allowed" });
            rerender(renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }));
            await flushMount();

            expect(mocks.deactivateAppStylesheets).toHaveBeenCalledWith(app.id);
            expect(consoleError).toHaveBeenCalledOnce();
        });
    });
});
