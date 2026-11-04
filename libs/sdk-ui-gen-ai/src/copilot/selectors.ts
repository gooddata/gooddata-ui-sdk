// (C) 2026 GoodData Corporation

import {
    type CopilotBuildType,
    type CopilotStatus,
    type ICopilotRequest,
    type ICopilotScope,
    type ICopilotSnapshot,
    type ICopilotSource,
    type ICopilotTarget,
} from "./types.js";

/** An omitted object ID includes every target of the workflow; a supplied ID must match exactly. */
function matchesTargetScope<TBuild extends string>(
    target: ICopilotTarget<TBuild>,
    scope: ICopilotScope<TBuild>,
): boolean {
    return target.type === scope.type && (scope.objectId === undefined || target.objectId === scope.objectId);
}

/** Edit requests require an editing or builder scope unless they originated from scoped generation. */
function matchesScope<TBuild extends string>(
    request: ICopilotRequest<TBuild>,
    scope: ICopilotScope<TBuild>,
): boolean {
    const isProgress =
        scope.isEditing ||
        scope.isBuilder ||
        request.intent === "create" ||
        request.generation === scope.type;
    const isSameType = (request.type ?? request.generation) === scope.type;
    const isSameObject = scope.objectId === undefined || request.objectId === scope.objectId;

    return !request.superseded && isSameType && isSameObject && Boolean(isProgress);
}

/** Before activation, generation identifies creation; after activation, the resolved type and intent do. */
function isActiveCreationRequest<TBuild extends string>(
    request: ICopilotRequest<TBuild>,
    type: TBuild,
): boolean {
    return (
        !request.superseded &&
        (request.type === undefined
            ? request.generation === type
            : request.type === type && request.intent === "create")
    );
}

/** Clarification or a finished response waits for a reply only after all host applications complete. */
function isWaitingForReply<TBuild extends string>(request: ICopilotRequest<TBuild>): boolean | undefined {
    return (request.awaitingClarification || request.responseFinished) && !request.applicationIds.length;
}

/** Foreground creation counts before activation too; foreground edits count only in builder scopes. */
function hasForegroundProgress<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    scope: ICopilotScope<TBuild>,
): boolean | undefined {
    return (
        state.generation === scope.type ||
        (state.interaction.build?.type === scope.type &&
            (state.interaction.build.intent === "create" || scope.isBuilder))
    );
}

/** Any non-superseded request of the workflow type claims foreground startup reasoning, regardless of object scope. */
function isForegroundWorkflowUnclaimed<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    scope: ICopilotScope<TBuild>,
): boolean {
    return (
        (state.generation === scope.type || state.interaction.build?.type === scope.type) &&
        !state.requests.some(
            (request) => !request.superseded && (request.type ?? request.generation) === scope.type,
        )
    );
}

/** A scoped request owns reasoning by its truthy thread ID, otherwise by direct conversation identity. */
function ownsForegroundReasoning<TBuild extends string>(
    request: ICopilotRequest<TBuild>,
    state: ICopilotSnapshot<TBuild>,
    scope: ICopilotScope<TBuild>,
): boolean {
    return (
        matchesScope(request, scope) &&
        (request.threadId
            ? request.threadId === state.interaction.threadId
            : request.conversationId === state.interaction.conversationId)
    );
}

/** Whether creation is pending, including an activated creation build. @alpha */
export function selectCopilotGenerationPending<TBuild extends string = CopilotBuildType>(
    state: ICopilotSnapshot<TBuild>,
    type: TBuild,
): boolean {
    return (
        state.generation === type ||
        (state.interaction.build?.type === type && state.interaction.build.intent === "create") ||
        state.requests.some((request) => isActiveCreationRequest(request, type))
    );
}

/** Calculate progress without host presentation rules or side effects. @alpha */
export function selectCopilotStatus<TBuild extends string = CopilotBuildType>(
    state: ICopilotSnapshot<TBuild>,
    scope: ICopilotScope<TBuild>,
): CopilotStatus {
    if (state.applications.some(({ target }) => matchesTargetScope(target, scope))) {
        return "building";
    }
    const requests = state.requests.filter((request) => matchesScope(request, scope));
    if (requests.length) {
        if (requests.every(isWaitingForReply)) {
            return "waiting";
        }
        if (requests.some((request) => request.type !== undefined)) {
            return "building";
        }
        return "generating";
    }
    const interaction = state.interaction;
    if (hasForegroundProgress(state, scope)) {
        if (interaction.waitingForUserInput || interaction.pendingClarificationIds.length) {
            return "waiting";
        }
        return interaction.build ? "building" : "generating";
    }
    return "idle";
}

/** Resolve the newest waiting workflow's thread rather than the selected chat. @internal */
export function selectCopilotReplyThreadId<TBuild extends string>(
    state: ICopilotSnapshot<TBuild>,
    scope: ICopilotScope<TBuild>,
): string | undefined {
    const waiting = state.requests.reduce<ICopilotRequest<TBuild> | undefined>(
        (selected, request) =>
            matchesScope(request, scope) &&
            isWaitingForReply(request) &&
            (!selected || request.revision > selected.revision)
                ? request
                : selected,
        undefined,
    );
    return waiting ? (waiting.threadId ?? waiting.conversationId) : state.interaction.threadId;
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

/** Query foreground reasoning, optionally restricted to the owning workflow. @alpha */
export function selectCopilotReasoningTitle<TBuild extends string = CopilotBuildType>(
    state: ICopilotSnapshot<TBuild>,
    scope?: ICopilotScope<TBuild>,
): string | undefined {
    if (!scope) {
        return state.interaction.reasoningTitle;
    }
    const unclaimed = isForegroundWorkflowUnclaimed(state, scope);
    if (!unclaimed && !state.requests.some((request) => ownsForegroundReasoning(request, state, scope))) {
        return undefined;
    }
    return state.interaction.reasoningTitle;
}
