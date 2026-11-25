// (C) 2026 GoodData Corporation

import {
    type ChatAssistantMessageEvent,
    type ChatClarificationQuestionsEvent,
    type ChatConversationChangedEvent,
    type ChatEvent,
} from "../store/events.js";

import {
    buildIntent,
    clarificationIds,
    conversationId,
    emptyInteraction,
    failedResponse,
    isUserInputEvent,
    matches,
} from "./transitionUtils.js";
import {
    type ICopilotInteraction,
    type ICopilotRegistration,
    type ICopilotRequest,
    type ICopilotSnapshot,
} from "./types.js";

/** Assigning a draft's first backend thread must preserve its foreground progress. */
function isInitialThreadAssignment<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatConversationChangedEvent,
    foreground: boolean,
): boolean {
    const origin = conversationId(event);
    return (
        !!origin &&
        state.requests.some((request) => request.conversationId === origin) &&
        (!state.interaction.threadId || foreground) &&
        (!state.interaction.conversationId || state.interaction.conversationId === origin)
    );
}

function transitionConversation<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatConversationChangedEvent,
    foreground: boolean,
): ICopilotInteraction<TBuild> {
    const interaction = state.interaction;
    const origin = conversationId(event);
    const initialAssignment = isInitialThreadAssignment(state, event, foreground);
    return {
        ...(initialAssignment ? interaction : emptyInteraction<TBuild>()),
        conversationId: origin,
        threadId: event.threadId,
    };
}

function transitionInteraction<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    foreground: boolean,
): ICopilotInteraction<TBuild> {
    const interaction = state.interaction;
    switch (event.type) {
        case "chatReasoning":
            return foreground && interaction.reasoningTitle !== event.title
                ? { ...interaction, reasoningTitle: event.title }
                : interaction;
        case "chatUserMessage":
        case "chatUserAnswers": {
            const ongoing = matches(interaction, event.threadId, conversationId(event))
                ? interaction
                : emptyInteraction<TBuild>();
            return {
                ...ongoing,
                conversationId: conversationId(event),
                threadId: event.threadId,
                reasoningTitle: undefined,
                waitingForUserInput: false,
                ...(event.type === "chatUserAnswers"
                    ? {
                          pendingClarificationIds: ongoing.pendingClarificationIds.filter(
                              (id) => id !== event.interactionId,
                          ),
                      }
                    : {}),
            };
        }
        case "chatReset":
            return emptyInteraction();
        case "chatConversationChanged":
            return transitionConversation(state, event, foreground);
        default:
            return interaction;
    }
}

function transitionAssistant<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatAssistantMessageEvent,
    registration: ICopilotRegistration<TBuild> | undefined,
    pending: ICopilotRequest<TBuild> | undefined,
): Pick<ICopilotSnapshot<TBuild>, "interaction" | "generation"> {
    let interaction = state.interaction;
    let generation = state.generation;
    if (failedResponse(event)) {
        generation = undefined;
        interaction = emptyInteraction();
    } else if (registration) {
        interaction = {
            ...interaction,
            build: {
                type: registration.type,
                intent: buildIntent(state, registration.type, pending),
            },
            waitingForUserInput:
                interaction.waitingForUserInput ||
                !!(event.responseCompleted && !interaction.pendingClarificationIds.length),
        };
        generation = undefined;
    } else if (
        event.responseCompleted &&
        !interaction.pendingClarificationIds.length &&
        (generation || interaction.build)
    ) {
        interaction = { ...interaction, waitingForUserInput: true };
    }
    if (event.responseCompleted && interaction.build?.intent === "edit") {
        interaction = { ...interaction, build: undefined, waitingForUserInput: false };
    }
    return { interaction, generation };
}

function transitionClarification<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatClarificationQuestionsEvent,
): Pick<ICopilotSnapshot<TBuild>, "interaction" | "generation"> {
    // Null dismisses the form before a typed reply; it does not cancel the owning workflow.
    const interaction = state.interaction;
    return {
        generation: state.generation,
        interaction: {
            ...interaction,
            waitingForUserInput: event.responses === undefined ? interaction.waitingForUserInput : false,
            pendingClarificationIds: clarificationIds(interaction.pendingClarificationIds, event),
        },
    };
}

/** Before backend assignment, failures may identify the draft using its local conversation ID. */
function isDraftFailure<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    pending: ICopilotRequest<TBuild> | undefined,
): boolean {
    return (
        event.type === "chatAssistantMessage" &&
        failedResponse(event) &&
        !state.interaction.threadId &&
        !!pending &&
        !pending.threadId &&
        !pending.responseFinished &&
        !!event.threadId &&
        event.threadId === state.interaction.conversationId &&
        pending.conversationId === state.interaction.conversationId
    );
}

/** Threadless events can update foreground work only while the foreground is also unassigned. */
function isUnassignedForegroundResponse<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    pending: ICopilotRequest<TBuild> | undefined,
): boolean {
    return (
        !event.threadId &&
        !state.interaction.threadId &&
        (!!pending || state.generation !== undefined || !!state.interaction.build)
    );
}

function isForegroundResponse<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    pending: ICopilotRequest<TBuild> | undefined,
    foreground: boolean,
): boolean {
    // Target navigation clears the thread but retains the local owner while an application is pending.
    const retainedForeground =
        !state.interaction.threadId &&
        !!pending?.threadId &&
        matches(state.interaction, pending.threadId, pending.conversationId);
    return (
        foreground ||
        retainedForeground ||
        isDraftFailure(state, event, pending) ||
        isUnassignedForegroundResponse(state, event, pending)
    );
}

export function transitionForegroundEvent<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    pending: ICopilotRequest<TBuild> | undefined,
    registration: ICopilotRegistration<TBuild> | undefined,
): Pick<ICopilotSnapshot<TBuild>, "interaction" | "generation"> {
    if (
        pending?.superseded &&
        !isUserInputEvent(event) &&
        event.type !== "chatConversationChanged" &&
        event.type !== "chatReset"
    ) {
        return { interaction: state.interaction, generation: state.generation };
    }
    const foreground = !!event.threadId && event.threadId === state.interaction.threadId;
    const foregroundResponse = isForegroundResponse(state, event, pending, foreground);
    if (event.type === "chatAssistantMessage" && foregroundResponse) {
        return transitionAssistant(state, event, registration, pending);
    }
    if (event.type === "chatClarificationQuestions" && foregroundResponse) {
        return transitionClarification(state, event);
    }
    return {
        interaction: transitionInteraction(state, event, foreground),
        generation: state.generation,
    };
}

/** Clear foreground progress only when this event newly supersedes its owning request. */
export function hasNewlySupersededForeground<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    requests: readonly ICopilotRequest<TBuild>[],
): boolean {
    return requests.some(
        (request) =>
            request.superseded &&
            !state.requests.find((previous) => previous.revision === request.revision)?.superseded &&
            matches(state.interaction, request.threadId, request.conversationId),
    );
}
