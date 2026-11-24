// (C) 2026 GoodData Corporation

import { type ChatClarificationQuestionsEvent, type ChatEvent } from "../store/events.js";

import {
    buildIntent,
    clarificationIds,
    conversationId,
    failedResponse,
    isUserInputEvent,
    matches,
    matchingRequestIndex,
    requestedGeneration,
    sameTarget,
} from "./transitionUtils.js";
import {
    type ICopilotConfiguration,
    type ICopilotRegistration,
    type ICopilotRequest,
    type ICopilotSnapshot,
} from "./types.js";

function finishedResponse(event: ChatEvent): boolean {
    return event.type === "chatAssistantMessage" && (event.responseCompleted || failedResponse(event));
}

function transitionRequestClarification<TBuild extends string>(
    pending: ICopilotRequest<TBuild>,
    event: ChatClarificationQuestionsEvent,
): ICopilotRequest<TBuild> {
    const ids = pending.pendingClarificationIds ?? [];
    const pendingClarificationIds = clarificationIds(ids, event);
    const awaitingClarification = pendingClarificationIds.length > 0;
    if (pending.awaitingClarification === awaitingClarification && pendingClarificationIds === ids) {
        return pending;
    }
    return { ...pending, awaitingClarification, pendingClarificationIds };
}

function transitionPendingRequest<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    pending: ICopilotRequest<TBuild>,
    event: ChatEvent,
    registration: ICopilotRegistration<TBuild> | undefined,
): ICopilotRequest<TBuild> {
    if (
        event.type === "chatConversationChanged" &&
        event.threadId &&
        (event.threadId !== pending.threadId || event.conversation.localId !== pending.conversationId)
    ) {
        return { ...pending, threadId: event.threadId, conversationId: event.conversation.localId };
    }
    if (pending.superseded) {
        return pending;
    }
    if (event.type === "chatClarificationQuestions") {
        return transitionRequestClarification(pending, event);
    }
    if (registration && !pending.type) {
        return {
            ...pending,
            threadId: event.threadId,
            type: registration.type,
            intent: buildIntent(state, registration.type, pending),
            objectId: state.context.type === registration.type ? state.context.objectId : undefined,
        };
    }
    return pending;
}

/** A reply resumes known work even after its clarification form was dismissed, unless superseded. */
function canContinueRequest<TBuild extends string>(
    pending: ICopilotRequest<TBuild> | undefined,
    event: ChatEvent,
): boolean {
    return !!(
        pending &&
        !pending.superseded &&
        (pending.type !== undefined ||
            pending.generation !== undefined ||
            pending.responseFinished ||
            pending.awaitingClarification ||
            event.type === "chatUserAnswers")
    );
}

/** Only creation and open clarification forms retain ownership after a response finishes. */
function waitsForReplyAfterResponse<TBuild extends string>(
    request: ICopilotRequest<TBuild>,
    event: ChatEvent,
): boolean {
    if (request.superseded || event.type !== "chatAssistantMessage" || failedResponse(event)) {
        return false;
    }
    if (request.type === undefined) {
        return request.generation !== undefined;
    }
    return Boolean(request.awaitingClarification || request.intent === "create");
}

export function transitionRequests<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    index: number,
    registration: ICopilotRegistration<TBuild> | undefined,
): readonly ICopilotRequest<TBuild>[] {
    const requests = state.requests;
    const pending = requests[index];
    if (isUserInputEvent(event)) {
        // An old acknowledgement must not replace a newer request still applying a definition.
        const retained = pending?.applicationIds.length ? [pending] : [];
        const continuation = canContinueRequest(pending, event) ? pending : undefined;
        const generation = continuation?.generation ?? requestedGeneration(state);
        const pendingClarificationIds =
            event.type === "chatUserAnswers"
                ? continuation?.pendingClarificationIds?.filter((id) => id !== event.interactionId)
                : undefined;
        return [
            ...requests.filter((_, i) => i !== index),
            ...retained,
            {
                revision: state.revision + 1,
                conversationId: conversationId(event),
                threadId: event.threadId,
                type: continuation?.type,
                generation,
                intent: continuation?.intent,
                objectId:
                    continuation?.objectId ??
                    (generation !== undefined && state.context.type === generation
                        ? state.context.objectId
                        : undefined),
                pendingClarificationIds,
                awaitingClarification: !!pendingClarificationIds?.length,
                applicationIds: [],
            },
        ];
    }
    if (!pending || event.type === "chatReset") {
        return requests;
    }
    const updated = transitionPendingRequest(state, pending, event, registration);
    if (finishedResponse(event)) {
        const waitingForReply = waitsForReplyAfterResponse(updated, event);
        return updated.applicationIds.length || waitingForReply
            ? requests.map((request, i) => (i === index ? { ...updated, responseFinished: true } : request))
            : requests.filter((_, i) => i !== index);
    }
    return updated === pending ? requests : requests.map((request, i) => (i === index ? updated : request));
}

/** A new owner displaces only other conversations managing the same workflow and compatible target. */
function shouldSupersedeRequest<TBuild extends string>(
    request: ICopilotRequest<TBuild>,
    owner: ICopilotRequest<TBuild>,
    type: TBuild,
): boolean {
    return (
        request !== owner &&
        !request.superseded &&
        (request.type ?? request.generation) === type &&
        (request.objectId === owner.objectId ||
            request.objectId === undefined ||
            owner.objectId === undefined) &&
        !matches(request, owner.threadId, owner.conversationId)
    );
}

export function transferWorkflow<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    requests: readonly ICopilotRequest<TBuild>[],
    pending: ICopilotRequest<TBuild> | undefined,
    registration: ICopilotRegistration<TBuild> | undefined,
): readonly ICopilotRequest<TBuild>[] {
    if (!pending || pending.type || !registration) {
        return requests;
    }
    const owner =
        requests.find((request) => request.revision === pending.revision) ??
        transitionPendingRequest(state, pending, event, registration);
    return requests.map((request) =>
        shouldSupersedeRequest(request, owner, registration.type)
            ? { ...request, superseded: true }
            : request,
    );
}

/** Reloads match the assigned backend thread first because a reload may replace its local ID. */
export function eventRequestIndex<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
): number {
    const assignedThreadIndex =
        event.type === "chatConversationChanged" && event.threadId
            ? matchingRequestIndex(state.requests, event.threadId)
            : -1;
    return assignedThreadIndex >= 0
        ? assignedThreadIndex
        : matchingRequestIndex(state.requests, event.threadId, conversationId(event));
}

/** Only a live request or an unclaimed foreground generation can activate a configured workflow. */
export function eventRegistration<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    pending: ICopilotRequest<TBuild> | undefined,
    configuration: ICopilotConfiguration<TBuild>,
): ICopilotRegistration<TBuild> | undefined {
    if (event.type !== "chatAssistantMessage" || failedResponse(event)) {
        return undefined;
    }
    const canActivate = pending
        ? !pending.superseded
        : event.threadId === state.interaction.threadId && requestedGeneration(state) !== undefined;
    if (!canActivate) {
        return undefined;
    }
    const registration =
        configuration.registrations.find((entry) =>
            event.skills?.some((skill) => entry.skills.includes(skill.name)),
        ) ?? builderRegistration(state, pending, configuration);
    // An empty editor has no edit target; a late reply must not restart work after creation was cancelled.
    if (
        registration &&
        state.context.type === registration.type &&
        state.context.isEditing &&
        !state.context.objectId &&
        buildIntent(state, registration.type, pending) === "edit"
    ) {
        return undefined;
    }
    return registration;
}

/** A follow-up from the conversation that filled the builder keeps that workflow without a new skill item. */
function builderRegistration<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    pending: ICopilotRequest<TBuild> | undefined,
    configuration: ICopilotConfiguration<TBuild>,
): ICopilotRegistration<TBuild> | undefined {
    const target = state.context.builderTarget;
    if (!target || !pending || pending.type !== undefined) {
        return undefined;
    }
    const source = state.sources.find((entry) => sameTarget(entry.target, target))?.source;
    return source?.conversationId === pending.conversationId
        ? configuration.registrations.find((entry) => entry.type === target.type)
        : undefined;
}
