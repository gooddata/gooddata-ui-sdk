// (C) 2026 GoodData Corporation

import { type AgentCustomSkill } from "@gooddata/sdk-model";

import {
    type ChatClarificationQuestionsEvent,
    type ChatDefinitionReceivedEvent,
    type ChatEvent,
} from "../store/events.js";

/** Built-in copilot workflows. Applications may supply their own string enum. @alpha */
export enum CopilotBuildType {
    /** Dashboard creation and editing. */
    Dashboard = "dashboard",
}

/** Derived workflow progress, independent of host presentation. @alpha */
export type CopilotStatus = "idle" | "generating" | "building" | "waiting";

/** An object managed by a registered workflow. @alpha */
export interface ICopilotTarget<TBuild extends string = CopilotBuildType> {
    /** Registered workflow type. */
    readonly type: TBuild;
    /** Host object identifier. */
    readonly objectId: string;
}

/** Host facts used to resolve events, never application services. @alpha */
export interface ICopilotContext<TBuild extends string = CopilotBuildType> {
    /** Currently displayed workflow. */
    readonly type?: TBuild;
    /** Currently displayed object. */
    readonly objectId?: string;
    /** Whether the host allows edits to the displayed object. */
    readonly isEditing?: boolean;
    /** Object being displayed in a builder, if any. */
    readonly builderTarget?: ICopilotTarget<TBuild>;
}

/** Scope of a progress query. @alpha */
export interface ICopilotScope<TBuild extends string = CopilotBuildType> {
    /** Workflow to query. */
    readonly type: TBuild;
    /** Restrict activated requests to this object. */
    readonly objectId?: string;
    /** Include activated edit requests. */
    readonly isEditing?: boolean;
    /** Include activated requests and an existing foreground edit build. */
    readonly isBuilder?: boolean;
}

/** Conversation that supplied an applied definition. @alpha */
export interface ICopilotSource {
    /** Local conversation identifier, distinct from the backend thread. */
    readonly conversationId: string;
    /** Backend thread, when already assigned. */
    readonly threadId?: string;
}

/** Origin and intended target of a host definition application. @alpha */
export interface ICopilotApplicationSource<TBuild extends string = CopilotBuildType> {
    /** Intended object. The acknowledgement may supply its final identifier. */
    readonly target: ICopilotTarget<TBuild>;
    /** Originating local conversation, if known. */
    readonly conversationId?: string;
    /** Originating backend thread, if known. */
    readonly threadId?: string;
}

/** Foreground interaction; background requests are tracked independently. @alpha */
export interface ICopilotInteraction<TBuild extends string = CopilotBuildType> {
    /** Local conversation. */
    readonly conversationId?: string;
    /** Backend thread. */
    readonly threadId?: string;
    /** Current reasoning heading. */
    readonly reasoningTitle?: string;
    /** Response ended and needs another user message. */
    readonly waitingForUserInput: boolean;
    /** Unanswered clarification item identifiers, not conversation identifiers. */
    readonly pendingClarificationIds: readonly string[];
    /** Skill-activated workflow. */
    readonly build?: { readonly type: TBuild; readonly intent: "create" | "edit" };
}

/** A potentially editing response, including provisional requests without a skill. @alpha */
export interface ICopilotRequest<TBuild extends string = CopilotBuildType> {
    /** Monotonic request revision, distinguishing follow-ups in the same conversation. */
    readonly revision: number;
    /** Originating local conversation. */
    readonly conversationId?: string;
    /** Backend thread assigned to the request. */
    readonly threadId?: string;
    /** Resolved skill's workflow; absent until activation. */
    readonly type?: TBuild;
    /** Creation workflow requested for this response, even before skill activation. */
    readonly generation?: TBuild;
    /** Workflow intent captured at skill activation, independent of the selected conversation. */
    readonly intent?: "create" | "edit";
    /** Resolved object identifier. */
    readonly objectId?: string;
    /** Another conversation activated this workflow; late events must not regain ownership. */
    readonly superseded?: boolean;
    /** Whether this response awaits clarification. */
    readonly awaitingClarification?: boolean;
    /** Unanswered clarification item identifiers for this response. */
    readonly pendingClarificationIds?: readonly string[];
    /** Response ended; waiting for a user reply or in-progress definition application. */
    readonly responseFinished?: boolean;
    /** In-progress host applications. */
    readonly applicationIds: readonly string[];
}

/** An application awaiting an explicit host acknowledgement. @alpha */
export interface ICopilotApplication<
    TBuild extends string = CopilotBuildType,
> extends ICopilotApplicationSource<TBuild> {
    /** Facade-allocated correlation identifier. */
    readonly id: string;
    /** Monotonic revision used to ignore out-of-order source attribution. */
    readonly revision: number;
    /** Request revision captured when installation started. */
    readonly requestRevision: number;
}

/** Read-only workflow state shared by headless and React consumers. @alpha */
export interface ICopilotSnapshot<TBuild extends string = CopilotBuildType> {
    /** Last host facts. */
    readonly context: ICopilotContext<TBuild>;
    /** Requested creation, before skill activation. */
    readonly generation?: TBuild;
    /** Creation revision protecting a newer intent from older application acknowledgements. */
    readonly generationRevision?: number;
    /** Foreground chat interaction. */
    readonly interaction: ICopilotInteraction<TBuild>;
    /** Running responses and workflows waiting for user input across conversations. */
    readonly requests: readonly ICopilotRequest<TBuild>[];
    /** In-progress host installations. */
    readonly applications: readonly ICopilotApplication<TBuild>[];
    /** Last applied origin for each object, including unknown-origin tombstones. */
    readonly sources: readonly {
        readonly target: ICopilotTarget<TBuild>;
        readonly source?: ICopilotSource;
        readonly revision: number;
    }[];
    /** Monotonic lifecycle revision, not an allocated identifier. */
    readonly revision: number;
}

/** Pure definition target resolver and host effect for one workflow. @alpha */
export interface ICopilotRegistration<TBuild extends string = CopilotBuildType> {
    /** Workflow activated by these skills. */
    readonly type: TBuild;
    /** Skills that activate this workflow. */
    readonly skills: readonly AgentCustomSkill[];
    /**
     * Resolve a definition's target; return undefined for unsupported definitions.
     * The handler applies matching builder definitions, or live definitions for pending generation,
     * the builder's applied conversation, or the currently edited object.
     */
    readonly resolveDefinition: (
        event: ChatDefinitionReceivedEvent,
        context: ICopilotContext<TBuild>,
        snapshot: ICopilotSnapshot<TBuild>,
    ) => ICopilotTarget<TBuild> | undefined;
    /** Apply the accepted definition, then explicitly acknowledge its application ID. */
    readonly onApplyDefinition: (
        event: ChatDefinitionReceivedEvent,
        applicationId: string,
        target: ICopilotTarget<TBuild>,
    ) => void;
}

/** Configuration of an isolated copilot instance. @alpha */
export interface ICopilotConfiguration<TBuild extends string = CopilotBuildType> {
    /** Workflow registrations, in matching order. */
    readonly registrations: readonly ICopilotRegistration<TBuild>[];
    /** Show newly presented clarification after its state has been published. */
    readonly onClarificationQuestions?: (event: ChatClarificationQuestionsEvent) => void;
}

/** Explicit, deterministic input to the workflow engine. @alpha */
export type CopilotInput<TBuild extends string = CopilotBuildType> =
    | { readonly kind: "event"; readonly event: ChatEvent }
    | { readonly kind: "context"; readonly context: ICopilotContext<TBuild> }
    | { readonly kind: "startGeneration" | "cancelGeneration"; readonly type: TBuild }
    | { readonly kind: "resetInteraction" }
    | { readonly kind: "resetTarget"; readonly target: ICopilotTarget<TBuild> }
    | {
          readonly kind: "applicationStarted";
          readonly id: string;
          readonly source: ICopilotApplicationSource<TBuild>;
      }
    | { readonly kind: "applicationApplied"; readonly id: string; readonly target: ICopilotTarget<TBuild> }
    | { readonly kind: "applicationInterrupted"; readonly id: string };
