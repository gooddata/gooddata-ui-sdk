// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { type EnhancedStore } from "@reduxjs/toolkit";

import {
    type DashboardDispatch,
    type DashboardSelectorEvaluator,
    type IDashboardProps,
    anyDashboardEventHandler,
    changeDashboardDefinition,
    isDashboardCommandFailed,
    isDashboardCommandRejected,
    isDashboardDefinitionChanged,
    isDashboardDeinitialized,
    isDashboardSaved,
    selectDashboardId,
    selectDashboardLoading,
    selectIsInEditMode,
} from "@gooddata/sdk-ui-dashboard";

import { type GenAIAssistantProps } from "../components/GenAIChat.js";
import { type GenAiStoreProps } from "../components/GenAiStore.js";
import { makeUserItem } from "../model.js";
import { type ChatEvent, type ChatEventHandler } from "../store/events.js";
import {
    activateConversationAction,
    dashboardSavedAction,
    newMessageAction,
    startNewConversationAction,
} from "../store/messages/messagesSlice.js";

import { CopilotHandler } from "./CopilotHandler.js";
import { type ICopilotInteractionComposingWithHandlerProps } from "./CopilotInteractionComposingWithHandler.js";
import { selectCopilotReplyThreadId } from "./selectors.js";
import { CopilotBuildType, type ICopilotScope, type ICopilotTarget } from "./types.js";
import { useCopilotSnapshot } from "./useCopilotSnapshot.js";

/** Props and actions connecting one dashboard to a shared assistant store. @alpha */
export interface IUseDashboardCopilotResult {
    /** Hook-owned workflow handler, also usable by custom progress presentations. */
    copilot: CopilotHandler;
    /**
     * Get props for the outer GenAiStore, not the nested assistant. Appends application event handlers
     * after internal handlers and calls the internal onDispatcher before the application callback.
     * Other props pass through unchanged. Call without arguments for the default connection.
     */
    genAiStoreProps: (props?: Omit<GenAiStoreProps, "children">) => Omit<GenAiStoreProps, "children">;
    /**
     * Get props for Dashboard. Appends application event handlers after internal handlers and calls
     * the internal onStateChange before the application callback. Merges config while keeping aiMode
     * controlled by the copilot; other props pass through unchanged. Call without arguments for defaults.
     */
    dashboardProps: (props?: IDashboardProps) => IDashboardProps;
    /**
     * Get props for the assistant inside the shared GenAiStore. Keeps dashboardSelector controlled by
     * the hook to maintain ambient context; other props pass through unchanged. Attach chat event
     * handlers to the outer store using genAiStoreProps. Call without arguments for defaults.
     */
    assistantProps: (props?: GenAIAssistantProps) => GenAIAssistantProps;
    /** Pass to CopilotInteractionComposingWithHandler around the dashboard. */
    composingProps: Omit<ICopilotInteractionComposingWithHandlerProps, "children">;
    /** Send a message in the current conversation. Ignored until the shared store is ready. */
    sendMessage: (message: string) => void;
    /** Start a new conversation and generate into a new, empty dashboard in edit mode. */
    generateDashboard: (message: string) => void;
    /** Clear creation intent; this does not cancel an assistant response already streaming. */
    cancelGeneration: () => void;
    /** Select the waiting workflow's originating conversation in the shared assistant. */
    replyInChat: () => void;
}

/**
 * Connect a dashboard and assistant using one CopilotHandler and one outer GenAiStore.
 *
 * @remarks
 * Call once per dashboard/assistant pair. Call `dashboardProps`, `genAiStoreProps`, and `assistantProps` with optional
 * application props, then spread their results onto the respective components. These getters compose
 * event handlers and connection callbacks so application customizations do not replace internal wiring.
 * Spread `composingProps` directly;
 * keep the assistant beside the dashboard and wrap only the dashboard in the composing presentation.
 * Definitions are applied only to an initialized dashboard in edit mode. To generate a new dashboard,
 * mount an empty Dashboard in edit mode before calling `generateDashboard`; this hook does not navigate
 * or replace an existing saved dashboard. Remount the pair when changing backend or workspace.
 *
 * @returns Component props and actions for the connected dashboard and assistant.
 * @alpha
 */
export function useDashboardCopilot(): IUseDashboardCopilotResult {
    const [dashboardSelector, setDashboardSelector] = useState<DashboardSelectorEvaluator | null>(null);
    const connection = useMemo(() => createDashboardConnection(setDashboardSelector), []);
    const getDashboardEventHandlers = useMemo(
        () => createEventHandlersGetter(connection.dashboardProps.eventHandlers),
        [connection],
    );
    const getChatEventHandlers = useMemo(
        () => createEventHandlersGetter(connection.genAiStoreProps.eventHandlers),
        [connection],
    );
    const { copilot } = connection;
    const snapshot = useCopilotSnapshot(copilot);
    const scope: ICopilotScope = {
        type: CopilotBuildType.Dashboard,
        objectId: snapshot.context.objectId,
        isEditing: snapshot.context.isEditing,
    };
    const status = copilot.getStatus(scope);

    const genAiStoreProps = useCallback<IUseDashboardCopilotResult["genAiStoreProps"]>(
        (props = {}) => ({
            ...props,
            eventHandlers: getChatEventHandlers(props.eventHandlers),
            onDispatcher: props.onDispatcher
                ? (dispatch) => {
                      connection.genAiStoreProps.onDispatcher(dispatch);
                      props.onDispatcher?.(dispatch);
                  }
                : connection.genAiStoreProps.onDispatcher,
        }),
        [connection, getChatEventHandlers],
    );

    const dashboardProps = useCallback<IUseDashboardCopilotResult["dashboardProps"]>(
        (props = {}) => ({
            ...props,
            eventHandlers: getDashboardEventHandlers(props.eventHandlers),
            onStateChange: props.onStateChange
                ? (state, dispatch) => {
                      connection.dashboardProps.onStateChange(state, dispatch);
                      props.onStateChange?.(state, dispatch);
                  }
                : connection.dashboardProps.onStateChange,
            config: { ...props.config, aiMode: status === "idle" ? undefined : status },
        }),
        [connection, getDashboardEventHandlers, status],
    );

    const assistantProps = useCallback<IUseDashboardCopilotResult["assistantProps"]>(
        (props = {}) => ({ ...props, dashboardSelector }),
        [dashboardSelector],
    );

    useEffect(() => {
        connection.activate();
        return connection.deactivate;
    }, [connection]);

    return {
        copilot,
        genAiStoreProps,
        dashboardProps,
        assistantProps,
        composingProps: { copilot, scope, onReplyInChat: connection.replyInChat },
        sendMessage: connection.sendMessage,
        generateDashboard: connection.generateDashboard,
        cancelGeneration: connection.cancelGeneration,
        replyInChat: connection.replyInChat,
    };
}

function createEventHandlersGetter<T>(internalHandlers: T[]) {
    const cache = new WeakMap<T[], T[]>();
    return (handlers?: T[]): T[] => {
        if (!handlers) {
            return internalHandlers;
        }
        let combined = cache.get(handlers);
        if (!combined) {
            combined = [...internalHandlers, ...handlers];
            cache.set(handlers, combined);
        }
        return combined;
    };
}

function createDashboardConnection(
    onSelectorChange: (selector: () => DashboardSelectorEvaluator | null) => void,
) {
    const type = CopilotBuildType.Dashboard;
    let active = true;
    let dashboardDispatch: DashboardDispatch | undefined;
    let chatDispatch: EnhancedStore["dispatch"] | undefined;
    const applications = new Map<string, ICopilotTarget>();

    const copilot = new CopilotHandler({
        registrations: [
            {
                type,
                skills: ["dashboard_builder", "dashboard_editor"],
                resolveDefinition: (event, context, snapshot) => {
                    if (
                        !dashboardDispatch ||
                        !context.isEditing ||
                        event.definitionType !== "dashboard" ||
                        !event.dashboard
                    ) {
                        return undefined;
                    }
                    const ownsGeneration = snapshot.requests.some(
                        (request) =>
                            !request.superseded &&
                            request.revision > (snapshot.generationRevision ?? 0) &&
                            request.conversationId === event.conversationId &&
                            (request.generation === type ||
                                (request.type === type && request.intent === "create")),
                    );
                    return event.dashboard.identifier === context.objectId || ownsGeneration
                        ? { type, objectId: event.dashboard.identifier }
                        : undefined;
                },
                onApplyDefinition: (event, applicationId, target) => {
                    applications.set(applicationId, target);
                    try {
                        dashboardDispatch!(
                            changeDashboardDefinition(
                                event.dashboard!,
                                { insights: event.insights ?? [] },
                                applicationId,
                            ),
                        );
                    } catch (error) {
                        applications.delete(applicationId);
                        throw error;
                    }
                },
            },
        ],
        onClarificationQuestions: () => replyInChat(),
    });

    function interruptApplications() {
        for (const id of applications.keys()) {
            copilot.definitionApplicationInterrupted(id);
        }
        applications.clear();
    }

    function disconnectDashboard() {
        dashboardDispatch = undefined;
        interruptApplications();
        copilot.resetInteraction();
        copilot.cancelGeneration(type);
        copilot.setContext({});
        onSelectorChange(() => null);
    }

    function replyInChat() {
        if (!active) {
            return;
        }
        const snapshot = copilot.getSnapshot();
        const conversationId = selectCopilotReplyThreadId(snapshot, { type, ...snapshot.context });
        if (conversationId) {
            chatDispatch?.(activateConversationAction({ conversationId }));
        }
    }

    function sendMessage(message: string) {
        if (active && message.trim()) {
            chatDispatch?.(newMessageAction(makeUserItem({ type: "text", text: message })));
        }
    }

    const chatEventHandler: ChatEventHandler<ChatEvent> = {
        eval: (event): event is ChatEvent => event !== undefined,
        handler: (event) => {
            if (active) {
                copilot.handleEvent(event);
            }
        },
    };

    return {
        copilot,
        genAiStoreProps: {
            eventHandlers: [chatEventHandler],
            onDispatcher: (dispatch: EnhancedStore["dispatch"]) => {
                chatDispatch = dispatch;
            },
        },
        dashboardProps: {
            onStateChange: (state, dispatch) => {
                if (!active) {
                    return;
                }
                const loading = selectDashboardLoading(state);
                if (loading.loading || !loading.result) {
                    if (dashboardDispatch) {
                        disconnectDashboard();
                    }
                    return;
                }
                if (dashboardDispatch && dashboardDispatch !== dispatch) {
                    disconnectDashboard();
                }
                dashboardDispatch = dispatch;
                const selector: DashboardSelectorEvaluator = (select) => select(state);
                copilot.setContext({
                    type,
                    objectId: selectDashboardId(state),
                    isEditing: selectIsInEditMode(state),
                });
                onSelectorChange(() => selector);
            },
            eventHandlers: [
                anyDashboardEventHandler((event) => {
                    if (!active) {
                        return;
                    }
                    if (isDashboardDeinitialized(event)) {
                        disconnectDashboard();
                        return;
                    }
                    const target = event.correlationId ? applications.get(event.correlationId) : undefined;
                    if (target && event.correlationId) {
                        if (isDashboardDefinitionChanged(event)) {
                            applications.delete(event.correlationId);
                            copilot.definitionApplied(event.correlationId, target);
                        } else if (isDashboardCommandFailed(event) || isDashboardCommandRejected(event)) {
                            applications.delete(event.correlationId);
                            copilot.definitionApplicationInterrupted(event.correlationId);
                        }
                    }
                    if (isDashboardSaved(event)) {
                        const { dashboard, originalDashboardId, savedInsights } = event.payload;
                        const source = copilot.getAppliedSource({
                            type,
                            objectId: originalDashboardId ?? dashboard.identifier,
                        });
                        if (source) {
                            chatDispatch?.(
                                dashboardSavedAction({
                                    conversationId: source.conversationId,
                                    originalDashboardId: originalDashboardId ?? dashboard.identifier,
                                    savedDashboardId: dashboard.identifier,
                                    savedInsights: savedInsights ?? [],
                                }),
                            );
                        }
                    }
                }),
            ],
        } satisfies Pick<IDashboardProps, "onStateChange" | "eventHandlers">,
        sendMessage,
        generateDashboard: (message: string) => {
            if (!active || !chatDispatch || !dashboardDispatch || !message.trim()) {
                return;
            }
            const { context } = copilot.getSnapshot();
            if (!context.isEditing || context.objectId) {
                return;
            }
            copilot.startGeneration(type);
            chatDispatch(startNewConversationAction());
            sendMessage(message);
        },
        cancelGeneration: () => copilot.cancelGeneration(type),
        replyInChat,
        activate: () => {
            active = true;
        },
        deactivate: () => {
            active = false;
            interruptApplications();
            // React StrictMode replays effects before this microtask; do not dispose a reactivated instance.
            queueMicrotask(() => {
                if (!active) {
                    copilot.dispose();
                }
            });
        },
    };
}
