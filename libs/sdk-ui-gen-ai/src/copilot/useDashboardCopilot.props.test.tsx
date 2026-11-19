// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { type Mock, describe, expect, it, vi } from "vitest";

import { type IDashboard, idRef } from "@gooddata/sdk-model";
import {
    type DashboardDispatch,
    type DashboardEventHandler,
    type DashboardEvents,
    type DashboardSelectorEvaluator,
    type DashboardState,
    type IDashboardProps,
    anyDashboardEventHandler,
    selectDashboardId,
    selectIsInEditMode,
} from "@gooddata/sdk-ui-dashboard";

import { type LinkHandlerEvent } from "../components/ConfigContext.js";
import { type GenAIAssistantProps } from "../components/GenAIChat.js";
import { type GenAiStoreProps } from "../components/GenAiStore.js";
import { type ChatDefinitionReceivedEvent, type ChatEvent, type ChatEventHandler } from "../store/events.js";
import { newMessageAction } from "../store/messages/messagesSlice.js";

import { CopilotBuildType } from "./types.js";
import { useDashboardCopilot } from "./useDashboardCopilot.js";

type StoreProps = Omit<GenAiStoreProps, "children">;

function freeze<T>(value: T): T {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
        Object.values(value).forEach(freeze);
        Object.freeze(value);
    }
    return value;
}

const dashboard = freeze<IDashboard>({
    type: "IDashboard",
    identifier: "dashboard",
    ref: idRef("dashboard", "analyticalDashboard"),
    uri: "/dashboard",
    title: "Dashboard",
    description: "",
    created: "2026-01-01",
    updated: "2026-01-01",
    shareStatus: "private",
});

const definition = freeze<ChatDefinitionReceivedEvent>({
    type: "onDefinitionReceived",
    definitionType: "dashboard",
    itemId: "item",
    conversationId: "local",
    threadId: "thread",
    dashboard,
});

const deinitialized = freeze({ type: "GDC.DASH/EVT.DEINITIALIZED" } as DashboardEvents);

function dashboardState(isEditing = true, persistedDashboard = dashboard): DashboardState {
    return freeze({
        meta: { persistedDashboard },
        renderMode: { renderMode: isEditing ? "edit" : "view" },
        loading: { loading: false, result: true },
    } as DashboardState);
}

function setup() {
    return {
        ...renderHook(() => useDashboardCopilot()),
        dispatch: vi.fn<DashboardDispatch>() as Mock<DashboardDispatch> & DashboardDispatch,
        chatDispatch: vi.fn(),
    };
}

function emitDashboardEvent(
    props: IDashboardProps,
    event: DashboardEvents,
    dispatch: DashboardDispatch,
    selector: DashboardSelectorEvaluator,
) {
    act(() => {
        for (const { eval: matches, handler } of props.eventHandlers!) {
            if (matches(event)) {
                handler(event, dispatch, selector);
            }
        }
    });
}

function emitChatEvent(props: StoreProps, event: ChatEvent) {
    act(() => {
        for (const { eval: matches, handler } of props.eventHandlers!) {
            if (matches(event)) {
                handler(event);
            }
        }
    });
}

const handlerCases = [
    { handlers: "absent", handlerCount: undefined },
    { handlers: "empty", handlerCount: 0 },
    { handlers: "multiple", handlerCount: 2 },
] as const;

const configCases: { configName: string; config?: IDashboardProps["config"] }[] = [
    { configName: "absent" },
    { configName: "empty", config: freeze({}) },
    {
        configName: "custom",
        config: freeze({ initialRenderMode: "edit" as const, enableInsightEditing: true }),
    },
    ...([undefined, null, "active", "generating", "building", "waiting"] as const).map((aiMode) => ({
        configName: `custom aiMode=${String(aiMode)}`,
        config: freeze({ initialRenderMode: "view" as const, enableInsightEditing: false, aiMode }),
    })),
];

const dashboardCases = handlerCases.flatMap((handlers) =>
    [false, true].flatMap((stateCallback) =>
        configCases.map((config) => ({ ...handlers, stateCallback, ...config })),
    ),
);

const storeCases = handlerCases.flatMap((handlers) =>
    [false, true].map((dispatcherCallback) => ({ ...handlers, dispatcherCallback })),
);

const assistantCases = (["absent", "undefined", "null", "custom"] as const).flatMap((selectorOverride) =>
    (["uninitialized", "initialized", "deinitialized"] as const).map((phase) => ({
        selectorOverride,
        phase,
    })),
);

describe("useDashboardCopilot prop getter combinations", () => {
    describe.each(["dashboardProps", "genAiStoreProps"] as const)("%s handler identity", (getter) => {
        it.each(handlerCases)(
            "caches handlers=$handlers by the caller array across renders",
            ({ handlerCount }) => {
                const { result, rerender, dispatch } = setup();
                const eventHandlers = freeze(
                    Array.from({ length: handlerCount ?? 0 }, () => ({
                        eval: (event: unknown): event is never => !!event,
                        handler: vi.fn(),
                    })),
                );
                const input = handlerCount === undefined ? {} : { eventHandlers };
                const initial = result.current[getter](input).eventHandlers;
                const otherInput = { eventHandlers: [...eventHandlers] };
                const other = result.current[getter](otherInput).eventHandlers;

                expect(result.current[getter]({ ...input }).eventHandlers).toBe(initial);
                expect(result.current[getter](otherInput).eventHandlers).toBe(other);
                expect(other).not.toBe(initial);
                rerender();
                expect(result.current[getter]({ ...input }).eventHandlers).toBe(initial);

                act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
                emitChatEvent(result.current.genAiStoreProps(), definition);
                expect(result.current.dashboardProps().config?.aiMode).toBe("building");
                expect(result.current[getter]({ ...input }).eventHandlers).toBe(initial);
                expect(result.current[getter](otherInput).eventHandlers).toBe(other);
                expect(initial).toHaveLength(1 + (handlerCount ?? 0));
                expect(eventHandlers).toHaveLength(handlerCount ?? 0);
            },
        );
    });

    it("refreshes the assistant selector on every initialized dashboard notification", () => {
        const { result, dispatch } = setup();
        const onStateChange = vi.fn();
        const props = result.current.dashboardProps({ onStateChange });
        const state = dashboardState();
        act(() => props.onStateChange!(state, dispatch));
        let selector = result.current.assistantProps().dashboardSelector;
        const repeatedStates = [state, { ...state }, { ...state, loading: { ...state.loading } }];

        for (const repeated of repeatedStates) {
            act(() => props.onStateChange!(repeated, dispatch));
            const updatedSelector = result.current.assistantProps().dashboardSelector!;
            expect(updatedSelector).not.toBe(selector);
            expect(updatedSelector((current) => current)).toBe(repeated);
            selector = updatedSelector;
        }

        expect(onStateChange.mock.calls).toEqual(
            [state, ...repeatedStates].map((current) => [current, dispatch]),
        );
    });

    it.each([
        "meta",
        "tabs",
        "renderMode",
        "ui",
        "drill",
        "unavailableObjects",
        "catalog",
        "executionResults",
        "config",
    ] as const)("refreshes the assistant selector when %s changes", (slice) => {
        const { result, dispatch } = setup();
        const state = dashboardState();
        act(() => result.current.dashboardProps().onStateChange!(state, dispatch));
        const initial = result.current.assistantProps().dashboardSelector;
        const changed = { ...state, [slice]: { ...state[slice] } } as DashboardState;

        act(() => result.current.dashboardProps().onStateChange!(changed, dispatch));

        const selector = result.current.assistantProps().dashboardSelector!;
        expect(selector).not.toBe(initial);
        expect(selector((current) => current)).toBe(changed);
    });

    it.each(["dispatch", "deinitialize", "loading"] as const)(
        "refreshes the assistant selector after reconnecting via %s to the same state",
        (reason) => {
            const { result, dispatch } = setup();
            const state = dashboardState();
            const props = result.current.dashboardProps();
            act(() => props.onStateChange!(state, dispatch));
            const initial = result.current.assistantProps().dashboardSelector!;
            if (reason === "deinitialize") {
                emitDashboardEvent(props, deinitialized, dispatch, initial);
            }
            if (reason === "loading") {
                act(() => props.onStateChange!({ ...state, loading: { loading: true } }, dispatch));
            }
            const nextDispatch =
                reason === "dispatch"
                    ? (vi.fn<DashboardDispatch>() as Mock<DashboardDispatch> & DashboardDispatch)
                    : dispatch;

            act(() => props.onStateChange!(state, nextDispatch));

            const selector = result.current.assistantProps().dashboardSelector!;
            expect(selector).not.toBe(initial);
            expect(selector((current) => current)).toBe(state);
            emitChatEvent(result.current.genAiStoreProps(), definition);
            expect(nextDispatch).toHaveBeenCalledOnce();
        },
    );

    it.each(dashboardCases)(
        "composes dashboard handlers=$handlers, stateCallback=$stateCallback, config=$configName",
        ({ handlerCount, stateCallback, config }) => {
            const { result, dispatch } = setup();
            const state = dashboardState();
            const order: string[] = [];
            const onStateChange = vi.fn<NonNullable<IDashboardProps["onStateChange"]>>((receivedState) => {
                expect(result.current.copilot.getSnapshot().context).toEqual({
                    type: CopilotBuildType.Dashboard,
                    objectId: selectDashboardId(receivedState),
                    isEditing: selectIsInEditMode(receivedState),
                });
                order.push("state");
            });
            const callbacks = Array.from({ length: handlerCount ?? 0 }, (_, index) =>
                vi.fn<DashboardEventHandler["handler"]>(() => {
                    expect(result.current.copilot.getSnapshot().context).toEqual({});
                    expect(result.current.copilot.getSnapshot().applications).toEqual([]);
                    order.push(`handler-${index}`);
                }),
            );
            const eventHandlers = callbacks.map((callback) => anyDashboardEventHandler(callback));
            const input = freeze<IDashboardProps>({
                dashboard,
                workspace: "custom-workspace",
                initialTabId: "custom-tab",
                ...(handlerCount === undefined ? {} : { eventHandlers }),
                ...(stateCallback ? { onStateChange } : {}),
                ...(config === undefined ? {} : { config }),
            });
            const defaults = result.current.dashboardProps();
            const composed = result.current.dashboardProps(input);
            const repeated = result.current.dashboardProps(input);

            for (const props of [composed, repeated]) {
                expect(props.eventHandlers).toEqual([...defaults.eventHandlers!, ...eventHandlers]);
                expect(props.config).toEqual({ ...config, aiMode: undefined });
                expect(props.dashboard).toBe(dashboard);
                expect(props.workspace).toBe(input.workspace);
                expect(props.initialTabId).toBe(input.initialTabId);
            }
            expect(result.current.dashboardProps().eventHandlers).toEqual(defaults.eventHandlers);
            expect(result.current.dashboardProps({ eventHandlers: [] }).eventHandlers).toHaveLength(1);
            expect(onStateChange).not.toHaveBeenCalled();
            callbacks.forEach((callback) => expect(callback).not.toHaveBeenCalled());

            act(() => composed.onStateChange!(state, dispatch));
            expect(result.current.copilot.getSnapshot().context).toEqual({
                type: CopilotBuildType.Dashboard,
                objectId: "dashboard",
                isEditing: true,
            });
            expect(result.current.assistantProps().dashboardSelector!(selectDashboardId)).toBe("dashboard");
            expect(onStateChange.mock.calls).toEqual(stateCallback ? [[state, dispatch]] : []);
            expect(onStateChange.mock.calls[0]?.[0]).toBe(stateCallback ? state : undefined);
            expect(onStateChange.mock.calls[0]?.[1]).toBe(stateCallback ? dispatch : undefined);

            emitChatEvent(result.current.genAiStoreProps(), definition);
            expect(dispatch).toHaveBeenCalledOnce();
            expect(result.current.copilot.getSnapshot().applications).toHaveLength(1);
            const building = result.current.dashboardProps(input);
            expect(building.config).toEqual({ ...config, aiMode: "building" });
            expect(result.current.dashboardProps().config?.aiMode).toBe("building");
            expect(composed.config).toEqual({ ...config, aiMode: undefined });

            const selector = result.current.assistantProps().dashboardSelector!;
            emitDashboardEvent(building, deinitialized, dispatch, selector);
            callbacks.forEach((callback) => {
                expect(callback).toHaveBeenCalledExactlyOnceWith(deinitialized, dispatch, selector);
                expect(callback.mock.calls[0][0]).toBe(deinitialized);
                expect(callback.mock.calls[0][1]).toBe(dispatch);
                expect(callback.mock.calls[0][2]).toBe(selector);
            });
            expect(order).toEqual([
                ...(stateCallback ? ["state"] : []),
                ...callbacks.map((_, index) => `handler-${index}`),
            ]);
            expect(result.current.assistantProps().dashboardSelector).toBeNull();
            expect(result.current.dashboardProps(input).config).toEqual({ ...config, aiMode: undefined });
            expect(building.config?.aiMode).toBe("building");
            expect(result.current.dashboardProps().eventHandlers).toEqual(defaults.eventHandlers);
            expect(input.config).toBe(config);
            expect(input.eventHandlers).toBe(handlerCount === undefined ? undefined : eventHandlers);
            expect(eventHandlers).toHaveLength(handlerCount ?? 0);
        },
    );

    it.each(storeCases)(
        "composes store handlers=$handlers, dispatcherCallback=$dispatcherCallback",
        ({ handlerCount, dispatcherCallback }) => {
            const { result, dispatch, chatDispatch } = setup();
            act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
            const order: number[] = [];
            const onDispatcher = vi.fn<NonNullable<StoreProps["onDispatcher"]>>((receivedDispatch) => {
                expect(receivedDispatch).toBe(chatDispatch);
                result.current.sendMessage("From the application callback");
                expect(chatDispatch).toHaveBeenCalledOnce();
            });
            const callbacks = Array.from({ length: handlerCount ?? 0 }, (_, index) =>
                vi.fn((event: ChatEvent) => {
                    expect(event).toBe(definition);
                    expect(dispatch).toHaveBeenCalledOnce();
                    expect(result.current.copilot.getSnapshot().applications).toHaveLength(1);
                    order.push(index);
                }),
            );
            const eventHandlers: ChatEventHandler<ChatEvent>[] = callbacks.map((handler) => ({
                eval: (event): event is ChatEvent => event.type === "onDefinitionReceived",
                handler,
            }));
            const input = freeze<StoreProps>({
                workspace: "custom-workspace",
                includeTags: ["included"],
                excludeTags: ["excluded"],
                isPreview: false,
                allowInteractionIntelligence: false,
                ...(handlerCount === undefined ? {} : { eventHandlers }),
                ...(dispatcherCallback ? { onDispatcher } : {}),
            });
            const defaults = result.current.genAiStoreProps();
            const composed = result.current.genAiStoreProps(input);
            const repeated = result.current.genAiStoreProps(input);

            for (const props of [composed, repeated]) {
                expect(props.eventHandlers).toEqual([...defaults.eventHandlers!, ...eventHandlers]);
                expect(props.workspace).toBe(input.workspace);
                expect(props.includeTags).toBe(input.includeTags);
                expect(props.excludeTags).toBe(input.excludeTags);
                expect(props.isPreview).toBe(false);
                expect(props.allowInteractionIntelligence).toBe(false);
            }
            expect(result.current.genAiStoreProps().eventHandlers).toEqual(defaults.eventHandlers);
            expect(result.current.genAiStoreProps({ eventHandlers: [] }).eventHandlers).toHaveLength(1);
            expect(onDispatcher).not.toHaveBeenCalled();
            act(() => composed.onDispatcher!(chatDispatch));
            expect(onDispatcher.mock.calls).toEqual(dispatcherCallback ? [[chatDispatch]] : []);
            expect(onDispatcher.mock.calls[0]?.[0]).toBe(dispatcherCallback ? chatDispatch : undefined);
            act(() => result.current.sendMessage("After connection"));
            expect(chatDispatch).toHaveBeenCalledTimes(dispatcherCallback ? 2 : 1);
            expect(chatDispatch).toHaveBeenLastCalledWith(
                expect.objectContaining({ type: newMessageAction.type }),
            );

            emitChatEvent(composed, definition);
            expect(dispatch).toHaveBeenCalledOnce();
            expect(result.current.copilot.getSnapshot().applications).toHaveLength(1);
            callbacks.forEach((callback) => expect(callback).toHaveBeenCalledExactlyOnceWith(definition));
            expect(order).toEqual(callbacks.map((_, index) => index));
            expect(result.current.genAiStoreProps().eventHandlers).toEqual(defaults.eventHandlers);
            expect(input.eventHandlers).toBe(handlerCount === undefined ? undefined : eventHandlers);
            expect(eventHandlers).toHaveLength(handlerCount ?? 0);
        },
    );

    it("keeps dashboard customizations independent across interleaved getter calls", () => {
        const { result, dispatch } = setup();
        const firstCallback = vi.fn();
        const secondCallback = vi.fn();
        const firstHandler = vi.fn();
        const secondHandler = vi.fn();
        const first = freeze<IDashboardProps>({
            dashboard: "first-dashboard",
            workspace: "first-workspace",
            config: { initialRenderMode: "edit", enableInsightEditing: true, aiMode: "waiting" },
            eventHandlers: [anyDashboardEventHandler(firstHandler)],
            onStateChange: firstCallback,
        });
        const second = freeze<IDashboardProps>({
            dashboard: "second-dashboard",
            workspace: "second-workspace",
            config: { initialRenderMode: "view", enableInsightEditing: false, aiMode: null },
            eventHandlers: [anyDashboardEventHandler(secondHandler)],
            onStateChange: secondCallback,
        });
        const inputs: (IDashboardProps | undefined)[] = [
            first,
            second,
            first,
            undefined,
            freeze({ eventHandlers: [] }),
        ];
        const outputs = inputs.map((input) => result.current.dashboardProps(input));
        expect(outputs.map((props) => props.eventHandlers!.length)).toEqual([2, 2, 2, 1, 1]);

        const states = inputs.map((_, index) =>
            dashboardState(index % 2 === 0, { ...dashboard, identifier: `dashboard-${index}` }),
        );
        outputs.forEach((props, index) => {
            act(() => props.onStateChange!(states[index], dispatch));
            expect(result.current.assistantProps().dashboardSelector!(selectDashboardId)).toBe(
                `dashboard-${index}`,
            );
            expect(result.current.copilot.getSnapshot().context.isEditing).toBe(index % 2 === 0);
            const selector = result.current.assistantProps().dashboardSelector!;
            emitDashboardEvent(props, deinitialized, dispatch, selector);
            expect(props.workspace).toBe(inputs[index]?.workspace);
            expect(props.dashboard).toBe(inputs[index]?.dashboard);
            expect(props.config).toEqual({ ...inputs[index]?.config, aiMode: undefined });
        });

        expect(firstCallback.mock.calls).toEqual([
            [states[0], dispatch],
            [states[2], dispatch],
        ]);
        expect(secondCallback).toHaveBeenCalledExactlyOnceWith(states[1], dispatch);
        expect(firstHandler).toHaveBeenCalledTimes(2);
        expect(secondHandler).toHaveBeenCalledOnce();
        expect(first.eventHandlers).toHaveLength(1);
        expect(second.eventHandlers).toHaveLength(1);
        expect(result.current.dashboardProps().eventHandlers).toHaveLength(1);
    });

    it("keeps store customizations independent across interleaved getter calls", () => {
        const { result, dispatch } = setup();
        act(() => result.current.dashboardProps().onStateChange!(dashboardState(), dispatch));
        const firstCallback = vi.fn();
        const secondCallback = vi.fn();
        const firstHandler = vi.fn();
        const secondHandler = vi.fn();
        const first = freeze<StoreProps>({
            workspace: "first-workspace",
            includeTags: ["first-tag"],
            eventHandlers: [{ eval: (event): event is ChatEvent => !!event, handler: firstHandler }],
            onDispatcher: firstCallback,
        });
        const second = freeze<StoreProps>({
            workspace: "second-workspace",
            excludeTags: ["second-tag"],
            eventHandlers: [{ eval: (event): event is ChatEvent => !!event, handler: secondHandler }],
            onDispatcher: secondCallback,
        });
        const inputs: (StoreProps | undefined)[] = [
            first,
            second,
            first,
            undefined,
            freeze({ eventHandlers: [] }),
        ];
        const outputs = inputs.map((input) => result.current.genAiStoreProps(input));
        expect(outputs.map((props) => props.eventHandlers!.length)).toEqual([2, 2, 2, 1, 1]);
        const dispatchers = outputs.map(() => vi.fn());
        const events = outputs.map((_, index) => freeze({ ...definition, conversationId: `local-${index}` }));

        outputs.forEach((props, index) => {
            act(() => {
                props.onDispatcher!(dispatchers[index]);
                result.current.sendMessage(`Message ${index}`);
            });
            expect(dispatchers[index]).toHaveBeenCalledOnce();
            emitChatEvent(props, events[index]);
            expect(dispatch).toHaveBeenCalledTimes(index + 1);
            expect(props.workspace).toBe(inputs[index]?.workspace);
            expect(props.includeTags).toBe(inputs[index]?.includeTags);
            expect(props.excludeTags).toBe(inputs[index]?.excludeTags);
        });

        dispatchers.forEach((dispatcher) => expect(dispatcher).toHaveBeenCalledOnce());
        expect(firstCallback.mock.calls).toEqual([[dispatchers[0]], [dispatchers[2]]]);
        expect(secondCallback).toHaveBeenCalledExactlyOnceWith(dispatchers[1]);
        expect(firstHandler.mock.calls).toEqual([[events[0]], [events[2]]]);
        expect(secondHandler).toHaveBeenCalledExactlyOnceWith(events[1]);
        expect(first.eventHandlers).toHaveLength(1);
        expect(second.eventHandlers).toHaveLength(1);
        expect(result.current.genAiStoreProps().eventHandlers).toHaveLength(1);
    });

    it.each(assistantCases)(
        "controls the assistant selector=$selectorOverride while $phase and isolates other props",
        ({ selectorOverride, phase }) => {
            const { result, dispatch, chatDispatch } = setup();
            const state = dashboardState();
            if (phase !== "uninitialized") {
                act(() => result.current.dashboardProps().onStateChange!(state, dispatch));
            }
            if (phase === "deinitialized") {
                emitDashboardEvent(
                    result.current.dashboardProps(),
                    deinitialized,
                    dispatch,
                    result.current.assistantProps().dashboardSelector!,
                );
            }
            const customSelector = vi.fn<() => never>(() => {
                throw new Error("Application selector must not replace the controlled selector");
            });
            const selectorOverrides = {
                absent: {},
                undefined: { dashboardSelector: undefined },
                null: { dashboardSelector: null },
                custom: { dashboardSelector: customSelector },
            };
            const selectorProps: Pick<GenAIAssistantProps, "dashboardSelector"> =
                selectorOverrides[selectorOverride];
            const onModeChange = vi.fn();
            const onDispatcher = vi.fn();
            const onLinkClick = vi.fn(() => "/custom-dashboard");
            const eventHandler = vi.fn();
            const first = freeze<GenAIAssistantProps>({
                ...selectorProps,
                workspace: "first-workspace",
                locale: "en-US",
                className: "first-assistant",
                mode: "docked",
                inputPlaceholder: "First prompt",
                slots: { Disclaimer: () => null },
                includeTags: ["first-tag"],
                eventHandlers: [{ eval: (event): event is ChatEvent => !!event, handler: eventHandler }],
                allowNativeLinks: false,
                disableManage: false,
                disableAnalyze: false,
                disableFullControl: false,
                onModeChange,
                onDispatcher,
                onLinkClick,
            });
            const second = freeze<GenAIAssistantProps>({
                ...selectorProps,
                workspace: "second-workspace",
                locale: "fr-FR",
                className: "second-assistant",
                mode: "fullscreen",
                inputPlaceholder: "",
                slots: { Disclaimer: () => null },
                allowNativeLinks: true,
                disableManage: true,
                disableAnalyze: true,
                disableFullControl: true,
            });
            const controlledSelector = result.current.assistantProps().dashboardSelector;
            const firstOutput = result.current.assistantProps(first);
            const secondOutput = result.current.assistantProps(second);
            const repeated = result.current.assistantProps(first);

            for (const [input, output] of [
                [first, firstOutput],
                [second, secondOutput],
                [first, repeated],
            ]) {
                expect(output).toEqual({ ...input, dashboardSelector: controlledSelector });
                expect(output.slots).toBe(input.slots);
                expect(output.eventHandlers).toBe(input.eventHandlers);
                expect(output.includeTags).toBe(input.includeTags);
                expect(output.dashboardSelector).toBe(phase === "initialized" ? controlledSelector : null);
                expect(output.dashboardSelector?.(selectDashboardId)).toBe(
                    phase === "initialized" ? "dashboard" : undefined,
                );
                expect(output.dashboardSelector?.(selectIsInEditMode)).toBe(
                    phase === "initialized" ? true : undefined,
                );
                expect(output.dashboardSelector?.((selectedState) => selectedState)).toBe(
                    phase === "initialized" ? state : undefined,
                );
            }
            expect(result.current.assistantProps()).toEqual({ dashboardSelector: controlledSelector });
            expect(result.current.assistantProps({})).toEqual({ dashboardSelector: controlledSelector });
            expect(firstOutput.onModeChange).toBe(onModeChange);
            expect(firstOutput.onDispatcher).toBe(onDispatcher);
            expect(firstOutput.onLinkClick).toBe(onLinkClick);
            firstOutput.onModeChange!("fullscreen");
            firstOutput.onDispatcher!(chatDispatch);
            const link = freeze<LinkHandlerEvent>({
                type: "dashboard",
                id: "linked-dashboard",
                workspaceId: "first-workspace",
                newTab: false,
                itemUrl: "/dashboard",
                action: "open",
                preventDefault: vi.fn(),
            });
            expect(firstOutput.onLinkClick!(link)).toBe("/custom-dashboard");
            emitChatEvent(firstOutput, definition);
            act(() => result.current.sendMessage("Requires the outer store connection"));
            expect(onModeChange).toHaveBeenCalledExactlyOnceWith("fullscreen");
            expect(onDispatcher).toHaveBeenCalledExactlyOnceWith(chatDispatch);
            expect(onLinkClick).toHaveBeenCalledExactlyOnceWith(link);
            expect(eventHandler).toHaveBeenCalledExactlyOnceWith(definition);
            expect(chatDispatch).not.toHaveBeenCalled();
            expect(dispatch).not.toHaveBeenCalled();
            expect(result.current.copilot.getSnapshot().applications).toEqual([]);
            expect(customSelector).not.toHaveBeenCalled();
            expect(first.dashboardSelector).toBe(selectorProps.dashboardSelector);
            expect(secondOutput.onModeChange).toBeUndefined();
            expect(secondOutput.onDispatcher).toBeUndefined();
            expect(secondOutput.onLinkClick).toBeUndefined();
            expect(secondOutput.eventHandlers).toBeUndefined();
        },
    );
});
