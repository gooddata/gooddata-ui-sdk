// (C) 2026 GoodData Corporation

import { type ChatEvent } from "../store/events.js";

import { transitionApplicationFinished, transitionApplicationStarted } from "./applicationTransitions.js";
import { hasNewlySupersededForeground, transitionForegroundEvent } from "./foregroundTransitions.js";
import {
    eventRegistration,
    eventRequestIndex,
    transferWorkflow,
    transitionRequests,
} from "./requestTransitions.js";
import { transitionTargetReset } from "./targetResetTransitions.js";
import {
    conversationId,
    emptyInteraction,
    generationAfterRequests,
    isUserInputEvent,
    matches,
    sameInteraction,
    sameTarget,
} from "./transitionUtils.js";
import {
    type CopilotBuildType,
    type CopilotInput,
    type ICopilotConfiguration,
    type ICopilotContext,
    type ICopilotRequest,
    type ICopilotSnapshot,
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
            const requests = state.requests.flatMap((request) => {
                if (isCompletedGenerationRequest(request, input.type)) {
                    return [];
                }
                return (request.type ?? request.generation) === input.type && !request.superseded
                    ? [{ ...request, superseded: true }]
                    : [request];
            });
            const clearForeground =
                state.generation === input.type || state.interaction.build?.type === input.type;
            return clearForeground ||
                requests.some((request, i) => request !== state.requests[i]) ||
                requests.length !== state.requests.length
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
