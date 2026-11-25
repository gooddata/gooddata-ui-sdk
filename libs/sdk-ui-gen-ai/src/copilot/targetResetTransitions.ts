// (C) 2026 GoodData Corporation

import { sameInteraction } from "./transitionUtils.js";
import { type ICopilotRequest, type ICopilotSnapshot, type ICopilotTarget } from "./types.js";

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

export function transitionTargetReset<TBuild extends string>(
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
