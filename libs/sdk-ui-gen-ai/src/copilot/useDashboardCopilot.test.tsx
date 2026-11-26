// (C) 2026 GoodData Corporation

import { StrictMode } from "react";

import { act, renderHook } from "@testing-library/react";
import { type Mock, describe, expect, it, vi } from "vitest";

import { type IDashboard, type IInsight, idRef } from "@gooddata/sdk-model";
import {
    type DashboardDispatch,
    type DashboardEvents,
    type DashboardState,
    anyDashboardEventHandler,
    changeDashboardDefinition,
    selectDashboardId,
} from "@gooddata/sdk-ui-dashboard";

import { type GenAIAssistantProps } from "../components/GenAIChat.js";
import {
    type ChatClarificationQuestionsEvent,
    type ChatDefinitionReceivedEvent,
    type ChatEvent,
} from "../store/events.js";
import {
    activateConversationAction,
    dashboardSavedAction,
    startNewConversationAction,
} from "../store/messages/messagesSlice.js";

import { CopilotBuildType } from "./types.js";
import { useDashboardCopilot } from "./useDashboardCopilot.js";

const dashboard: IDashboard = {
    type: "IDashboard",
    identifier: "dashboard",
    ref: idRef("dashboard", "analyticalDashboard"),
    uri: "/dashboard",
    title: "Dashboard",
    description: "",
    created: "2026-01-01",
    updated: "2026-01-01",
    shareStatus: "private",
};
const definition: ChatDefinitionReceivedEvent = {
    type: "onDefinitionReceived",
    definitionType: "dashboard",
    itemId: "item",
    conversationId: "local",
    threadId: "thread",
    dashboard,
};

function dashboardState(isEditing = true, persistedDashboard: IDashboard | undefined = dashboard) {
    return {
        meta: { persistedDashboard },
        renderMode: { renderMode: isEditing ? "edit" : "view" },
        loading: { loading: false, result: true },
    } as DashboardState;
}

function emptyDashboardState(isEditing = true) {
    const state = dashboardState(isEditing);
    state.meta.persistedDashboard = undefined;
    return state;
}

const dashboardTarget = { type: CopilotBuildType.Dashboard, objectId: "dashboard" };
const userMessage: ChatEvent = {
    type: "chatUserMessage",
    conversationId: "local",
    threadId: "thread",
    question: "Edit",
    objects: [],
};
const clarification: ChatClarificationQuestionsEvent = {
    type: "chatClarificationQuestions",
    threadId: "thread",
    interactionId: "question",
    questions: [{ text: "Which metric?", control: { type: "singleChoice", options: [{ text: "Revenue" }] } }],
};

function setup(state = dashboardState()) {
    const hook = renderHook(() => useDashboardCopilot());
    const dispatch = vi.fn<DashboardDispatch>() as Mock<DashboardDispatch> & DashboardDispatch;
    const chatDispatch = vi.fn();
    act(() => {
        hook.result.current.genAiStoreProps().onDispatcher!(chatDispatch);
        hook.result.current.dashboardProps().onStateChange!(state, dispatch);
    });
    const chatEvent = (event: ChatEvent) =>
        act(() => {
            hook.result.current.genAiStoreProps().eventHandlers![0].handler(event);
        });
    const dashboardEvent = (event: Partial<DashboardEvents>) =>
        act(() => {
            hook.result.current
                .dashboardProps()
                .eventHandlers![0].handler(event as DashboardEvents, dispatch, (selector) => selector(state));
        });
    const apply = () => {
        chatEvent(definition);
        return dispatch.mock.calls.at(-1)![0]["correlationId"] as string;
    };
    return { ...hook, dispatch, chatDispatch, chatEvent, dashboardEvent, apply };
}

describe("useDashboardCopilot", () => {
    it("keeps callbacks stable and supplies the latest dashboard context", () => {
        const { result, rerender, dispatch } = setup();
        const initial = result.current;
        expect(initial.assistantProps().dashboardSelector!(selectDashboardId)).toBe("dashboard");
        expect(initial.copilot.getSnapshot().context).toEqual({
            type: CopilotBuildType.Dashboard,
            objectId: "dashboard",
            isEditing: true,
        });
        rerender();
        expect(result.current.copilot).toBe(initial.copilot);
        expect(result.current.genAiStoreProps).toBe(initial.genAiStoreProps);
        expect(result.current.dashboardProps).toBe(initial.dashboardProps);
        expect(result.current.assistantProps).toBe(initial.assistantProps);
        expect(result.current.genAiStoreProps().eventHandlers).toBe(initial.genAiStoreProps().eventHandlers);
        expect(result.current.genAiStoreProps().onDispatcher).toBe(initial.genAiStoreProps().onDispatcher);
        expect(result.current.dashboardProps().eventHandlers).toBe(initial.dashboardProps().eventHandlers);
        expect(result.current.dashboardProps().onStateChange).toBe(initial.dashboardProps().onStateChange);

        act(() => result.current.dashboardProps().onStateChange!(dashboardState(false), dispatch));
        expect(result.current.copilot.getSnapshot().context.isEditing).toBe(false);
        expect(result.current.assistantProps().dashboardSelector).not.toBe(
            initial.assistantProps().dashboardSelector,
        );
    });

    it("supplies default assistant props before the dashboard is ready", () => {
        const { result } = renderHook(() => useDashboardCopilot());
        expect(result.current.assistantProps()).toEqual({ dashboardSelector: null });
    });

    it("passes through assistant customizations without mutating inputs or replacing its dashboard context", () => {
        const { result, dispatch, dashboardEvent } = setup();
        const dashboardSelector = vi.fn(() => {
            throw new Error("Custom selector must not replace the dashboard connection");
        });
        const props: GenAIAssistantProps = {
            locale: "en-US",
            className: "custom-assistant",
            mode: "docked",
            inputPlaceholder: "Ask about this dashboard",
            slots: { Disclaimer: () => null },
            onLinkClick: vi.fn(),
            onModeChange: vi.fn(),
            onDispatcher: vi.fn(),
            dashboardSelector,
        };
        const initialSelector = result.current.assistantProps().dashboardSelector;
        const customized = result.current.assistantProps(props);
        expect(customized).toEqual({ ...props, dashboardSelector: initialSelector });
        expect(customized.slots).toBe(props.slots);
        expect(customized.dashboardSelector!(selectDashboardId)).toBe("dashboard");
        expect(result.current.assistantProps({ dashboardSelector: null }).dashboardSelector).toBe(
            initialSelector,
        );
        act(() => result.current.dashboardProps().onStateChange!(dashboardState(false), dispatch));
        expect(result.current.assistantProps(props).dashboardSelector).toBe(
            result.current.assistantProps().dashboardSelector,
        );
        expect(result.current.assistantProps(props).dashboardSelector).not.toBe(initialSelector);
        dashboardEvent({ type: "GDC.DASH/EVT.DEINITIALIZED" });
        expect(result.current.assistantProps(props).dashboardSelector).toBeNull();
        expect(props.dashboardSelector).toBe(dashboardSelector);
        expect(dashboardSelector).not.toHaveBeenCalled();
    });

    it("composes dashboard event handlers after the internal handler without mutating inputs", () => {
        const { result, dispatch, apply } = setup();
        const id = apply();
        const handler = vi.fn(() => {
            expect(result.current.copilot.getSnapshot().applications).toEqual([]);
        });
        const handlers = [anyDashboardEventHandler(handler), anyDashboardEventHandler(vi.fn())];
        const props = result.current.dashboardProps({ eventHandlers: handlers });
        expect(props.eventHandlers).toEqual([...result.current.dashboardProps().eventHandlers!, ...handlers]);
        const event = { type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: id } as DashboardEvents;
        const selector = result.current.assistantProps().dashboardSelector!;
        act(() => {
            for (const { eval: matches, handler: handle } of props.eventHandlers!) {
                if (matches(event)) {
                    handle(event, dispatch, selector);
                }
            }
        });
        expect(handler).toHaveBeenCalledExactlyOnceWith(event, dispatch, selector);
        expect(handlers).toHaveLength(2);
        expect(result.current.dashboardProps({ eventHandlers: [] }).eventHandlers).toHaveLength(1);
    });

    it("composes dashboard state callbacks internal-first and forwards the same arguments", () => {
        const { result, dispatch } = setup();
        const state = dashboardState(false);
        const onStateChange = vi.fn(() => {
            expect(result.current.copilot.getSnapshot().context.isEditing).toBe(false);
        });
        const props = result.current.dashboardProps({ onStateChange });
        act(() => props.onStateChange!(state, dispatch));
        expect(onStateChange).toHaveBeenCalledExactlyOnceWith(state, dispatch);
        expect(result.current.assistantProps().dashboardSelector!(selectDashboardId)).toBe("dashboard");
    });

    it("passes through dashboard props and merges config while retaining control of aiMode", () => {
        const { result, apply } = setup();
        const config = { initialRenderMode: "edit", enableInsightEditing: true, aiMode: "waiting" } as const;
        const props = { dashboard: "custom-dashboard", workspace: "workspace", config };
        expect(result.current.dashboardProps(props)).toMatchObject({
            ...props,
            config: { ...config, aiMode: undefined },
        });
        apply();
        expect(result.current.dashboardProps(props).config).toEqual({ ...config, aiMode: "building" });
        expect(config.aiMode).toBe("waiting");
    });

    it("composes chat event handlers after the internal handler without mutating inputs", () => {
        const { result, dispatch } = setup();
        const handler = vi.fn(() => {
            expect(dispatch).toHaveBeenCalledOnce();
            expect(result.current.copilot.getSnapshot().applications).toHaveLength(1);
        });
        const handlers = [{ eval: (event: ChatEvent | undefined): event is ChatEvent => !!event, handler }];
        const props = result.current.genAiStoreProps({ eventHandlers: handlers });
        expect(props.eventHandlers).toEqual([
            ...result.current.genAiStoreProps().eventHandlers!,
            ...handlers,
        ]);
        act(() => {
            for (const { eval: matches, handler: handle } of props.eventHandlers!) {
                if (matches(definition)) {
                    handle(definition);
                }
            }
        });
        expect(handler).toHaveBeenCalledExactlyOnceWith(definition);
        expect(handlers).toHaveLength(1);
        expect(result.current.genAiStoreProps({ eventHandlers: [] }).eventHandlers).toHaveLength(1);
    });

    it("composes dispatcher callbacks internal-first and passes other store props through", () => {
        const { result, chatDispatch } = setup();
        const dispatch = vi.fn();
        const onDispatcher = vi.fn(() => result.current.sendMessage("Ready"));
        const props = result.current.genAiStoreProps({
            workspace: "workspace",
            onDispatcher,
            includeTags: ["tag"],
        });
        act(() => props.onDispatcher!(dispatch));
        expect(onDispatcher).toHaveBeenCalledExactlyOnceWith(dispatch);
        expect(dispatch).toHaveBeenCalledOnce();
        expect(chatDispatch).not.toHaveBeenCalled();
        expect(props.workspace).toBe("workspace");
        expect(props.includeTags).toEqual(["tag"]);
    });

    it("applies definitions in place and acknowledges only the correlated completion", () => {
        const { result, dispatch, dashboardEvent, apply } = setup();
        const id = apply();
        expect(dispatch).toHaveBeenCalledWith(changeDashboardDefinition(dashboard, { insights: [] }, id));
        expect(result.current.dashboardProps().config?.aiMode).toBe("building");
        dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: "unrelated" });
        expect(result.current.copilot.getSnapshot().applications).toHaveLength(1);
        dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: id });
        expect(result.current.copilot.getSnapshot().applications).toEqual([]);
        expect(result.current.dashboardProps().config?.aiMode).toBe("active");
        expect(
            result.current.copilot.getAppliedSource({
                type: CopilotBuildType.Dashboard,
                objectId: "dashboard",
            }),
        ).toEqual({ conversationId: "local", threadId: "thread" });
    });

    it.each(["GDC.DASH/EVT.COMMAND.FAILED", "GDC.DASH/EVT.COMMAND.REJECTED"] as const)(
        "releases an application when %s arrives",
        (type) => {
            const { result, dashboardEvent, apply } = setup();
            const id = apply();
            dashboardEvent({ type, correlationId: id });
            expect(result.current.copilot.getSnapshot().applications).toEqual([]);
            expect(result.current.dashboardProps().config?.aiMode).toBe("active");
        },
    );

    it("handles synchronous completion during command dispatch", () => {
        const { result, dispatch, dashboardEvent, apply } = setup();
        dispatch.mockImplementation((command) => {
            dashboardEvent({
                type: "GDC.DASH/EVT.DEFINITION_CHANGED",
                correlationId: command["correlationId"],
            });
            return command;
        });
        apply();
        expect(result.current.copilot.getSnapshot().applications).toEqual([]);
        expect(
            result.current.copilot.getAppliedSource({
                type: CopilotBuildType.Dashboard,
                objectId: "dashboard",
            }),
        ).toBeDefined();
    });

    it("releases an application if command dispatch throws", () => {
        const { result, dispatch, chatEvent } = setup();
        dispatch.mockImplementation(() => {
            throw new Error("Dispatch failed");
        });
        expect(() => chatEvent(definition)).toThrow("Dispatch failed");
        expect(result.current.copilot.getSnapshot().applications).toEqual([]);
    });

    it("ignores definitions in view mode, for other objects, other types, and history", () => {
        const { result, dispatch, chatEvent } = setup(dashboardState(false));
        chatEvent(definition);
        act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
        chatEvent({ ...definition, dashboard: { ...dashboard, identifier: "another" } });
        chatEvent({ ...definition, definitionType: "visualization" });
        chatEvent({ ...definition, interactionId: "historic" });
        expect(dispatch).not.toHaveBeenCalled();
    });

    it("does not apply definitions before initialization or after deinitialization", () => {
        const state = dashboardState();
        state.loading = { loading: true };
        const { result, dispatch, chatEvent, dashboardEvent } = setup(state);
        chatEvent(definition);
        expect(result.current.assistantProps().dashboardSelector).toBeNull();
        act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
        chatEvent(definition);
        expect(result.current.copilot.getSnapshot().applications).toHaveLength(1);
        dashboardEvent({ type: "GDC.DASH/EVT.DEINITIALIZED" });
        expect(result.current.copilot.getSnapshot().applications).toEqual([]);
        expect(result.current.assistantProps().dashboardSelector).toBeNull();
        chatEvent(definition);
        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it("disconnects the old dashboard while it reloads and reconnects once ready", () => {
        const { result, dispatch, chatEvent, apply } = setup();
        apply();
        const state = dashboardState();
        state.loading = { loading: true };
        act(() => result.current.dashboardProps().onStateChange!(state, dispatch));
        expect(result.current.copilot.getSnapshot().applications).toEqual([]);
        expect(result.current.assistantProps().dashboardSelector).toBeNull();
        chatEvent(definition);
        expect(dispatch).toHaveBeenCalledTimes(1);
        act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
        chatEvent(definition);
        expect(dispatch).toHaveBeenCalledTimes(2);
    });

    it("interrupts outstanding applications when the dashboard store is replaced", () => {
        const { result, dashboardEvent, apply } = setup();
        const id = apply();
        const dispatch = vi.fn<DashboardDispatch>() as Mock<DashboardDispatch> & DashboardDispatch;
        act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
        expect(result.current.copilot.getSnapshot().applications).toEqual([]);
        dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: id });
        expect(
            result.current.copilot.getAppliedSource({
                type: CopilotBuildType.Dashboard,
                objectId: "dashboard",
            }),
        ).toBeUndefined();
    });

    it("starts generation only for an initialized empty dashboard in edit mode", () => {
        const { result, chatDispatch, dispatch } = setup();
        act(() => result.current.generateDashboard("Create a dashboard"));
        expect(chatDispatch).not.toHaveBeenCalled();
        const emptyState = dashboardState();
        emptyState.meta.persistedDashboard = undefined;
        act(() => result.current.dashboardProps().onStateChange!(emptyState, dispatch));
        act(() => result.current.generateDashboard("Create a dashboard"));
        expect(chatDispatch.mock.calls.map(([action]) => action.type)).toEqual([
            "messages/startNewConversationAction",
            "messages/newMessageAction",
        ]);
        expect(result.current.dashboardProps().config?.aiMode).toBe("generating");
        act(() => result.current.cancelGeneration());
        expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
    });

    it("applies a generated definition to an empty dashboard and tracks its final identifier", () => {
        const state = dashboardState();
        state.meta.persistedDashboard = undefined;
        const { result, dispatch, chatEvent, dashboardEvent } = setup(state);
        act(() => result.current.generateDashboard("Create a dashboard"));
        chatEvent({
            type: "chatUserMessage",
            conversationId: "local",
            threadId: "thread",
            question: "Create",
            objects: [],
        });
        chatEvent({
            type: "chatAssistantMessage",
            threadId: "thread",
            useCase: "GENERAL",
            responseCompleted: false,
            skills: [{ name: "dashboard_builder", title: "Building" }],
        });
        chatEvent(definition);
        const id = dispatch.mock.calls.at(-1)![0]["correlationId"] as string;
        act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
        expect(result.current.dashboardProps().config?.aiMode).toBe("building");
        dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: id });
        chatEvent({
            type: "chatAssistantMessage",
            threadId: "thread",
            useCase: "GENERAL",
            responseCompleted: true,
        });
        expect(result.current.dashboardProps().config?.aiMode).toBe("active");
        expect(
            result.current.copilot.getAppliedSource({
                type: CopilotBuildType.Dashboard,
                objectId: "dashboard",
            }),
        ).toEqual({ conversationId: "local", threadId: "thread" });
    });

    describe("AI mode lifecycle", () => {
        it.each(["create", "edit"] as const)(
            "keeps a completed %s workflow active across chat resets until dashboard cancellation",
            (intent) => {
                const { result, dispatch, chatEvent, dashboardEvent, apply, rerender } = setup(
                    intent === "create" ? emptyDashboardState() : dashboardState(),
                );
                expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
                if (intent === "create") {
                    act(() => result.current.generateDashboard("Create a dashboard"));
                }
                chatEvent(userMessage);
                const correlationId = apply();
                act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
                dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId });
                expect(result.current.copilot.getStatus(result.current.composingProps.scope)).toBe("idle");
                expect(result.current.dashboardProps().config?.aiMode).toBe("active");

                chatEvent({ type: "chatReset" });
                chatEvent({
                    type: "chatConversationChanged",
                    threadId: "other",
                    conversation: { id: "other", localId: "other-local", createdAt: "", updatedAt: "" },
                });
                rerender();
                expect(result.current.dashboardProps().config?.aiMode).toBe("active");
                act(() => result.current.cancelGeneration());
                expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
            },
        );

        it.each(
            ["create", "edit"].flatMap((intent) =>
                [true, false].map((attributed) => ({ intent, attributed })),
            ),
        )("clears AI mode after saving: intent=$intent attributed=$attributed", ({ intent, attributed }) => {
            const { result, dispatch, chatEvent, chatDispatch, dashboardEvent, apply } = setup(
                intent === "create" ? emptyDashboardState() : dashboardState(),
            );
            if (intent === "create") {
                act(() => result.current.generateDashboard("Create a dashboard"));
            }
            chatEvent(userMessage);
            const correlationId = apply();
            act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
            dashboardEvent({
                type: attributed ? "GDC.DASH/EVT.DEFINITION_CHANGED" : "GDC.DASH/EVT.COMMAND.FAILED",
                correlationId,
            });
            chatEvent({
                type: "chatAssistantMessage",
                threadId: "thread",
                useCase: "GENERAL",
                responseCompleted: true,
                cancelled: !attributed,
            });
            expect(result.current.dashboardProps().config?.aiMode).toBe("active");
            expect(result.current.copilot.getAppliedSource(dashboardTarget) !== undefined).toBe(attributed);
            chatDispatch.mockClear();

            const savedDashboard = { ...dashboard, identifier: intent === "create" ? "saved" : "dashboard" };
            dashboardEvent({
                type: "GDC.DASH/EVT.SAVED",
                payload: {
                    dashboard: savedDashboard,
                    originalDashboardId: "dashboard",
                    newDashboard: intent === "create",
                },
            });
            expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
            expect(chatDispatch).toHaveBeenCalledTimes(attributed ? 1 : 0);

            act(() =>
                result.current.dashboardProps().onStateChange!(
                    dashboardState(false, savedDashboard),
                    dispatch,
                ),
            );
            expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
            act(() =>
                result.current.dashboardProps().onStateChange!(
                    dashboardState(true, savedDashboard),
                    dispatch,
                ),
            );
            expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
            chatEvent({ ...definition, itemId: "next-item", dashboard: savedDashboard });
            expect(result.current.dashboardProps().config?.aiMode).toBe("building");
            dashboardEvent({
                type: "GDC.DASH/EVT.DEFINITION_CHANGED",
                correlationId: dispatch.mock.calls.at(-1)![0]["correlationId"] as string,
            });
            expect(result.current.dashboardProps().config?.aiMode).toBe("active");
        });

        it.each(["GDC.DASH/EVT.COMMAND.FAILED", "GDC.DASH/EVT.COMMAND.REJECTED"] as const)(
            "keeps AI mode active when saving emits %s",
            (type) => {
                const { result, dashboardEvent, apply } = setup();
                dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: apply() });
                expect(result.current.dashboardProps().config?.aiMode).toBe("active");
                dashboardEvent({ type, correlationId: "save" });
                expect(result.current.dashboardProps().config?.aiMode).toBe("active");
            },
        );

        it("does not activate AI mode for an unrelated assistant response", () => {
            const { result, chatEvent } = setup();
            chatEvent(userMessage);
            chatEvent({
                type: "chatAssistantMessage",
                threadId: "thread",
                useCase: "GENERAL",
                responseCompleted: true,
                skills: [{ name: "alert", title: "Creating an alert" }],
            });
            expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
        });

        it.each(["deinitialized", "loading", "replacement"] as const)(
            "clears completed AI mode at %s",
            (boundary) => {
                const { result, dispatch, dashboardEvent, apply } = setup();
                const correlationId = apply();
                dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId });
                expect(result.current.dashboardProps().config?.aiMode).toBe("active");
                if (boundary === "deinitialized") {
                    dashboardEvent({ type: "GDC.DASH/EVT.DEINITIALIZED" });
                } else {
                    const state = dashboardState();
                    if (boundary === "loading") {
                        state.loading = { loading: true };
                    }
                    const nextDispatch = vi.fn<DashboardDispatch>() as Mock<DashboardDispatch> &
                        DashboardDispatch;
                    act(() =>
                        result.current.dashboardProps().onStateChange!(
                            state,
                            boundary === "replacement" ? nextDispatch : dispatch,
                        ),
                    );
                }
                expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
            },
        );
    });

    it("replies to the waiting conversation even after the selected conversation changes", () => {
        const { result, chatEvent, chatDispatch } = setup();
        chatEvent({
            type: "chatUserMessage",
            conversationId: "local",
            threadId: "thread",
            question: "Edit",
            objects: [],
        });
        chatEvent({
            type: "chatAssistantMessage",
            threadId: "thread",
            useCase: "GENERAL",
            responseCompleted: false,
            skills: [{ name: "dashboard_editor", title: "Editing" }],
        });
        chatEvent({
            type: "chatClarificationQuestions",
            threadId: "thread",
            interactionId: "question",
            questions: [
                { text: "Which metric?", control: { type: "singleChoice", options: [{ text: "Revenue" }] } },
            ],
        });
        expect(result.current.dashboardProps().config?.aiMode).toBe("waiting");
        expect(chatDispatch).toHaveBeenLastCalledWith(
            activateConversationAction({ conversationId: "thread" }),
        );
        chatEvent({
            type: "chatUserMessage",
            conversationId: "other-local",
            threadId: "other",
            question: "Hello",
            objects: [],
        });
        act(() => result.current.replyInChat());
        expect(chatDispatch).toHaveBeenLastCalledWith(
            activateConversationAction({ conversationId: "thread" }),
        );
    });

    it("notifies the definition's originating conversation when the dashboard is saved", () => {
        const { chatDispatch, dashboardEvent, apply } = setup();
        const id = apply();
        dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: id });
        dashboardEvent({
            type: "GDC.DASH/EVT.SAVED",
            payload: {
                dashboard: { ...dashboard, identifier: "saved" },
                newDashboard: true,
                originalDashboardId: "dashboard",
                savedInsights: [],
            },
        });
        expect(chatDispatch).toHaveBeenLastCalledWith(
            dashboardSavedAction({
                conversationId: "local",
                originalDashboardId: "dashboard",
                savedDashboardId: "saved",
                savedInsights: [],
            }),
        );
    });

    it("sends nonempty messages through the shared store", () => {
        const { result, chatDispatch } = setup();
        act(() => result.current.sendMessage(" "));
        expect(chatDispatch).not.toHaveBeenCalled();
        act(() => result.current.sendMessage("Update the title"));
        expect(chatDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    role: "user",
                    content: { type: "text", text: "Update the title" },
                }),
            }),
        );
    });

    it("survives StrictMode effect replay and disposes after unmount", async () => {
        const { result, unmount } = renderHook(() => useDashboardCopilot(), { wrapper: StrictMode });
        await act(async () => {});
        const connection = result.current;
        const dispose = vi.spyOn(connection.copilot, "dispose");
        act(() => connection.copilot.startGeneration(CopilotBuildType.Dashboard));
        expect(result.current.dashboardProps().config?.aiMode).toBe("generating");
        unmount();
        await act(async () => {});
        expect(dispose).toHaveBeenCalledOnce();
        const snapshot = connection.copilot.getSnapshot();
        connection.genAiStoreProps().eventHandlers![0].handler({ type: "chatReset" });
        expect(connection.copilot.getSnapshot()).toBe(snapshot);
    });

    it("interrupts pending applications and ignores retained callbacks after unmount", async () => {
        const { result, unmount, apply, dispatch, chatDispatch } = setup();
        apply();
        const connection = result.current;
        unmount();
        await act(async () => {});
        expect(connection.copilot.getSnapshot().applications).toEqual([]);
        connection.genAiStoreProps().eventHandlers![0].handler(definition);
        connection.sendMessage("Ignored after unmount");
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(chatDispatch).not.toHaveBeenCalled();
    });

    it("keeps separate dashboard connections isolated", () => {
        const first = setup();
        const second = setup();
        first.apply();
        expect(second.dispatch).not.toHaveBeenCalled();
        expect(second.result.current.dashboardProps().config?.aiMode).toBeUndefined();
        expect(second.result.current.copilot.getSnapshot().applications).toEqual([]);
    });

    describe("generation readiness", () => {
        const cases = [true, false].flatMap((isEditing) =>
            [true, false].flatMap((persisted) =>
                ["ready", "loading", "no-result"].flatMap((loading) =>
                    [true, false].flatMap((chatReady) =>
                        ["", " \n\t ", "  Create revenue dashboard  "].map((message) => ({
                            isEditing,
                            persisted,
                            loading,
                            chatReady,
                            message,
                        })),
                    ),
                ),
            ),
        );

        it.each(cases)(
            "guards generation: edit=$isEditing persisted=$persisted loading=$loading chat=$chatReady message='$message'",
            ({ isEditing, persisted, loading, chatReady, message }) => {
                const { result } = renderHook(() => useDashboardCopilot());
                const dispatch = vi.fn<DashboardDispatch>() as Mock<DashboardDispatch> & DashboardDispatch;
                const chatDispatch = vi.fn();
                const state = persisted ? dashboardState(isEditing) : emptyDashboardState(isEditing);
                if (loading !== "ready") {
                    state.loading = loading === "loading" ? { loading: true } : { loading: false };
                }
                act(() => {
                    result.current.dashboardProps().onStateChange!(state, dispatch);
                    if (chatReady) {
                        result.current.genAiStoreProps().onDispatcher!(chatDispatch);
                    }
                    result.current.generateDashboard(message);
                });

                const allowed =
                    isEditing && !persisted && loading === "ready" && chatReady && !!message.trim();
                expect(chatDispatch).toHaveBeenCalledTimes(allowed ? 2 : 0);
                expect(result.current.copilot.isGenerationPending(CopilotBuildType.Dashboard)).toBe(allowed);
                expect(result.current.dashboardProps().config?.aiMode).toBe(
                    allowed ? "generating" : undefined,
                );
                expect(dispatch).not.toHaveBeenCalled();
                const messageAction = expect.objectContaining({
                    type: "messages/newMessageAction",
                    payload: expect.objectContaining({
                        role: "user",
                        content: { type: "text", text: message },
                    }),
                });
                expect(chatDispatch.mock.calls).toEqual(
                    allowed ? [[startNewConversationAction()], [messageAction]] : [],
                );
            },
        );

        it.each(["chat-first", "dashboard-first"])("connects in either initialization order: %s", (order) => {
            const { result } = renderHook(() => useDashboardCopilot());
            const dispatch = vi.fn<DashboardDispatch>() as Mock<DashboardDispatch> & DashboardDispatch;
            const chatDispatch = vi.fn();
            const connectChat = () => result.current.genAiStoreProps().onDispatcher!(chatDispatch);
            const connectDashboard = () =>
                result.current.dashboardProps().onStateChange!(emptyDashboardState(), dispatch);
            act(() => {
                result.current.generateDashboard("Too early");
                (order === "chat-first" ? connectChat : connectDashboard)();
                result.current.generateDashboard("Still too early");
            });
            expect(chatDispatch).not.toHaveBeenCalled();
            expect(result.current.copilot.isGenerationPending(CopilotBuildType.Dashboard)).toBe(false);
            act(() => {
                (order === "chat-first" ? connectDashboard : connectChat)();
                result.current.generateDashboard("Create");
            });
            expect(chatDispatch.mock.calls.map(([action]) => action.type)).toEqual([
                "messages/startNewConversationAction",
                "messages/newMessageAction",
            ]);
        });

        it.each([false, true])(
            "clears unsupported generation progress without interrupting chat: completed=%s",
            (responseCompleted) => {
                const { result, chatEvent, chatDispatch, dispatch } = setup(emptyDashboardState());
                act(() => result.current.generateDashboard("Create"));
                chatEvent(userMessage);
                chatEvent({
                    type: "chatAssistantMessage",
                    threadId: "thread",
                    useCase: "GENERAL",
                    agent: { id: "analyst", title: "Analyst", effectiveSkills: ["alert"] },
                    responseCompleted,
                });

                expect(result.current.copilot.isGenerationPending(CopilotBuildType.Dashboard)).toBe(false);
                expect(result.current.copilot.getStatus(result.current.composingProps.scope)).toBe("idle");
                expect(result.current.dashboardProps().config?.aiMode).toBe("active");
                expect(chatDispatch.mock.calls.map(([action]) => action.type)).toEqual([
                    "messages/startNewConversationAction",
                    "messages/newMessageAction",
                ]);
                expect(dispatch).not.toHaveBeenCalled();
            },
        );

        it("preserves generation for an editor-only agent matching the registered skills", () => {
            const { result, chatEvent } = setup(emptyDashboardState());
            act(() => result.current.generateDashboard("Create"));
            chatEvent(userMessage);
            chatEvent({
                type: "chatAssistantMessage",
                threadId: "thread",
                useCase: "GENERAL",
                agent: { id: "editor", title: "Editor", effectiveSkills: ["dashboard_editor"] },
                responseCompleted: true,
            });
            expect(result.current.copilot.isGenerationPending(CopilotBuildType.Dashboard)).toBe(true);
            expect(result.current.copilot.getStatus(result.current.composingProps.scope)).toBe("waiting");
            expect(result.current.dashboardProps().config?.aiMode).toBe("waiting");
        });

        it("can cancel and restart generation without sending a cancellation or replaying old messages", () => {
            const { result, chatDispatch } = setup(emptyDashboardState());
            act(() => {
                result.current.cancelGeneration();
                result.current.generateDashboard("First");
                result.current.cancelGeneration();
                result.current.cancelGeneration();
            });
            expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
            expect(chatDispatch).toHaveBeenCalledTimes(2);
            act(() => result.current.generateDashboard("Second"));
            expect(chatDispatch).toHaveBeenCalledTimes(4);
            expect(chatDispatch.mock.calls[3][0].payload.content.text).toBe("Second");
            expect(result.current.dashboardProps().config?.aiMode).toBe("generating");
        });
    });

    describe("definition application combinations", () => {
        it("cancels a follow-up without undoing the generated dashboard", () => {
            const { result, dispatch, chatEvent, dashboardEvent, apply } = setup(emptyDashboardState());
            act(() => result.current.generateDashboard("Create"));
            chatEvent(userMessage);
            const correlationId = apply();
            act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
            dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId });
            chatEvent({
                type: "chatAssistantMessage",
                threadId: "thread",
                useCase: "GENERAL",
                responseCompleted: true,
            });
            const source = result.current.copilot.getAppliedSource(dashboardTarget);

            chatEvent(userMessage);
            act(() => result.current.cancelGeneration());
            chatEvent({
                type: "chatAssistantMessage",
                threadId: "thread",
                useCase: "GENERAL",
                skills: [{ name: "dashboard_editor", title: "Editing" }],
                responseCompleted: true,
            });
            chatEvent(definition);

            expect(dispatch).toHaveBeenCalledOnce();
            expect(result.current.copilot.getAppliedSource(dashboardTarget)).toBe(source);
            expect(result.current.assistantProps().dashboardSelector!(selectDashboardId)).toBe("dashboard");
            expect(result.current.copilot.getStatus(result.current.composingProps.scope)).toBe("idle");
            expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
        });

        it.each(
            [false, true].flatMap((skillActivated) =>
                [false, true].flatMap((completedFirst) =>
                    [false, true].map((threadAssigned) => ({
                        skillActivated,
                        completedFirst,
                        threadAssigned,
                    })),
                ),
            ),
        )(
            "blocks cancelled edits and accepts a new turn: skill=$skillActivated completedFirst=$completedFirst threadAssigned=$threadAssigned",
            ({ skillActivated, completedFirst, threadAssigned }) => {
                const { result, dispatch, chatDispatch, chatEvent } = setup();
                const assistantMessage: ChatEvent = {
                    type: "chatAssistantMessage",
                    threadId: "thread",
                    useCase: "GENERAL",
                    skills: [{ name: "dashboard_editor", title: "Editing" }],
                };
                chatEvent({ ...userMessage, threadId: threadAssigned ? "thread" : undefined });
                if (skillActivated) {
                    chatEvent(assistantMessage);
                }

                act(() => result.current.cancelGeneration());
                const complete = () => chatEvent({ ...assistantMessage, responseCompleted: true });
                chatEvent({ type: "chatReasoning", threadId: "thread", title: "Adding a chart" });
                chatEvent(assistantMessage);
                if (completedFirst) {
                    complete();
                }
                chatEvent(definition);

                expect(dispatch).not.toHaveBeenCalled();
                expect(result.current.copilot.getSnapshot().applications).toEqual([]);
                expect(result.current.copilot.getStatus(result.current.composingProps.scope)).toBe("idle");
                expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
                if (!completedFirst) {
                    complete();
                }
                chatEvent(definition);
                expect(dispatch).not.toHaveBeenCalled();
                expect(chatDispatch).not.toHaveBeenCalled();

                chatEvent({ ...userMessage, conversationId: "other-local", threadId: "other-thread" });
                chatEvent(definition);
                expect(dispatch).not.toHaveBeenCalled();

                chatEvent(userMessage);
                chatEvent(assistantMessage);
                chatEvent(definition);
                expect(dispatch).toHaveBeenCalledOnce();
                expect(result.current.dashboardProps().config?.aiMode).toBe("building");
            },
        );

        it.each(
            ["before-message", "before-thread", "before-skill", "after-skill"].flatMap((phase) =>
                [false, true].map((completedFirst) => ({ phase, completedFirst })),
            ),
        )(
            "keeps cancelled creation empty and idle: phase=$phase completedFirst=$completedFirst",
            ({ phase, completedFirst }) => {
                const { result, dispatch, chatDispatch, chatEvent } = setup(emptyDashboardState());
                const assistantMessage: ChatEvent = {
                    type: "chatAssistantMessage",
                    threadId: "thread",
                    useCase: "GENERAL",
                    skills: [{ name: "dashboard_builder", title: "Building" }],
                };
                const assignThread = () =>
                    chatEvent({
                        type: "chatConversationChanged",
                        threadId: "thread",
                        conversation: { id: "thread", localId: "local", createdAt: "", updatedAt: "" },
                    });
                act(() => result.current.generateDashboard("Create"));
                if (phase !== "before-message") {
                    chatEvent({ ...userMessage, threadId: undefined });
                }
                if (phase === "before-skill" || phase === "after-skill") {
                    assignThread();
                }
                if (phase === "after-skill") {
                    chatEvent(assistantMessage);
                }

                act(() => result.current.cancelGeneration());
                if (phase === "before-message") {
                    chatEvent({ ...userMessage, threadId: undefined });
                }
                if (phase === "before-message" || phase === "before-thread") {
                    assignThread();
                }
                chatEvent(assistantMessage);
                const complete = () => chatEvent({ ...assistantMessage, responseCompleted: true });
                if (completedFirst) {
                    complete();
                }
                chatEvent(definition);

                expect(dispatch).not.toHaveBeenCalled();
                expect(result.current.copilot.isGenerationPending(CopilotBuildType.Dashboard)).toBe(false);
                expect(result.current.copilot.getStatus(result.current.composingProps.scope)).toBe("idle");
                expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
                if (!completedFirst) {
                    complete();
                }
                expect(result.current.copilot.getStatus(result.current.composingProps.scope)).toBe("idle");
                expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
                expect(result.current.copilot.getSnapshot().applications).toEqual([]);
                expect(result.current.copilot.getSnapshot().requests).toEqual([]);
                expect(chatDispatch).toHaveBeenCalledTimes(2);

                act(() => result.current.generateDashboard("Try again"));
                chatEvent({ ...userMessage, conversationId: "next-local", threadId: "next-thread" });
                chatEvent({ ...assistantMessage, threadId: "next-thread" });
                chatEvent({ ...definition, conversationId: "next-local", threadId: "next-thread" });
                expect(dispatch).toHaveBeenCalledOnce();
                expect(result.current.dashboardProps().config?.aiMode).toBe("building");
            },
        );

        it.each(
            [false, true].flatMap((previousSkillActivated) =>
                ["before-request", "before-activation", "after-activation"].flatMap((phase) =>
                    [false, true].map((reusedThread) => ({ previousSkillActivated, phase, reusedThread })),
                ),
            ),
        )(
            "rejects cancelled generation definitions: previousSkill=$previousSkillActivated phase=$phase reusedThread=$reusedThread",
            ({ previousSkillActivated, phase, reusedThread }) => {
                const { result, dispatch, chatEvent, dashboardEvent } = setup(emptyDashboardState());
                const assistantMessage: ChatEvent = {
                    type: "chatAssistantMessage",
                    threadId: "thread",
                    useCase: "GENERAL",
                    skills: [{ name: "dashboard_builder", title: "Building" }],
                };
                act(() => result.current.generateDashboard("Previous"));
                chatEvent(userMessage);
                if (previousSkillActivated) {
                    chatEvent(assistantMessage);
                }
                act(() => {
                    result.current.cancelGeneration();
                    result.current.generateDashboard("Current");
                });
                const threadId = reusedThread ? "thread" : "current-thread";
                if (phase !== "before-request") {
                    chatEvent({ ...userMessage, conversationId: "current-local", threadId });
                }
                if (phase === "after-activation") {
                    chatEvent({ ...assistantMessage, threadId });
                }

                const snapshot = result.current.copilot.getSnapshot();
                chatEvent(definition);
                expect(dispatch).not.toHaveBeenCalled();
                expect(result.current.copilot.getSnapshot()).toBe(snapshot);

                if (phase === "before-request") {
                    chatEvent({ ...userMessage, conversationId: "current-local", threadId });
                }
                const currentDashboard = { ...dashboard, identifier: "current-dashboard" };
                chatEvent({
                    ...definition,
                    conversationId: "current-local",
                    threadId,
                    dashboard: currentDashboard,
                });
                const correlationId = dispatch.mock.calls[0][0]["correlationId"] as string;
                expect(dispatch).toHaveBeenCalledExactlyOnceWith(
                    changeDashboardDefinition(currentDashboard, { insights: [] }, correlationId),
                );
                dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId });
                expect(
                    result.current.copilot.getAppliedSource({
                        type: CopilotBuildType.Dashboard,
                        objectId: "current-dashboard",
                    }),
                ).toEqual({ conversationId: "current-local", threadId });
            },
        );

        it("accepts generation definitions by local identity across initial thread assignment", () => {
            const { result, dispatch, chatEvent } = setup(emptyDashboardState());
            act(() => result.current.generateDashboard("Create"));
            chatEvent({ ...userMessage, threadId: undefined });
            chatEvent(definition);
            expect(dispatch).toHaveBeenCalledOnce();
        });

        it("keeps matching-object edits available while a different generation is pending", () => {
            const { result, dispatch, chatEvent } = setup(emptyDashboardState());
            act(() => result.current.generateDashboard("Create"));
            chatEvent({ ...userMessage, conversationId: "current-local", threadId: "current-thread" });
            act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
            chatEvent(definition);
            expect(dispatch).toHaveBeenCalledOnce();
        });

        it.each(
            [true, false].flatMap((isEditing) =>
                ["matching", "other", "missing", "visualization", "history"].map((kind) => ({
                    isEditing,
                    kind,
                })),
            ),
        )("filters definitions: edit=$isEditing kind=$kind", ({ isEditing, kind }) => {
            const { result, dispatch, chatEvent } = setup(dashboardState(isEditing));
            chatEvent({
                ...definition,
                ...(kind === "other" ? { dashboard: { ...dashboard, identifier: "other" } } : {}),
                ...(kind === "missing" ? { dashboard: undefined } : {}),
                ...(kind === "visualization" ? { definitionType: "visualization" } : {}),
                ...(kind === "history" ? { interactionId: "historic" } : {}),
            });
            const applies = isEditing && kind === "matching";
            expect(dispatch).toHaveBeenCalledTimes(applies ? 1 : 0);
            expect(result.current.copilot.getSnapshot().applications).toHaveLength(applies ? 1 : 0);
        });

        it.each([
            undefined,
            [] as IInsight[],
            [
                {
                    insight: {
                        identifier: "insight",
                        uri: "/insight",
                        ref: idRef("insight"),
                        title: "Revenue",
                        visualizationUrl: "local:bar",
                        buckets: [],
                        filters: [],
                        sorts: [],
                        properties: {},
                    },
                },
            ] as IInsight[],
        ])("forwards definition insight references: %j", (insights) => {
            const { dispatch, chatEvent } = setup();
            chatEvent({ ...definition, insights });
            const command = dispatch.mock.calls[0][0];
            expect(command).toEqual(
                changeDashboardDefinition(dashboard, { insights: insights ?? [] }, command["correlationId"]),
            );
        });

        it.each([
            "GDC.DASH/EVT.DEFINITION_CHANGED",
            "GDC.DASH/EVT.COMMAND.FAILED",
            "GDC.DASH/EVT.COMMAND.REJECTED",
        ] as const)("ignores missing and unknown correlations before handling %s once", (type) => {
            const { result, dashboardEvent, apply } = setup();
            const id = apply();
            for (const correlationId of [undefined, "", "unknown"]) {
                dashboardEvent({ type, correlationId });
                expect(result.current.copilot.getSnapshot().applications).toHaveLength(1);
                expect(result.current.dashboardProps().config?.aiMode).toBe("building");
            }
            dashboardEvent({ type, correlationId: id });
            const snapshot = result.current.copilot.getSnapshot();
            dashboardEvent({ type, correlationId: id });
            expect(result.current.copilot.getSnapshot()).toBe(snapshot);
            expect(snapshot.applications).toEqual([]);
            expect(result.current.copilot.getAppliedSource(dashboardTarget)).toEqual(
                type === "GDC.DASH/EVT.DEFINITION_CHANGED"
                    ? { conversationId: "local", threadId: "thread" }
                    : undefined,
            );
        });

        it.each(["GDC.DASH/EVT.COMMAND.FAILED", "GDC.DASH/EVT.COMMAND.REJECTED"] as const)(
            "handles synchronous %s and permits retry",
            (type) => {
                const { result, dispatch, dashboardEvent, apply } = setup();
                dispatch.mockImplementationOnce((command) => {
                    dashboardEvent({ type, correlationId: command["correlationId"] });
                    return command;
                });
                apply();
                expect(result.current.copilot.getSnapshot().applications).toEqual([]);
                expect(result.current.copilot.getAppliedSource(dashboardTarget)).toBeUndefined();
                const retry = apply();
                dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: retry });
                expect(dispatch).toHaveBeenCalledTimes(2);
                expect(result.current.copilot.getAppliedSource(dashboardTarget)).toBeDefined();
            },
        );

        it("does not retain a failed dispatch correlation and allows a later successful definition", () => {
            const { result, dispatch, chatEvent, dashboardEvent, apply } = setup();
            dispatch.mockImplementationOnce(() => {
                throw new Error("Dispatch failed");
            });
            expect(() => chatEvent(definition)).toThrow("Dispatch failed");
            const failedId = dispatch.mock.calls[0][0]["correlationId"] as string;
            const retry = apply();
            dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: failedId });
            expect(result.current.copilot.getSnapshot().applications.map(({ id }) => id)).toEqual([retry]);
            dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: retry });
            expect(result.current.copilot.getSnapshot().applications).toEqual([]);
            expect(result.current.copilot.getAppliedSource(dashboardTarget)).toBeDefined();
        });

        it.each(["old-first", "new-first"])("tracks concurrent revisions independently: %s", (order) => {
            const { result, dispatch, chatEvent, dashboardEvent } = setup();
            chatEvent(definition);
            chatEvent({
                ...definition,
                conversationId: "new-local",
                threadId: "new-thread",
                dashboard: { ...dashboard, title: "Revised" },
            });
            const ids = dispatch.mock.calls.map(([command]) => command["correlationId"] as string);
            expect(new Set(ids).size).toBe(2);
            expect(result.current.copilot.getSnapshot().applications).toHaveLength(2);
            const [first, second] = order === "old-first" ? ids : [...ids].reverse();
            dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: first });
            expect(result.current.copilot.getSnapshot().applications.map(({ id }) => id)).toEqual([second]);
            expect(result.current.dashboardProps().config?.aiMode).toBe("building");
            dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: second });
            expect(result.current.dashboardProps().config?.aiMode).toBe("active");
            expect(result.current.copilot.getAppliedSource(dashboardTarget)).toEqual({
                conversationId: "new-local",
                threadId: "new-thread",
            });
        });

        it("continues a newer application when an earlier revision fails", () => {
            const { result, apply, dashboardEvent } = setup();
            const first = apply();
            const second = apply();
            dashboardEvent({ type: "GDC.DASH/EVT.COMMAND.FAILED", correlationId: first });
            expect(result.current.copilot.getSnapshot().applications.map(({ id }) => id)).toEqual([second]);
            expect(result.current.dashboardProps().config?.aiMode).toBe("building");
            dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: second });
            expect(result.current.dashboardProps().config?.aiMode).toBe("active");
        });
    });

    describe("dashboard lifecycle boundaries", () => {
        it.each(["deinitialized", "loading", "no-result", "replacement"])(
            "interrupts all applications at %s and ignores their late acknowledgements",
            (boundary) => {
                const { result, dispatch, chatEvent, dashboardEvent, apply } = setup();
                const ids = [apply(), apply()];
                const nextDispatch = vi.fn<DashboardDispatch>() as Mock<DashboardDispatch> &
                    DashboardDispatch;
                if (boundary === "deinitialized") {
                    dashboardEvent({ type: "GDC.DASH/EVT.DEINITIALIZED" });
                } else {
                    const state = dashboardState();
                    if (boundary !== "replacement") {
                        state.loading = { loading: boundary === "loading" };
                    }
                    act(() =>
                        result.current.dashboardProps().onStateChange!(
                            state,
                            boundary === "replacement" ? nextDispatch : dispatch,
                        ),
                    );
                }
                expect(result.current.copilot.getSnapshot().applications).toEqual([]);
                for (const correlationId of ids) {
                    dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId });
                }
                expect(result.current.copilot.getAppliedSource(dashboardTarget)).toBeUndefined();
                expect(result.current.assistantProps().dashboardSelector === null).toBe(
                    boundary !== "replacement",
                );
                expect(result.current.composingProps.scope).toEqual({
                    type: CopilotBuildType.Dashboard,
                    objectId: boundary === "replacement" ? "dashboard" : undefined,
                    isEditing: boundary === "replacement" ? true : undefined,
                });
                if (boundary !== "replacement") {
                    chatEvent(definition);
                    act(() => result.current.dashboardProps().onStateChange!(dashboardState(), nextDispatch));
                }
                expect(dispatch).toHaveBeenCalledTimes(2);
                chatEvent(definition);
                expect(nextDispatch).toHaveBeenCalledOnce();
                expect(dispatch).toHaveBeenCalledTimes(2);
            },
        );

        it.each(["deinitialized", "loading", "no-result"])("clears creation intent at %s", (boundary) => {
            const { result, dispatch, chatDispatch, dashboardEvent } = setup(emptyDashboardState());
            act(() => result.current.generateDashboard("Create"));
            if (boundary === "deinitialized") {
                dashboardEvent({ type: "GDC.DASH/EVT.DEINITIALIZED" });
            } else {
                const state = emptyDashboardState();
                state.loading = { loading: boundary === "loading" };
                act(() => result.current.dashboardProps().onStateChange!(state, dispatch));
            }
            expect(result.current.copilot.isGenerationPending(CopilotBuildType.Dashboard)).toBe(false);
            expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
            act(() => result.current.generateDashboard("Too early"));
            expect(chatDispatch).toHaveBeenCalledTimes(2);
        });

        it("uses the latest target, edit mode, and selector when one store changes dashboard state", () => {
            const { result, dispatch, chatEvent } = setup();
            const originalSelector = result.current.assistantProps().dashboardSelector!;
            const other = { ...dashboard, identifier: "other" };
            act(() => result.current.dashboardProps().onStateChange!(dashboardState(false, other), dispatch));
            expect(result.current.composingProps.scope).toEqual({
                type: CopilotBuildType.Dashboard,
                objectId: "other",
                isEditing: false,
            });
            expect(originalSelector(selectDashboardId)).toBe("dashboard");
            expect(result.current.assistantProps().dashboardSelector!(selectDashboardId)).toBe("other");
            chatEvent({ ...definition, dashboard: other });
            expect(dispatch).not.toHaveBeenCalled();
            act(() => result.current.dashboardProps().onStateChange!(dashboardState(true, other), dispatch));
            chatEvent(definition);
            expect(dispatch).not.toHaveBeenCalled();
            chatEvent({ ...definition, dashboard: other });
            expect(dispatch).toHaveBeenCalledOnce();
        });
    });

    describe("save attribution", () => {
        it.each(
            [true, false].flatMap((explicitOriginal) =>
                ["omitted", "empty", "mapped"].map((references) => ({ explicitOriginal, references })),
            ),
        )(
            "preserves source and insight mappings: original=$explicitOriginal insights=$references",
            ({ explicitOriginal, references }) => {
                const { chatDispatch, chatEvent, dashboardEvent, apply } = setup();
                dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: apply() });
                chatEvent({ ...userMessage, conversationId: "unrelated-local", threadId: "unrelated" });
                const savedInsights =
                    references === "mapped"
                        ? [{ originalInsightId: "draft-insight", savedInsightId: "saved-insight" }]
                        : references === "empty"
                          ? []
                          : undefined;
                dashboardEvent({
                    type: "GDC.DASH/EVT.SAVED",
                    payload: {
                        dashboard: { ...dashboard, identifier: explicitOriginal ? "saved" : "dashboard" },
                        originalDashboardId: explicitOriginal ? "dashboard" : undefined,
                        newDashboard: explicitOriginal,
                        savedInsights,
                    },
                });
                expect(chatDispatch).toHaveBeenCalledExactlyOnceWith(
                    dashboardSavedAction({
                        conversationId: "local",
                        originalDashboardId: "dashboard",
                        savedDashboardId: explicitOriginal ? "saved" : "dashboard",
                        savedInsights: savedInsights ?? [],
                    }),
                );
            },
        );

        it.each(["none", "pending", "failed", "other-target"])(
            "does not attribute saves to %s definitions",
            (source) => {
                const { chatDispatch, dashboardEvent, apply } = setup();
                if (source !== "none") {
                    const id = apply();
                    if (source !== "pending") {
                        dashboardEvent({
                            type:
                                source === "failed"
                                    ? "GDC.DASH/EVT.COMMAND.FAILED"
                                    : "GDC.DASH/EVT.DEFINITION_CHANGED",
                            correlationId: id,
                        });
                    }
                }
                dashboardEvent({
                    type: "GDC.DASH/EVT.SAVED",
                    payload: {
                        dashboard: {
                            ...dashboard,
                            identifier: source === "other-target" ? "other" : "dashboard",
                        },
                        newDashboard: false,
                    },
                });
                expect(chatDispatch).not.toHaveBeenCalled();
            },
        );
    });

    describe("assistant workflow and helper actions", () => {
        it.each(
            [undefined, "unrelated"].flatMap((threadId) =>
                [true, false].map((knownConversation) => ({ threadId, knownConversation })),
            ),
        )(
            "does not activate chat for unowned questions: thread=$threadId known=$knownConversation",
            ({ threadId, knownConversation }) => {
                const { result, chatEvent, chatDispatch } = setup(emptyDashboardState());
                act(() => result.current.generateDashboard("Create"));
                chatEvent(userMessage);
                if (knownConversation) {
                    chatEvent({ ...userMessage, conversationId: "unrelated-local", threadId: "unrelated" });
                }
                chatEvent({ ...clarification, threadId });
                expect(result.current.dashboardProps().config?.aiMode).toBe("generating");
                expect(chatDispatch).toHaveBeenCalledTimes(2);
                chatEvent(clarification);
                expect(result.current.dashboardProps().config?.aiMode).toBe("waiting");
                expect(chatDispatch).toHaveBeenCalledTimes(3);
                expect(chatDispatch).toHaveBeenLastCalledWith(
                    activateConversationAction({ conversationId: "thread" }),
                );
            },
        );

        it.each(
            ["response-first", "application-first"].flatMap((order) =>
                [true, false].map((cancelled) => ({ order, cancelled })),
            ),
        )("keeps pending applications visible: order=$order cancelled=$cancelled", ({ order, cancelled }) => {
            const { result, dispatch, chatEvent, dashboardEvent } = setup();
            chatEvent(userMessage);
            chatEvent({
                type: "chatAssistantMessage",
                threadId: "thread",
                useCase: "GENERAL",
                skills: [{ name: "dashboard_editor", title: "Editing" }],
            });
            chatEvent(definition);
            const correlationId = dispatch.mock.calls[0][0]["correlationId"] as string;
            const finishResponse = () =>
                chatEvent({
                    type: "chatAssistantMessage",
                    threadId: "thread",
                    useCase: "GENERAL",
                    responseCompleted: true,
                    cancelled,
                });
            const finishApplication = () =>
                dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId });
            (order === "response-first" ? finishResponse : finishApplication)();
            expect(result.current.copilot.getSnapshot().applications).toHaveLength(
                order === "response-first" ? 1 : 0,
            );
            expect(result.current.dashboardProps().config?.aiMode).toBe(
                order === "response-first" ? "building" : "active",
            );
            (order === "response-first" ? finishApplication : finishResponse)();
            expect(result.current.copilot.getSnapshot().applications).toEqual([]);
            expect(result.current.dashboardProps().config?.aiMode).toBe("active");
            expect(result.current.copilot.getAppliedSource(dashboardTarget)).toEqual({
                conversationId: "local",
                threadId: "thread",
            });
        });

        it("cancelling creation intent does not abandon an in-flight definition application", () => {
            const { result, chatEvent, dashboardEvent, dispatch, chatDispatch } =
                setup(emptyDashboardState());
            act(() => result.current.generateDashboard("Create"));
            chatEvent(userMessage);
            chatEvent(definition);
            const correlationId = dispatch.mock.calls[0][0]["correlationId"] as string;
            act(() => result.current.cancelGeneration());
            expect(result.current.copilot.getSnapshot().applications).toHaveLength(1);
            expect(result.current.dashboardProps().config?.aiMode).toBe("building");
            expect(chatDispatch).toHaveBeenCalledTimes(2);
            dashboardEvent({ type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId });
            expect(result.current.copilot.getSnapshot().applications).toEqual([]);
            expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
            expect(result.current.copilot.getAppliedSource(dashboardTarget)).toBeDefined();
        });

        it("waits for a reply when generation finishes without a definition and sends follow-ups without starting another conversation", () => {
            const { result, chatEvent, chatDispatch } = setup(emptyDashboardState());
            act(() => result.current.generateDashboard("Create"));
            chatEvent(userMessage);
            chatEvent({
                type: "chatAssistantMessage",
                threadId: "thread",
                useCase: "GENERAL",
                skills: [{ name: "dashboard_builder", title: "Building" }],
                responseCompleted: true,
            });
            expect(result.current.dashboardProps().config?.aiMode).toBe("waiting");
            act(() => {
                result.current.replyInChat();
                result.current.sendMessage("Use revenue");
            });
            expect(chatDispatch.mock.calls.map(([action]) => action.type)).toEqual([
                "messages/startNewConversationAction",
                "messages/newMessageAction",
                "messages/activateConversationAction",
                "messages/newMessageAction",
            ]);
            expect(chatDispatch.mock.calls[2][0]).toEqual(
                activateConversationAction({ conversationId: "thread" }),
            );
        });

        it("preserves generation across the first server-thread assignment and ignores unattributable clarification", () => {
            const { result, chatEvent, chatDispatch } = setup(emptyDashboardState());
            act(() => result.current.generateDashboard("Create"));
            chatEvent({ ...userMessage, threadId: undefined });
            chatEvent({
                type: "chatConversationChanged",
                threadId: "thread",
                conversation: { id: "thread", localId: "local", createdAt: "", updatedAt: "" },
            });
            chatEvent({ ...clarification, threadId: undefined });
            expect(result.current.dashboardProps().config?.aiMode).toBe("generating");
            expect(chatDispatch).toHaveBeenCalledTimes(2);
            chatEvent(clarification);
            expect(result.current.dashboardProps().config?.aiMode).toBe("waiting");
            expect(chatDispatch).toHaveBeenLastCalledWith(
                activateConversationAction({ conversationId: "thread" }),
            );
        });

        it("can reply by local conversation identity without a backend thread", () => {
            const { result, chatEvent, chatDispatch } = setup(emptyDashboardState());
            act(() => result.current.generateDashboard("Create"));
            chatEvent({ ...userMessage, threadId: undefined });
            chatEvent({ ...clarification, threadId: "local" });
            expect(result.current.dashboardProps().config?.aiMode).toBe("waiting");
            expect(chatDispatch).toHaveBeenLastCalledWith(
                activateConversationAction({ conversationId: "local" }),
            );
        });

        it.each(["dashboard_builder", "dashboard_editor"] as const)(
            "tracks %s progress and clarification replies",
            (skill) => {
                const { result, chatEvent, chatDispatch } = setup();
                chatEvent(userMessage);
                chatEvent({
                    type: "chatAssistantMessage",
                    threadId: "thread",
                    useCase: "GENERAL",
                    responseCompleted: false,
                    skills: [{ name: skill, title: "Working" }],
                });
                expect(result.current.dashboardProps().config?.aiMode).toBe("building");
                chatEvent({ type: "chatReasoning", threadId: "thread", title: "Updating widgets" });
                expect(result.current.composingProps.copilot.getReasoningTitle()).toBe("Updating widgets");
                chatEvent(clarification);
                expect(result.current.dashboardProps().config?.aiMode).toBe("waiting");
                expect(chatDispatch).toHaveBeenCalledExactlyOnceWith(
                    activateConversationAction({ conversationId: "thread" }),
                );
                chatEvent(clarification);
                expect(chatDispatch).toHaveBeenCalledOnce();
                expect(result.current.composingProps.onReplyInChat).toBe(result.current.replyInChat);
                act(() => result.current.composingProps.onReplyInChat!());
                expect(chatDispatch).toHaveBeenCalledTimes(2);
                chatEvent({ ...clarification, responses: { "0": "Revenue" } });
                expect(result.current.dashboardProps().config?.aiMode).toBe("building");
                expect(chatDispatch).toHaveBeenCalledTimes(2);
                chatEvent({
                    type: "chatAssistantMessage",
                    threadId: "thread",
                    useCase: "GENERAL",
                    responseCompleted: true,
                    cancelled: true,
                });
                expect(result.current.dashboardProps().config?.aiMode).toBe("active");
                act(() => result.current.cancelGeneration());
                expect(result.current.dashboardProps().config?.aiMode).toBeUndefined();
            },
        );

        it("does not select a conversation when no workflow is waiting", () => {
            const { result, chatDispatch } = setup();
            act(() => result.current.replyInChat());
            expect(chatDispatch).not.toHaveBeenCalled();
        });

        it.each(["", " ", "\n\t"])("ignores blank messages %j without changing copilot state", (message) => {
            const { result, chatDispatch } = setup();
            const snapshot = result.current.copilot.getSnapshot();
            act(() => result.current.sendMessage(message));
            expect(chatDispatch).not.toHaveBeenCalled();
            expect(result.current.copilot.getSnapshot()).toBe(snapshot);
        });

        it("drops messages before the store is ready and uses its latest dispatcher without requiring a dashboard", () => {
            const { result } = renderHook(() => useDashboardCopilot());
            const first = vi.fn();
            const second = vi.fn();
            act(() => {
                result.current.sendMessage("Not queued");
                result.current.genAiStoreProps().onDispatcher!(first);
            });
            expect(first).not.toHaveBeenCalled();
            act(() => {
                result.current.sendMessage("  First message\n");
                result.current.genAiStoreProps().onDispatcher!(second);
                result.current.sendMessage("Second message");
            });
            expect(first).toHaveBeenCalledOnce();
            expect(first.mock.calls[0][0]).toMatchObject({
                type: "messages/newMessageAction",
                payload: { content: { type: "text", text: "  First message\n" } },
            });
            expect(second).toHaveBeenCalledOnce();
            expect(second.mock.calls[0][0].payload.content.text).toBe("Second message");
        });

        it("ignores all retained connection callbacks immediately after unmount", async () => {
            const { result, dispatch, chatDispatch, unmount, apply } = setup();
            const id = apply();
            const connection = result.current;
            const selector = connection.assistantProps().dashboardSelector!;
            const dispose = vi.spyOn(connection.copilot, "dispose");
            unmount();
            const snapshot = connection.copilot.getSnapshot();
            connection.sendMessage("Ignored");
            connection.generateDashboard("Ignored");
            connection.replyInChat();
            connection.dashboardProps().onStateChange!(emptyDashboardState(), dispatch);
            connection.genAiStoreProps().eventHandlers![0].handler(definition);
            connection
                .dashboardProps()
                .eventHandlers![0].handler(
                    { type: "GDC.DASH/EVT.DEFINITION_CHANGED", correlationId: id } as DashboardEvents,
                    dispatch,
                    selector,
                );
            expect(connection.copilot.getSnapshot()).toBe(snapshot);
            expect(dispatch).toHaveBeenCalledOnce();
            expect(chatDispatch).not.toHaveBeenCalled();
            await act(async () => {});
            expect(dispose).toHaveBeenCalledOnce();
        });
    });
});
