// (C) 2026 GoodData Corporation

import {
    emptyInteraction,
    generationAfterRequests,
    matches,
    matchingRequestIndex,
    sameTarget,
} from "./transitionUtils.js";
import {
    type CopilotInput,
    type ICopilotApplication,
    type ICopilotRequest,
    type ICopilotSnapshot,
    type ICopilotTarget,
} from "./types.js";

export function transitionApplicationStarted<TBuild extends string>(
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

export function transitionApplicationFinished<TBuild extends string>(
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
