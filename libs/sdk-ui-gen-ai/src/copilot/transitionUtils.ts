// (C) 2026 GoodData Corporation

import {
    type ChatAssistantMessageEvent,
    type ChatClarificationQuestionsEvent,
    type ChatEvent,
} from "../store/events.js";

import {
    type ICopilotInteraction,
    type ICopilotRequest,
    type ICopilotSnapshot,
    type ICopilotTarget,
} from "./types.js";

export function emptyInteraction<TBuild extends string>(): ICopilotInteraction<TBuild> {
    return { waitingForUserInput: false, pendingClarificationIds: [] };
}

export function sameInteraction<TBuild extends string>(
    a: ICopilotInteraction<TBuild>,
    b: ICopilotInteraction<TBuild>,
): boolean {
    return (
        a.conversationId === b.conversationId &&
        a.threadId === b.threadId &&
        a.reasoningTitle === b.reasoningTitle &&
        a.waitingForUserInput === b.waitingForUserInput &&
        a.build?.type === b.build?.type &&
        a.build?.intent === b.build?.intent &&
        a.pendingClarificationIds.length === b.pendingClarificationIds.length &&
        a.pendingClarificationIds.every((id, index) => id === b.pendingClarificationIds[index])
    );
}

export function matchingRequestIndex<TBuild extends string>(
    requests: readonly ICopilotRequest<TBuild>[],
    threadId?: string,
    origin?: string,
): number {
    return requests.reduce((index, request, i) => (matches(request, threadId, origin) ? i : index), -1);
}

export function sameTarget<TBuild extends string>(
    a: ICopilotTarget<TBuild>,
    b: ICopilotTarget<TBuild>,
): boolean {
    return a.type === b.type && a.objectId === b.objectId;
}

export function matches(
    request: { readonly threadId?: string; readonly conversationId?: string },
    threadId?: string,
    conversationId?: string,
): boolean {
    // Local IDs take precedence: a new draft can still report the previous backend thread.
    if (conversationId && request.conversationId) {
        return request.conversationId === conversationId;
    }
    return threadId
        ? request.threadId === threadId || request.conversationId === threadId
        : !conversationId && !request.threadId && !request.conversationId;
}

export function generationAfterRequests<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    requests: readonly ICopilotRequest<TBuild>[],
): TBuild | undefined {
    const ownsGeneration = (request: ICopilotRequest<TBuild>) =>
        !request.superseded &&
        request.generation === state.generation &&
        request.revision > (state.generationRevision ?? 0);
    return state.requests.some(ownsGeneration) && !requests.some(ownsGeneration)
        ? undefined
        : state.generation;
}

/** Both text and clarification answers start a new response revision. */
export function isUserInputEvent(
    event: ChatEvent,
): event is Extract<ChatEvent, { type: "chatUserMessage" | "chatUserAnswers" }> {
    return event.type === "chatUserMessage" || event.type === "chatUserAnswers";
}

export function conversationId(event: ChatEvent): string | undefined {
    if (event.type === "chatConversationChanged") {
        return event.conversation.localId;
    }
    return isUserInputEvent(event) ? event.conversationId : undefined;
}

export function failedResponse(event: ChatAssistantMessageEvent): boolean {
    return Boolean(event.cancelled || event.useCase === "INVALID");
}

/** A background creation can supply intent when another conversation activates the same target. */
function hasOngoingCreation<TBuild extends string>(state: ICopilotSnapshot<TBuild>, type: TBuild): boolean {
    return (
        !state.context.isEditing &&
        state.requests.some(
            (request) =>
                !request.superseded &&
                (request.type ?? request.generation) === type &&
                (request.intent === "create" || request.generation === type) &&
                (request.objectId === undefined ||
                    state.context.objectId === undefined ||
                    request.objectId === state.context.objectId),
        )
    );
}

/** Foreground intent is reusable only for the same workflow and originating conversation. */
function foregroundBuildIntent<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    type: TBuild,
    pending?: ICopilotRequest<TBuild>,
): "create" | "edit" | undefined {
    return state.interaction.build?.type === type &&
        (!pending || matches(state.interaction, pending.threadId, pending.conversationId))
        ? state.interaction.build.intent
        : undefined;
}

/** Prefer request intent, then the owning foreground build, before inferring creation from other work. */
export function buildIntent<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    type: TBuild,
    pending?: ICopilotRequest<TBuild>,
): "create" | "edit" {
    return (
        (pending?.type === type ? pending.intent : undefined) ??
        (pending?.generation === type ? "create" : undefined) ??
        foregroundBuildIntent(state, type, pending) ??
        (requestedGeneration(state) === type || hasOngoingCreation(state, type) ? "create" : "edit")
    );
}

export function clarificationIds(
    ids: readonly string[],
    event: ChatClarificationQuestionsEvent,
): readonly string[] {
    if (event.responses !== undefined) {
        return ids.filter((id) => id !== event.interactionId);
    }
    return ids.includes(event.interactionId) ? ids : [...ids, event.interactionId];
}

export function requestedGeneration<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
): TBuild | undefined {
    return state.requests.some(
        (request) =>
            request.generation === state.generation && request.revision > (state.generationRevision ?? 0),
    )
        ? undefined
        : state.generation;
}
