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
    if (conversationId && request.conversationId === conversationId) {
        return true;
    }
    return threadId
        ? request.threadId === threadId || request.conversationId === threadId
        : !conversationId && !request.threadId && !request.conversationId;
}

function conversationId(event: ChatEvent): string | undefined {
    if (event.type === "chatConversationChanged") {
        return event.conversation.localId;
    }
    return event.type === "chatUserMessage" || event.type === "chatUserAnswers"
        ? event.conversationId
        : undefined;
}

function failedResponse(event: ChatAssistantMessageEvent): boolean {
    return !!(event.cancelled || event.useCase === "INVALID");
}

function finishedResponse(event: ChatEvent): boolean {
    return (
        (event.type === "chatAssistantMessage" && (event.responseCompleted || failedResponse(event))) ||
        (event.type === "chatClarificationQuestions" && event.responses === null)
    );
}

function clarificationIds(ids: readonly string[], event: ChatClarificationQuestionsEvent): readonly string[] {
    return event.responses === undefined
        ? ids.includes(event.interactionId)
            ? ids
            : [...ids, event.interactionId]
        : ids.filter((id) => id !== event.interactionId);
}

function transitionRequestClarification<TBuild extends string>(
    pending: ICopilotRequest<TBuild>,
    event: ChatClarificationQuestionsEvent,
): ICopilotRequest<TBuild> {
    const ids = pending.pendingClarificationIds ?? [];
    const pendingClarificationIds = clarificationIds(ids, event);
    return pending.awaitingClarification !== pendingClarificationIds.length > 0 ||
        pendingClarificationIds !== ids
        ? {
              ...pending,
              awaitingClarification: pendingClarificationIds.length > 0,
              pendingClarificationIds,
          }
        : pending;
}

function transitionPendingRequest<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    pending: ICopilotRequest<TBuild>,
    event: ChatEvent,
    registration: ICopilotRegistration<TBuild> | undefined,
): ICopilotRequest<TBuild> {
    if (event.type === "chatConversationChanged" && event.threadId && event.threadId !== pending.threadId) {
        return { ...pending, threadId: event.threadId };
    }
    if (event.type === "chatClarificationQuestions") {
        return transitionRequestClarification(pending, event);
    }
    if (registration && !pending.type) {
        return {
            ...pending,
            threadId: event.threadId,
            type: registration.type,
            objectId: state.context.type === registration.type ? state.context.objectId : undefined,
        };
    }
    return pending;
}

function transitionRequests<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    index: number,
    registration: ICopilotRegistration<TBuild> | undefined,
): readonly ICopilotRequest<TBuild>[] {
    const requests = state.requests;
    const pending = requests[index];
    if (event.type === "chatUserMessage" || event.type === "chatUserAnswers") {
        // An old acknowledgement must not replace a newer request still applying a definition.
        const retained = pending?.applicationIds.length ? [pending] : [];
        return [
            ...requests.filter((_, i) => i !== index),
            ...retained,
            {
                revision: state.revision + 1,
                conversationId: conversationId(event),
                threadId: event.threadId,
                applicationIds: [],
            },
        ];
    }
    if (!pending || event.type === "chatReset") {
        return requests;
    }
    if (finishedResponse(event)) {
        return pending.applicationIds.length
            ? requests.map((request, i) => (i === index ? { ...pending, responseFinished: true } : request))
            : requests.filter((_, i) => i !== index);
    }
    const updated = transitionPendingRequest(state, pending, event, registration);
    return updated === pending ? requests : requests.map((request, i) => (i === index ? updated : request));
}

function transitionConversation<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatConversationChangedEvent,
    foreground: boolean,
): ICopilotInteraction<TBuild> {
    const interaction = state.interaction;
    const origin = conversationId(event);
    const initialAssignment =
        !!origin &&
        state.requests.some((request) => request.conversationId === origin) &&
        (!interaction.threadId || foreground) &&
        (!interaction.conversationId || interaction.conversationId === origin);
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
            return {
                ...interaction,
                conversationId: conversationId(event),
                threadId: event.threadId,
                reasoningTitle: undefined,
                waitingForUserInput: false,
            };
        case "chatUserAnswers":
            return foreground
                ? {
                      ...interaction,
                      waitingForUserInput: false,
                      pendingClarificationIds: interaction.pendingClarificationIds.filter(
                          (id) => id !== event.interactionId,
                      ),
                  }
                : interaction;
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
                intent:
                    (interaction.build?.type === registration.type ? interaction.build.intent : undefined) ??
                    (generation === registration.type ? "create" : "edit"),
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
    return { interaction, generation };
}

function transitionClarification<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatClarificationQuestionsEvent,
): Pick<ICopilotSnapshot<TBuild>, "interaction" | "generation"> {
    if (event.responses === null) {
        return { generation: undefined, interaction: emptyInteraction() };
    }
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

function isForegroundResponse<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    pending: ICopilotRequest<TBuild> | undefined,
    foreground: boolean,
): boolean {
    return (
        foreground ||
        (event.type === "chatAssistantMessage" &&
            failedResponse(event) &&
            !state.interaction.threadId &&
            !!pending &&
            !pending.threadId &&
            !pending.responseFinished &&
            !!event.threadId &&
            event.threadId === state.interaction.conversationId &&
            pending.conversationId === state.interaction.conversationId) ||
        (!event.threadId &&
            !state.interaction.threadId &&
            (!!pending || state.generation !== undefined || !!state.interaction.build))
    );
}

function transitionForegroundEvent<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    pending: ICopilotRequest<TBuild> | undefined,
    registration: ICopilotRegistration<TBuild> | undefined,
): Pick<ICopilotSnapshot<TBuild>, "interaction" | "generation"> {
    const foreground = !!event.threadId && event.threadId === state.interaction.threadId;
    const foregroundResponse = isForegroundResponse(state, event, pending, foreground);
    if (event.type === "chatAssistantMessage" && foregroundResponse) {
        return transitionAssistant(state, event, registration);
    }
    if (event.type === "chatClarificationQuestions" && foregroundResponse) {
        return transitionClarification(state, event);
    }
    return {
        interaction: transitionInteraction(state, event, foreground),
        generation: state.generation,
    };
}

function transitionEvent<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    event: ChatEvent,
    configuration: ICopilotConfiguration<TBuild>,
): ICopilotSnapshot<TBuild> {
    if (event.type === "chatUserAnswers" && event.threadId !== state.interaction.threadId) {
        return state;
    }
    const index = matchingRequestIndex(state.requests, event.threadId, conversationId(event));
    const pending = state.requests[index];
    const registration =
        event.type === "chatAssistantMessage"
            ? configuration.registrations.find((entry) =>
                  event.skills?.some((skill) => entry.skills.includes(skill.name)),
              )
            : undefined;
    const requests = transitionRequests(state, event, index, registration);
    const foregroundState = transitionForegroundEvent(state, event, pending, registration);
    let interaction = foregroundState.interaction;
    const generation = foregroundState.generation;
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
              revision:
                  event.type === "chatUserMessage" || event.type === "chatUserAnswers"
                      ? state.revision + 1
                      : state.revision,
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

function requestsAfterTargetReset<TBuild extends string>(
    requests: readonly ICopilotRequest<TBuild>[],
    target: ICopilotTarget<TBuild>,
): readonly ICopilotRequest<TBuild>[] {
    return requests.some(
        (request) =>
            request.applicationIds.length &&
            request.type === target.type &&
            (request.objectId === undefined || request.objectId === target.objectId),
    )
        ? requests
        : requests.filter(
              (request) =>
                  request.type !== undefined &&
                  (request.type !== target.type ||
                      (request.objectId !== undefined && request.objectId !== target.objectId)),
          );
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
        return { ...state, applications, requests };
    }
    const sources = sourcesAfterApplicationApplied(state.sources, application, input.target);
    const isForeground = isForegroundApplication(state, application);
    const hasNewer = hasNewerApplicationWork(state, application, applications, requests);
    return {
        ...state,
        applications,
        requests,
        sources,
        ...(isForeground && !hasNewer
            ? { generation: undefined, interaction: emptyInteraction<TBuild>() }
            : {}),
    };
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
        case "cancelGeneration":
            return state.generation === input.type || state.interaction.build?.type === input.type
                ? { ...state, generation: undefined, interaction: emptyInteraction() }
                : state;
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
