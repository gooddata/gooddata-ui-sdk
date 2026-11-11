// (C) 2026 GoodData Corporation

import {
    type ChatAssistantMessageEvent,
    type ChatClarificationQuestionsEvent,
    type ChatConversationChangedEvent,
    type ChatEvent,
} from "../store/events.js";

import {
    type CopilotBuildType,
    type CopilotInput,
    type ICopilotApplication,
    type ICopilotConfiguration,
    type ICopilotContext,
    type ICopilotInteraction,
    type ICopilotRegistration,
    type ICopilotRequest,
    type ICopilotSnapshot,
    type ICopilotTarget,
} from "./types.js";

/** Create an independent, empty workflow state. @alpha */
export function createCopilotState<TBuild extends string = CopilotBuildType>(): ICopilotSnapshot<TBuild> {
    return {
        context: {},
        interaction: emptyInteraction(),
        requests: [],
        applications: [],
        sources: [],
        revision: 0,
    };
}

function emptyInteraction<TBuild extends string>(): ICopilotInteraction<TBuild> {
    return { waitingForUserInput: false, pendingClarificationIds: [] };
}

function sameInteraction<TBuild extends string>(
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

function matchingRequestIndex<TBuild extends string>(
    requests: readonly ICopilotRequest<TBuild>[],
    threadId?: string,
    origin?: string,
): number {
    return requests.reduce((index, request, i) => (matches(request, threadId, origin) ? i : index), -1);
}

function sameTarget<TBuild extends string>(a: ICopilotTarget<TBuild>, b: ICopilotTarget<TBuild>): boolean {
    return a.type === b.type && a.objectId === b.objectId;
}

function matches(
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

/** Both text and clarification answers start a new response revision. */
function isUserInputEvent(
    event: ChatEvent,
): event is Extract<ChatEvent, { type: "chatUserMessage" | "chatUserAnswers" }> {
    return event.type === "chatUserMessage" || event.type === "chatUserAnswers";
}

function conversationId(event: ChatEvent): string | undefined {
    if (event.type === "chatConversationChanged") {
        return event.conversation.localId;
    }
    return isUserInputEvent(event) ? event.conversationId : undefined;
}

function failedResponse(event: ChatAssistantMessageEvent): boolean {
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
function buildIntent<TBuild extends string>(
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

function finishedResponse(event: ChatEvent): boolean {
    return event.type === "chatAssistantMessage" && (event.responseCompleted || failedResponse(event));
}

function clarificationIds(ids: readonly string[], event: ChatClarificationQuestionsEvent): readonly string[] {
    if (event.responses !== undefined) {
        return ids.filter((id) => id !== event.interactionId);
    }
    return ids.includes(event.interactionId) ? ids : [...ids, event.interactionId];
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

function requestedGeneration<TBuild extends string>(state: ICopilotSnapshot<TBuild>): TBuild | undefined {
    return state.requests.some(
        (request) =>
            request.generation === state.generation && request.revision > (state.generationRevision ?? 0),
    )
        ? undefined
        : state.generation;
}

function generationAfterRequests<TBuild extends string>(
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

function transitionRequests<TBuild extends string>(
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

function transitionForegroundEvent<TBuild extends string>(
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

function transferWorkflow<TBuild extends string>(
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
function eventRequestIndex<TBuild extends string>(state: ICopilotSnapshot<TBuild>, event: ChatEvent): number {
    const assignedThreadIndex =
        event.type === "chatConversationChanged" && event.threadId
            ? matchingRequestIndex(state.requests, event.threadId)
            : -1;
    return assignedThreadIndex >= 0
        ? assignedThreadIndex
        : matchingRequestIndex(state.requests, event.threadId, conversationId(event));
}

/** Only a live request or an unclaimed foreground generation can activate a configured workflow. */
function eventRegistration<TBuild extends string>(
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
    return (
        configuration.registrations.find((entry) =>
            event.skills?.some((skill) => entry.skills.includes(skill.name)),
        ) ?? builderRegistration(state, pending, configuration)
    );
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

/** Clear foreground progress only when this event newly supersedes its owning request. */
function hasNewlySupersededForeground<TBuild extends string>(
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

function transitionEvent<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    configuration: ICopilotConfiguration<TBuild>,
): ICopilotSnapshot<TBuild> {
    const index = eventRequestIndex(state, event);
    const pending = state.requests[index];
    if (
        event.type === "chatUserAnswers" &&
        !pending &&
        !matches(state.interaction, event.threadId, conversationId(event))
    ) {
        return state;
    }
    const registration = eventRegistration(state, event, pending, configuration);
    const skillRegistration =
        registration &&
        event.type === "chatAssistantMessage" &&
        event.skills?.some((skill) => registration.skills.includes(skill.name))
            ? registration
            : undefined;
    const requests = transferWorkflow(
        state,
        event,
        transitionRequests(state, event, index, registration),
        pending,
        skillRegistration,
    );
    const supersededForeground = hasNewlySupersededForeground(state, requests);
    const foregroundState = transitionForegroundEvent(
        supersededForeground
            ? {
                  ...state,
                  interaction: {
                      ...emptyInteraction<TBuild>(),
                      conversationId: state.interaction.conversationId,
                      threadId: state.interaction.threadId,
                  },
              }
            : state,
        event,
        pending,
        registration,
    );
    let interaction = foregroundState.interaction;
    const generation =
        foregroundState.generation === state.generation
            ? generationAfterRequests(state, requests)
            : foregroundState.generation;
    if (sameInteraction(interaction, state.interaction)) {
        interaction = state.interaction;
    }
    return requests === state.requests && interaction === state.interaction && generation === state.generation
        ? state
        : {
              ...state,
              requests,
              interaction,
              generation,
              revision: isUserInputEvent(event) ? state.revision + 1 : state.revision,
          };
}

function transitionContext<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    context: ICopilotContext<TBuild>,
): ICopilotSnapshot<TBuild> {
    const a = state.context;
    const b = context;
    return a.type === b.type &&
        a.objectId === b.objectId &&
        a.isEditing === b.isEditing &&
        (a.builderTarget === b.builderTarget ||
            (!!a.builderTarget && !!b.builderTarget && sameTarget(a.builderTarget, b.builderTarget)))
        ? state
        : {
              ...state,
              context: { ...b, builderTarget: b.builderTarget ? { ...b.builderTarget } : undefined },
          };
}

/** Definition installation outlives navigation and must retain its request until acknowledgement. */
function isApplyingToTarget<TBuild extends string>(
    request: ICopilotRequest<TBuild>,
    target: ICopilotTarget<TBuild>,
): boolean {
    return (
        request.applicationIds.length > 0 &&
        request.type === target.type &&
        (request.objectId === undefined || request.objectId === target.objectId)
    );
}

/** Only work explicitly bound to another workflow or object survives a target reset. */
function belongsToOtherTarget<TBuild extends string>(
    request: ICopilotRequest<TBuild>,
    target: ICopilotTarget<TBuild>,
): boolean {
    const type = request.type ?? request.generation;
    return (
        type !== undefined &&
        (type !== target.type || (request.objectId !== undefined && request.objectId !== target.objectId))
    );
}

function requestsAfterTargetReset<TBuild extends string>(
    requests: readonly ICopilotRequest<TBuild>[],
    target: ICopilotTarget<TBuild>,
): readonly ICopilotRequest<TBuild>[] {
    return requests.some((request) => isApplyingToTarget(request, target))
        ? requests
        : requests.filter((request) => belongsToOtherTarget(request, target));
}

function transitionTargetReset<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    target: ICopilotTarget<TBuild>,
): ICopilotSnapshot<TBuild> {
    const next = {
        ...state,
        interaction: {
            ...state.interaction,
            threadId: undefined,
            reasoningTitle: undefined,
            waitingForUserInput: false,
        },
        requests: requestsAfterTargetReset(state.requests, target),
    };
    return next.requests.length === state.requests.length &&
        sameInteraction(next.interaction, state.interaction)
        ? state
        : next;
}

function transitionApplicationStarted<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    input: Extract<CopilotInput<TBuild>, { kind: "applicationStarted" }>,
): ICopilotSnapshot<TBuild> {
    if (state.applications.some((application) => application.id === input.id)) {
        return state;
    }
    const { source } = input;
    const index = matchingRequestIndex(state.requests, source.threadId, source.conversationId);
    const pending = state.requests[index];
    const request: ICopilotRequest<TBuild> = {
        ...pending,
        revision: pending?.revision ?? state.revision + 1,
        type: source.target.type,
        objectId: source.target.objectId,
        conversationId: source.conversationId ?? pending?.conversationId,
        threadId: source.threadId ?? pending?.threadId,
        responseFinished: pending ? pending.responseFinished : true,
        awaitingClarification: false,
        applicationIds: [...(pending?.applicationIds ?? []), input.id],
    };
    return {
        ...state,
        revision: state.revision + 1,
        applications: [
            ...state.applications,
            {
                ...source,
                target: { ...source.target },
                id: input.id,
                revision: state.revision + 1,
                requestRevision: request.revision,
            },
        ],
        requests: [...state.requests.filter((_, i) => i !== index), request],
    };
}

function requestsAfterApplicationFinished<TBuild extends string>(
    requests: readonly ICopilotRequest<TBuild>[],
    input: Extract<CopilotInput<TBuild>, { kind: "applicationApplied" | "applicationInterrupted" }>,
): readonly ICopilotRequest<TBuild>[] {
    return requests.flatMap((request) => {
        if (!request.applicationIds.includes(input.id)) {
            return [request];
        }
        const applicationIds = request.applicationIds.filter((id) => id !== input.id);
        return !applicationIds.length && (input.kind === "applicationApplied" || request.responseFinished)
            ? []
            : [{ ...request, applicationIds }];
    });
}

function sourcesAfterApplicationApplied<TBuild extends string>(
    sources: ICopilotSnapshot<TBuild>["sources"],
    application: ICopilotApplication<TBuild>,
    target: ICopilotTarget<TBuild>,
): ICopilotSnapshot<TBuild>["sources"] {
    const previous = sources.find((entry) => sameTarget(entry.target, target));
    return previous && previous.revision > application.revision
        ? sources
        : [
              ...sources.filter((entry) => entry !== previous),
              {
                  target: { ...target },
                  revision: application.revision,
                  source: application.conversationId
                      ? {
                            conversationId: application.conversationId,
                            threadId: application.threadId,
                        }
                      : undefined,
              },
          ];
}

function isForegroundApplication<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    application: ICopilotApplication<TBuild>,
): boolean {
    return (
        matches(state.interaction, application.threadId, application.conversationId) ||
        (!state.interaction.threadId &&
            !state.interaction.conversationId &&
            (state.generation === application.target.type ||
                state.interaction.build?.type === application.target.type))
    );
}

function hasNewerApplicationWork<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    application: ICopilotApplication<TBuild>,
    applications: readonly ICopilotApplication<TBuild>[],
    requests: readonly ICopilotRequest<TBuild>[],
): boolean {
    return (
        applications.some(
            (entry) =>
                entry.revision > application.revision &&
                matches(entry, application.threadId, application.conversationId),
        ) ||
        requests.some(
            (request) =>
                request.revision > application.requestRevision &&
                matches(request, application.threadId, application.conversationId),
        ) ||
        (state.generationRevision ?? 0) > application.revision
    );
}

function transitionApplicationFinished<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    input: Extract<CopilotInput<TBuild>, { kind: "applicationApplied" | "applicationInterrupted" }>,
): ICopilotSnapshot<TBuild> {
    const application = state.applications.find((entry) => entry.id === input.id);
    if (!application) {
        return state;
    }
    if (input.kind === "applicationApplied" && input.target.type !== application.target.type) {
        return state;
    }
    const applications = state.applications.filter((entry) => entry !== application);
    const requests = requestsAfterApplicationFinished(state.requests, input);
    if (input.kind === "applicationInterrupted") {
        return { ...state, applications, requests, generation: generationAfterRequests(state, requests) };
    }
    const sources = sourcesAfterApplicationApplied(state.sources, application, input.target);
    const isForeground = isForegroundApplication(state, application);
    const hasNewer = hasNewerApplicationWork(state, application, applications, requests);
    return {
        ...state,
        applications,
        requests,
        sources,
        generation: generationAfterRequests(state, requests),
        ...(isForeground && !hasNewer
            ? { generation: undefined, interaction: emptyInteraction<TBuild>() }
            : {}),
    };
}

/** Cancelling generation drops completed waits, but running responses and host installations still need cleanup. */
function isCompletedGenerationRequest<TBuild extends string>(
    request: ICopilotRequest<TBuild>,
    type: TBuild,
): boolean {
    return !!(
        (request.type ?? request.generation) === type &&
        request.responseFinished &&
        !request.applicationIds.length
    );
}

/** Deterministic immutable transition; never allocates IDs, invokes effects, or performs I/O. @alpha */
export function transitionCopilot<TBuild extends string = CopilotBuildType>(
    state: ICopilotSnapshot<TBuild>,
    input: CopilotInput<TBuild>,
    configuration: ICopilotConfiguration<TBuild>,
): ICopilotSnapshot<TBuild> {
    switch (input.kind) {
        case "event":
            return transitionEvent(state, input.event, configuration);
        case "context":
            return transitionContext(state, input.context);
        case "startGeneration":
            return {
                ...state,
                generation: input.type,
                generationRevision: state.revision + 1,
                revision: state.revision + 1,
                interaction: emptyInteraction(),
            };
        case "cancelGeneration": {
            const requests = state.requests.filter(
                (request) => !isCompletedGenerationRequest(request, input.type),
            );
            const clearForeground =
                state.generation === input.type || state.interaction.build?.type === input.type;
            return clearForeground || requests.length !== state.requests.length
                ? {
                      ...state,
                      ...(clearForeground
                          ? { generation: undefined, interaction: emptyInteraction<TBuild>() }
                          : {}),
                      requests,
                  }
                : state;
        }
        case "resetInteraction":
            return sameInteraction(state.interaction, emptyInteraction<TBuild>())
                ? state
                : { ...state, interaction: emptyInteraction() };
        case "resetTarget":
            return transitionTargetReset(state, input.target);
        case "applicationStarted":
            return transitionApplicationStarted(state, input);
        case "applicationApplied":
        case "applicationInterrupted":
            return transitionApplicationFinished(state, input);
    }
}
