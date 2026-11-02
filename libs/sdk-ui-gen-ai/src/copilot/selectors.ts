// (C) 2026 GoodData Corporation

import {
    type CopilotBuildType,
    type CopilotStatus,
    type ICopilotScope,
    type ICopilotSnapshot,
    type ICopilotSource,
    type ICopilotTarget,
} from "./types.js";

/** Whether creation is pending, including an activated creation build. @alpha */
export function selectCopilotGenerationPending<TBuild extends string = CopilotBuildType>(
    state: ICopilotSnapshot<TBuild>,
    type: TBuild,
): boolean {
    return (
        state.generation === type ||
        (state.interaction.build?.type === type && state.interaction.build.intent === "create")
    );
}

/** Calculate progress without host presentation rules or side effects. @alpha */
export function selectCopilotStatus<TBuild extends string = CopilotBuildType>(
    state: ICopilotSnapshot<TBuild>,
    scope: ICopilotScope<TBuild>,
): CopilotStatus {
    if (
        state.applications.some(
            ({ target }) =>
                target.type === scope.type &&
                (scope.objectId === undefined || target.objectId === scope.objectId),
        )
    ) {
        return "building";
    }
    if (scope.isEditing) {
        const requests = state.requests.filter(
            (request) =>
                request.type === scope.type &&
                (scope.objectId === undefined || request.objectId === scope.objectId),
        );
        if (requests.length) {
            return requests.every(
                (request) => request.awaitingClarification && !request.applicationIds.length,
            )
                ? "waiting"
                : "building";
        }
    }
    const interaction = state.interaction;
    if (
        selectCopilotGenerationPending(state, scope.type) ||
        (scope.isBuilder && interaction.build?.type === scope.type)
    ) {
        if (interaction.waitingForUserInput || interaction.pendingClarificationIds.length) {
            return "waiting";
        }
        return interaction.build ? "building" : "generating";
    }
    return "idle";
}

/** Query the originating conversation of an applied object. @alpha */
export function selectCopilotSource<TBuild extends string = CopilotBuildType>(
    state: ICopilotSnapshot<TBuild>,
    target: ICopilotTarget<TBuild>,
): ICopilotSource | undefined {
    return state.sources.find(
        (entry) => entry.target.type === target.type && entry.target.objectId === target.objectId,
    )?.source;
}

/** Query the current foreground reasoning heading. @alpha */
export function selectCopilotReasoningTitle<TBuild extends string = CopilotBuildType>(
    state: ICopilotSnapshot<TBuild>,
): string | undefined {
    return state.interaction.reasoningTitle;
}
