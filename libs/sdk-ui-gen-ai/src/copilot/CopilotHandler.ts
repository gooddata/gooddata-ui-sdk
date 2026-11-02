// (C) 2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import { type ChatEvent } from "../store/events.js";

import {
    selectCopilotGenerationPending,
    selectCopilotReasoningTitle,
    selectCopilotSource,
    selectCopilotStatus,
} from "./selectors.js";
import { createCopilotState, transitionCopilot } from "./transitions.js";
import {
    type CopilotBuildType,
    type CopilotInput,
    type CopilotStatus,
    type ICopilotApplicationSource,
    type ICopilotConfiguration,
    type ICopilotContext,
    type ICopilotScope,
    type ICopilotSnapshot,
    type ICopilotSource,
    type ICopilotTarget,
} from "./types.js";

function freeze<T>(value: T): T {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
        Object.values(value).forEach(freeze);
        Object.freeze(value);
    }
    return value;
}

/**
 * Isolated headless workflow owner backed by pure transitions and immutable snapshots.
 *
 * @remarks
 * Create one instance per mounted editor/runtime and dispose it on teardown. Host callbacks run
 * after subscribers observe the committed state; application callbacks require an explicit
 * success or interruption acknowledgement. No application store or React setup is required.
 *
 * @alpha
 */
export class CopilotHandler<TBuild extends string = CopilotBuildType> {
    private state: ICopilotSnapshot<TBuild> = freeze(createCopilotState<TBuild>());
    private readonly listeners = new Set<() => void>();
    private readonly configuration: ICopilotConfiguration<TBuild>;
    private disposed = false;

    /** Register pure event policies and host callbacks once for this instance. */
    public constructor(configuration: ICopilotConfiguration<TBuild>) {
        this.configuration = {
            ...configuration,
            registrations: configuration.registrations.map((entry) => ({
                ...entry,
                skills: [...entry.skills],
            })),
        };
    }

    /** Consume one existing chat event. Ignored after disposal. */
    public handleEvent = (event: ChatEvent): void => {
        if (this.disposed) {
            return;
        }
        if (event.type === "onDefinitionReceived") {
            for (const registration of this.configuration.registrations) {
                const target = registration.resolveDefinition(event, this.state.context, this.state);
                if (!target || target.type !== registration.type) {
                    continue;
                }
                const applicationId = this.definitionApplicationStarted({
                    target,
                    conversationId: event.conversationId,
                    threadId: event.threadId,
                });
                if (this.disposed || !this.state.applications.some((entry) => entry.id === applicationId)) {
                    return;
                }
                try {
                    registration.onApplyDefinition(event, applicationId, target);
                } catch (error) {
                    this.definitionApplicationInterrupted(applicationId);
                    throw error;
                }
                return;
            }
            return;
        }
        const previous = this.state;
        this.update({ kind: "event", event });
        if (
            !this.disposed &&
            event.type === "chatClarificationQuestions" &&
            event.responses === undefined &&
            event.questions.length > 0 &&
            !previous.interaction.pendingClarificationIds.includes(event.interactionId) &&
            !previous.requests.some((request) =>
                request.pendingClarificationIds?.includes(event.interactionId),
            ) &&
            this.configuration.registrations.some(
                ({ type }) =>
                    this.getStatus({
                        type,
                        objectId: this.state.context.objectId,
                        isEditing: this.state.context.isEditing,
                        isBuilder: !!this.state.context.builderTarget,
                    }) !== "idle",
            )
        ) {
            this.configuration.onClarificationQuestions?.(event);
        }
    };

    /** Update host facts without reading routes or application state. */
    public setContext = (context: ICopilotContext<TBuild>): void => {
        this.update({ kind: "context", context });
    };

    /** Record an explicit creation intent before seeding the chat. */
    public startGeneration = (type: TBuild): void => {
        this.update({ kind: "startGeneration", type });
    };

    /** Clear a matching foreground generation intent or build. */
    public cancelGeneration = (type: TBuild): void => {
        this.update({ kind: "cancelGeneration", type });
    };

    /** Clear foreground chat progress, preserving background requests and generation intent. */
    public resetInteraction = (): void => {
        this.update({ kind: "resetInteraction" });
    };

    /** Apply a host navigation/reset boundary, preserving applications in progress. */
    public resetTarget = (target: ICopilotTarget<TBuild>): void => {
        this.update({ kind: "resetTarget", target });
    };

    /**
     * Track a host-initiated application, including an explicit draft-link open.
     * Returns its correlation ID, or an empty string after disposal.
     */
    public definitionApplicationStarted = (source: ICopilotApplicationSource<TBuild>): string => {
        if (this.disposed) {
            return "";
        }
        const id = uuid();
        this.update({ kind: "applicationStarted", id, source });
        return id;
    };

    /** Acknowledge installation, using the final applied object identifier. Stale IDs are ignored. */
    public definitionApplied = (applicationId: string, target: ICopilotTarget<TBuild>): void => {
        this.update({ kind: "applicationApplied", id: applicationId, target });
    };

    /** Release an interrupted application without cancelling a still-running response. */
    public definitionApplicationInterrupted = (applicationId: string): void => {
        this.update({ kind: "applicationInterrupted", id: applicationId });
    };

    /** Read the stable, recursively frozen snapshot. */
    public getSnapshot = (): ICopilotSnapshot<TBuild> => this.state;

    /** Subscribe directly to changes. The returned function removes this subscription. */
    public subscribe = (listener: () => void): (() => void) => {
        if (this.disposed) {
            return () => {};
        }
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    /** Query the same pure scoped progress selector used by headless consumers. */
    public getStatus = (scope: ICopilotScope<TBuild>): CopilotStatus =>
        selectCopilotStatus(this.state, scope);

    /** Whether a creation intent or skill-activated creation is still pending. */
    public isGenerationPending = (type: TBuild): boolean => selectCopilotGenerationPending(this.state, type);

    /** Read the foreground reasoning heading. */
    public getReasoningTitle = (): string | undefined => selectCopilotReasoningTitle(this.state);

    /** Read the origin associated with the applied object, not the selected chat. */
    public getAppliedSource = (target: ICopilotTarget<TBuild>): ICopilotSource | undefined =>
        selectCopilotSource(this.state, target);

    /** Permanently stop processing and release all listeners. Idempotent. */
    public dispose = (): void => {
        this.disposed = true;
        this.listeners.clear();
    };

    private update(input: CopilotInput<TBuild>): void {
        if (this.disposed) {
            return;
        }
        const next = transitionCopilot(this.state, input, this.configuration);
        if (next === this.state) {
            return;
        }
        this.state = freeze(next);
        const listeners = Array.from(this.listeners);
        for (const listener of listeners) {
            if (!this.disposed && this.listeners.has(listener)) {
                listener();
            }
        }
    }
}
