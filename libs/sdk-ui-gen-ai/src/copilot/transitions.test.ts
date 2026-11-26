// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type ChatAssistantMessageEvent,
    type ChatClarificationQuestionsEvent,
    type ChatEvent,
    type ChatUserMessageEvent,
} from "../store/events.js";

import {
    selectCopilotGenerationPending,
    selectCopilotReasoningTitle,
    selectCopilotReplyThreadId,
    selectCopilotSource,
    selectCopilotStatus,
} from "./selectors.js";
import { createCopilotState, transitionCopilot } from "./transitions.js";
import {
    CopilotBuildType,
    type CopilotInput,
    type ICopilotConfiguration,
    type ICopilotRequest,
    type ICopilotSnapshot,
} from "./types.js";

enum Build {
    Board = "board",
    Document = "document",
}

const configuration: ICopilotConfiguration<Build> = {
    registrations: [
        {
            type: Build.Board,
            skills: ["dashboard_builder", "dashboard_editor"],
            resolveDefinition: () => undefined,
            onApplyDefinition: () => {},
        },
        {
            type: Build.Document,
            skills: ["document_builder"],
            resolveDefinition: () => undefined,
            onApplyDefinition: () => {},
        },
    ],
};
const target = { type: Build.Board, objectId: "board" };
const scope = { ...target, isEditing: true, isBuilder: true };
const user = (threadId = "thread", conversationId = "local"): ChatUserMessageEvent => ({
    type: "chatUserMessage",
    threadId,
    conversationId,
    question: "Build",
    objects: [],
});
const skill = (threadId = "thread", responseCompleted = false): ChatAssistantMessageEvent => ({
    type: "chatAssistantMessage",
    threadId,
    useCase: "GENERAL",
    responseCompleted,
    skills: [{ name: "dashboard_builder", title: "Build" }],
});
const questions = (
    threadId = "thread",
    responses?: Record<string, string> | null,
): ChatClarificationQuestionsEvent => ({
    type: "chatClarificationQuestions",
    threadId,
    interactionId: "question",
    questions: [],
    responses,
});
const completed = (threadId = "thread", useCase = "GENERAL"): ChatAssistantMessageEvent => ({
    type: "chatAssistantMessage",
    threadId,
    useCase,
    responseCompleted: true,
});
const offeredChart = (threadId = "thread") => completed(threadId, "CREATE_VISUALIZATION");
const event = (value: ChatEvent): CopilotInput<Build> => ({ kind: "event", event: value });
const transition = (state: ICopilotSnapshot<Build>, input: CopilotInput<Build>) =>
    transitionCopilot(state, input, configuration);
const initial = () =>
    transition(createCopilotState<Build>(), { kind: "context", context: { ...target, isEditing: true } });
const started = () =>
    transition(transition(initial(), { kind: "startGeneration", type: Build.Board }), event(user()));
const activated = () => transition(started(), event(skill()));
const applying = (state = activated(), id = "application") =>
    transition(state, {
        kind: "applicationStarted",
        id,
        source: { target, conversationId: "local", threadId: "thread" },
    });

function freeze<T>(value: T): T {
    if (value && typeof value === "object") {
        Object.values(value).forEach(freeze);
        Object.freeze(value);
    }
    return value;
}

describe("pure copilot lifecycle", () => {
    it.each([false, true])(
        "retains cancellation after response cleanup until the originating conversation starts a new turn: activated=%s",
        (skillActivated) => {
            let state = transition(initial(), event(user()));
            if (skillActivated) {
                state = transition(state, event(skill()));
            }
            const previous = freeze(state);
            state = transition(state, { kind: "cancelGeneration", type: Build.Board });
            expect(previous.requests[0].superseded).toBeUndefined();
            expect(state.requests[0].superseded).toBe(true);
            expect(state.cancelledRequests).toEqual([
                { type: Build.Board, conversationId: "local", threadId: "thread" },
            ]);
            expect(selectCopilotStatus(state, scope)).toBe("idle");
            expect(transition(state, { kind: "cancelGeneration", type: Build.Board })).toBe(state);

            state = transition(state, event(completed()));
            expect(state.requests).toEqual([]);
            expect(state.cancelledRequests).toHaveLength(1);
            state = transition(state, event({ type: "chatReset" }));
            state = transition(state, event(user("thread", "other-local")));
            expect(state.cancelledRequests).toHaveLength(1);

            state = transition(state, event(user()));
            expect(state.cancelledRequests).toEqual([]);
            expect(state.requests).toEqual([
                expect.objectContaining({ conversationId: "other-local" }),
                expect.objectContaining({ conversationId: "local" }),
            ]);
        },
    );

    it.each([undefined, "local"])(
        "starts a new turn when answering a cancelled clarification with conversationId=%s",
        (conversationId) => {
            let state = transition(initial(), event(user()));
            state = transition(state, event(skill()));
            state = transition(state, event(questions()));
            state = transition(state, event(completed()));
            state = freeze(transition(state, { kind: "cancelGeneration", type: Build.Board }));
            expect(state.requests).toEqual([]);
            expect(state.interaction.build).toBeUndefined();
            expect(state.cancelledRequests).toHaveLength(1);
            const answers = {
                type: "chatUserAnswers",
                threadId: "thread",
                conversationId,
                interactionId: "question",
                answers: [],
            } satisfies ChatEvent;
            expect(transition(state, event({ ...answers, conversationId: "other-local" }))).toBe(state);

            const next = transition(state, event(answers));
            expect(next.cancelledRequests).toEqual([]);
            expect(state.cancelledRequests).toHaveLength(1);
            expect(next.revision).toBe(state.revision + 1);
            expect(next.requests).toEqual([
                expect.objectContaining({
                    conversationId,
                    threadId: "thread",
                    revision: next.revision,
                    applicationIds: [],
                }),
            ]);
            state = transition(next, event(skill()));
            expect(selectCopilotStatus(state, scope)).toBe("building");
            expect(state.requests[0]).toMatchObject({ type: Build.Board, intent: "edit" });
        },
    );

    it("only cancels provisional requests for the current workflow and leaves other activated work intact", () => {
        let state = transition(initial(), event(user("document-thread", "document-local")));
        state = transition(
            state,
            event({
                type: "chatAssistantMessage",
                threadId: "document-thread",
                useCase: "GENERAL",
                skills: [{ name: "document_builder", title: "Build document" }],
            }),
        );
        state = transition(state, event(user()));
        const document = state.requests[0];
        state = transition(state, { kind: "cancelGeneration", type: Build.Board });

        expect(state.requests[0]).toBe(document);
        expect(state.requests[1].superseded).toBe(true);
        expect(state.cancelledRequests).toEqual([
            { type: Build.Board, conversationId: "local", threadId: "thread" },
        ]);
        expect(selectCopilotStatus(state, { type: Build.Document, isBuilder: true })).toBe("building");
    });

    describe("target-reset lifecycle boundaries", () => {
        it.each([
            { name: "unbound provisional", request: {}, retained: false },
            { name: "untyped with another object", request: { objectId: "other" }, retained: false },
            { name: "same workflow without an object", request: { type: Build.Board }, retained: false },
            { name: "same target", request: { ...target }, retained: false },
            { name: "another object", request: { type: Build.Board, objectId: "other" }, retained: true },
            {
                name: "another workflow",
                request: { type: Build.Document, objectId: "board" },
                retained: true,
            },
            { name: "same generation", request: { generation: Build.Board }, retained: false },
            { name: "another generation", request: { generation: Build.Document }, retained: true },
            {
                name: "activated type before generation",
                request: { type: Build.Board, generation: Build.Document },
                retained: false,
            },
            { name: "superseded same target", request: { ...target, superseded: true }, retained: false },
            {
                name: "application on another object",
                request: { type: Build.Board, objectId: "other", applicationIds: ["application"] },
                retained: true,
            },
            {
                name: "application on another workflow",
                request: { type: Build.Document, applicationIds: ["application"] },
                retained: true,
            },
        ] satisfies { name: string; request: Partial<ICopilotRequest<Build>>; retained: boolean }[])(
            "retains only explicitly unrelated work: $name",
            ({ request, retained }) => {
                const state = freeze({
                    ...initial(),
                    requests: [{ revision: 1, applicationIds: [], ...request }],
                });
                const input = freeze({ kind: "resetTarget", target } as const);

                const next = transition(state, input);

                expect(next).toStrictEqual(
                    retained
                        ? state
                        : {
                              ...state,
                              requests: [],
                              interaction: {
                                  ...state.interaction,
                                  threadId: undefined,
                                  reasoningTitle: undefined,
                              },
                          },
                );
                expect(next === state).toBe(retained);
                expect(state.requests).toHaveLength(1);
                expect(transition(freeze(next), input)).toBe(next);
            },
        );

        it("preserves unrelated request order and clears only transient foreground fields", () => {
            const base = transition(activated(), event(questions()));
            const state = freeze({
                ...base,
                interaction: { ...base.interaction, reasoningTitle: "Planning", waitingForUserInput: true },
                requests: [
                    { ...base.requests[0], revision: 10, objectId: "other" },
                    base.requests[0],
                    { revision: 11, applicationIds: [] },
                    { ...base.requests[0], revision: 12, type: Build.Document },
                ],
                sources: [
                    {
                        target,
                        revision: 1,
                        source: { conversationId: "source-local", threadId: "source-thread" },
                    },
                ],
            });
            const input = freeze({ kind: "resetTarget", target } as const);

            const next = transition(state, input);

            expect(next).toStrictEqual({
                ...state,
                requests: [state.requests[0], state.requests[3]],
                interaction: {
                    ...state.interaction,
                    threadId: undefined,
                    reasoningTitle: undefined,
                    waitingForUserInput: false,
                },
            });
            expect(next.requests[0]).toBe(state.requests[0]);
            expect(next.requests[1]).toBe(state.requests[3]);
            expect(next.interaction.build).toBe(state.interaction.build);
            expect(next.interaction.pendingClarificationIds).toBe(state.interaction.pendingClarificationIds);
            expect(next.context).toBe(state.context);
            expect(next.applications).toBe(state.applications);
            expect(next.sources).toBe(state.sources);
            expect(state.interaction.threadId).toBe("thread");
            expect(state.requests).toHaveLength(4);
            expect(transition(freeze(next), input)).toBe(next);
        });

        describe.each([undefined, "board"])("with an application bound to object %s", (objectId) => {
            it.each([false, true])(
                "retains every request while installation is pending, response finished: %s",
                (responseFinished) => {
                    const base = applying();
                    const state = freeze({
                        ...base,
                        requests: [
                            { revision: 0, applicationIds: [] },
                            { ...base.requests[0], objectId, responseFinished },
                            { revision: 10, type: Build.Board, applicationIds: [] },
                        ],
                    });
                    const input = freeze({ kind: "resetTarget", target } as const);

                    const next = transition(state, input);

                    expect(next).toStrictEqual({
                        ...state,
                        interaction: {
                            ...state.interaction,
                            threadId: undefined,
                            reasoningTitle: undefined,
                            waitingForUserInput: false,
                        },
                    });
                    expect(next.requests).toBe(state.requests);
                    expect(next.applications).toBe(state.applications);
                    expect(next.interaction.build).toBe(state.interaction.build);
                    expect(transition(freeze(next), input)).toBe(next);
                },
            );
        });

        it("does not protect reset-target requests when only another target has a pending application", () => {
            const base = applying();
            const state = freeze({
                ...base,
                requests: [
                    { ...base.requests[0], objectId: "other" },
                    { revision: 10, type: Build.Board, applicationIds: [] },
                ],
            });

            const next = transition(state, freeze({ kind: "resetTarget", target } as const));

            expect(next.requests).toStrictEqual([state.requests[0]]);
            expect(next.requests[0]).toBe(state.requests[0]);
            expect(next.applications).toBe(state.applications);
            expect(next.generation).toBe(state.generation);
            expect(next.revision).toBe(state.revision);
            expect(state.requests).toHaveLength(2);
        });
    });

    describe("foreground-interaction lifecycle boundaries", () => {
        it.each(["local", "other-local"])(
            "preserves draft progress only when assigning its own local conversation: %s",
            (localId) => {
                let state = transition(initial(), { kind: "startGeneration", type: Build.Board });
                state = transition(state, event({ ...user(), threadId: undefined }));
                state = transition(state, event({ ...skill(), threadId: undefined }));
                state = transition(state, event({ ...completed(), threadId: undefined }));
                state = freeze(transition(state, event({ ...questions(), threadId: undefined })));
                const input = freeze(
                    event({
                        type: "chatConversationChanged",
                        threadId: "assigned",
                        conversation: { id: "assigned", localId, createdAt: "", updatedAt: "" },
                    }),
                );

                const next = transition(state, input);

                expect(next.interaction).toStrictEqual({
                    ...(localId === "local"
                        ? state.interaction
                        : { waitingForUserInput: false, pendingClarificationIds: [] }),
                    conversationId: localId,
                    threadId: "assigned",
                });
                expect(state.interaction.threadId).toBeUndefined();
                expect(state.interaction.pendingClarificationIds).toEqual(["question"]);
                expect(next.revision).toBe(state.revision);
                expect(next.generation).toBe(state.generation);
                expect(next.applications).toBe(state.applications);
                expect(transition(freeze(next), input)).toBe(next);
            },
        );

        it("clears foreground progress on reload with a replacement local ID even for the same thread", () => {
            let state = transition(activated(), event(completed()));
            state = transition(state, event(questions()));
            state = freeze(
                transition(state, event({ type: "chatReasoning", threadId: "thread", title: "Planning" })),
            );

            const next = transition(
                state,
                freeze(
                    event({
                        type: "chatConversationChanged",
                        threadId: "thread",
                        conversation: {
                            id: "thread",
                            localId: "reloaded-local",
                            createdAt: "",
                            updatedAt: "",
                        },
                    }),
                ),
            );

            expect(next.interaction).toStrictEqual({
                conversationId: "reloaded-local",
                threadId: "thread",
                waitingForUserInput: false,
                pendingClarificationIds: [],
            });
            expect(next.requests[0]).toStrictEqual({
                ...state.requests[0],
                conversationId: "reloaded-local",
            });
            expect(state.interaction.waitingForUserInput).toBe(true);
            expect(state.interaction.reasoningTitle).toBe("Planning");
        });

        it("updates only the foreground reasoning title and preserves identity for repeated titles", () => {
            const state = freeze(transition(activated(), event(questions())));
            const input = freeze(event({ type: "chatReasoning", threadId: "thread", title: "Planning" }));

            const next = freeze(transition(state, input));

            expect(next).toStrictEqual({
                ...state,
                interaction: { ...state.interaction, reasoningTitle: "Planning" },
            });
            expect(next.requests).toBe(state.requests);
            expect(next.interaction.pendingClarificationIds).toBe(state.interaction.pendingClarificationIds);
            expect(transition(next, input)).toBe(next);
            expect(
                transition(next, freeze(event({ type: "chatReasoning", threadId: "thread" }))),
            ).toStrictEqual({
                ...next,
                interaction: { ...next.interaction, reasoningTitle: undefined },
            });
            expect(state.interaction.reasoningTitle).toBeUndefined();
        });

        it.each([
            { threadId: "other-thread", conversationId: "local", preserve: true },
            { threadId: "thread", conversationId: "other-local", preserve: false },
            { threadId: "thread", conversationId: undefined, preserve: true },
        ])(
            "uses local-ID precedence and thread fallback on new input: $conversationId / $threadId",
            ({ threadId, conversationId, preserve }) => {
                let state = transition(activated(), event(completed()));
                state = transition(state, event(questions()));
                state = freeze(
                    transition(
                        state,
                        event({ type: "chatReasoning", threadId: "thread", title: "Planning" }),
                    ),
                );

                const next = transition(state, freeze(event({ ...user(), threadId, conversationId })));

                expect(next.interaction).toStrictEqual({
                    ...(preserve
                        ? state.interaction
                        : { pendingClarificationIds: [], waitingForUserInput: false }),
                    conversationId,
                    threadId,
                    reasoningTitle: undefined,
                    waitingForUserInput: false,
                });
                expect(next.revision).toBe(state.revision + 1);
                expect(state.interaction.reasoningTitle).toBe("Planning");
                expect(state.interaction.waitingForUserInput).toBe(true);
            },
        );

        it.each([null, { answer: "Yes" }])(
            "removes only the resolved clarification and clears the wait without losing build intent: %s",
            (responses) => {
                let state = transition(activated(), event(completed()));
                state = transition(state, event(questions()));
                state = freeze(
                    transition(state, event({ ...questions(), interactionId: "second-question" })),
                );

                const next = transition(state, freeze(event(questions("thread", responses))));

                expect(next.interaction).toStrictEqual({
                    ...state.interaction,
                    waitingForUserInput: false,
                    pendingClarificationIds: ["second-question"],
                });
                expect(next.interaction.build).toBe(state.interaction.build);
                expect(state.interaction.waitingForUserInput).toBe(true);
                expect(state.interaction.pendingClarificationIds).toEqual(["question", "second-question"]);
            },
        );

        it.each([
            { ...skill(), threadId: undefined },
            { ...completed(), threadId: undefined },
            { ...completed(), threadId: undefined, useCase: "INVALID" },
            { ...questions(), threadId: undefined },
        ] satisfies ChatEvent[])("ignores unassigned $type after the foreground has a thread", (value) => {
            const state = freeze(activated());

            expect(transition(state, freeze(event(value)))).toBe(state);
        });

        it.each(["local", undefined])(
            "uses retained local ownership for completion during an application after navigation: %s",
            (conversationId) => {
                let state = transition(initial(), { kind: "startGeneration", type: Build.Board });
                state = transition(state, event({ ...user(), conversationId }));
                state = transition(state, event(skill()));
                state = transition(state, {
                    kind: "applicationStarted",
                    id: "application",
                    source: { target, conversationId, threadId: "thread" },
                });
                state = freeze(transition(state, { kind: "resetTarget", target }));

                const next = transition(state, freeze(event(completed())));

                expect(next.interaction).toStrictEqual({
                    ...state.interaction,
                    waitingForUserInput: conversationId !== undefined,
                });
                expect(next.interaction.threadId).toBeUndefined();
                expect(next.interaction.build).toBe(state.interaction.build);
                expect(next.applications).toBe(state.applications);
                expect(next.requests[0].applicationIds).toBe(state.requests[0].applicationIds);
                expect(state.interaction.waitingForUserInput).toBe(false);
            },
        );

        it("clears newly superseded foreground progress without switching its conversation", () => {
            let state = transition(activated(), event(user("other", "other-local")));
            state = transition(
                state,
                event({
                    type: "chatConversationChanged",
                    threadId: "thread",
                    conversation: { id: "thread", localId: "local", createdAt: "", updatedAt: "" },
                }),
            );
            state = transition(state, event(questions()));
            state = freeze(
                transition(state, event({ type: "chatReasoning", threadId: "thread", title: "Planning" })),
            );

            const next = transition(state, freeze(event(skill("other"))));

            expect(next.interaction).toStrictEqual({
                conversationId: "local",
                threadId: "thread",
                waitingForUserInput: false,
                pendingClarificationIds: [],
            });
            expect(next.requests[0].superseded).toBe(true);
            expect(state.requests[0].superseded).not.toBe(true);
            expect(state.interaction.pendingClarificationIds).toEqual(["question"]);
            const superseded = freeze(next);
            for (const value of [
                questions(),
                { type: "chatReasoning", threadId: "thread", title: "Late" },
            ] satisfies ChatEvent[]) {
                expect(transition(superseded, freeze(event(value)))).toBe(superseded);
            }
        });
    });

    describe("request lifecycle boundaries", () => {
        describe.each([false, true])("new input with an applying request: %s", (installing) => {
            it.each([false, true])(
                "appends a new revision without moving unrelated work (clarification reply: %s)",
                (answering) => {
                    let state = installing ? applying() : activated();
                    state = transition(state, event(questions()));
                    state = transition(state, event({ ...questions(), interactionId: "second-question" }));
                    state = freeze(transition(state, event(user("other", "other-local"))));
                    const [pending, unrelated] = state.requests;
                    const input = freeze(
                        event(
                            answering
                                ? {
                                      type: "chatUserAnswers",
                                      threadId: "thread",
                                      conversationId: "local",
                                      interactionId: "question",
                                      answers: [],
                                  }
                                : user(),
                        ),
                    );

                    const next = transition(state, input);

                    expect(next.revision).toBe(state.revision + 1);
                    expect(next.requests.slice(0, -1)).toEqual(
                        installing ? [unrelated, pending] : [unrelated],
                    );
                    expect(next.requests[0]).toBe(unrelated);
                    expect(next.requests.includes(pending)).toBe(installing);
                    expect(next.requests.at(-1)).toStrictEqual({
                        revision: next.revision,
                        conversationId: "local",
                        threadId: "thread",
                        type: pending.type,
                        generation: pending.generation,
                        intent: pending.intent,
                        objectId: pending.objectId,
                        pendingClarificationIds: answering ? ["second-question"] : undefined,
                        awaitingClarification: answering,
                        applicationIds: [],
                    });
                    expect(next.applications).toBe(state.applications);
                    expect(pending.pendingClarificationIds).toEqual(["question", "second-question"]);
                },
            );
        });

        it.each([
            { input: user("reassigned", "local"), retained: false },
            { input: user("thread", "different-local"), retained: true },
            { input: { ...user(), conversationId: undefined }, retained: false },
        ])(
            "correlates new input using local identity before thread fallback: $input",
            ({ input, retained }) => {
                const state = freeze(activated());
                const pending = state.requests[0];

                const next = transition(state, freeze(event(input)));

                expect(next.requests).toHaveLength(retained ? 2 : 1);
                expect(next.requests.includes(pending)).toBe(retained);
                expect(next.requests.at(-1)).toMatchObject({
                    revision: state.revision + 1,
                    threadId: input.threadId,
                    conversationId: input.conversationId,
                    type: retained ? undefined : pending.type,
                    generation: retained ? undefined : pending.generation,
                    intent: retained ? undefined : pending.intent,
                });
            },
        );

        it("matches reloads by assigned thread before a colliding local conversation", () => {
            const state = freeze(transition(activated(), event(user("other", "other-local"))));
            const input = freeze(
                event({
                    type: "chatConversationChanged",
                    threadId: "thread",
                    conversation: { id: "thread", localId: "other-local", createdAt: "", updatedAt: "" },
                }),
            );

            const next = transition(state, input);

            expect(next.requests).toEqual([
                { ...state.requests[0], conversationId: "other-local" },
                state.requests[1],
            ]);
            expect(next.requests[1]).toBe(state.requests[1]);
            expect(next.revision).toBe(state.revision);
            expect(next.applications).toBe(state.applications);
        });

        it("keeps duplicate clarification events unchanged and removes only the answered item", () => {
            let state = transition(activated(), event(questions()));
            state = freeze(transition(state, event({ ...questions(), interactionId: "second-question" })));

            expect(transition(state, freeze(event(questions())))).toBe(state);

            const next = transition(state, freeze(event(questions("thread", null))));

            expect(next.requests[0]).toStrictEqual({
                ...state.requests[0],
                pendingClarificationIds: ["second-question"],
            });
            expect(next.requests[0].awaitingClarification).toBe(true);
            expect(state.requests[0].pendingClarificationIds).toEqual(["question", "second-question"]);
            expect(next.revision).toBe(state.revision);
        });

        it("finishes only the newest response revision while the old revision still owns its application", () => {
            const state = freeze(transition(applying(), event(user())));

            const next = transition(state, freeze(event(completed())));

            expect(next.requests).toEqual([
                state.requests[0],
                { ...state.requests[1], responseFinished: true },
            ]);
            expect(next.requests[0]).toBe(state.requests[0]);
            expect(next.requests[1].applicationIds).toEqual([]);
            expect(next.applications).toBe(state.applications);
            expect(next.revision).toBe(state.revision);
            const applied = transition(freeze(next), {
                kind: "applicationApplied",
                id: "application",
                target,
            });
            expect(applied.requests).toEqual([next.requests[1]]);
            expect(applied.requests[0]).toBe(next.requests[1]);
        });

        it("transfers ownership even when the activating edit completes and is removed in the same event", () => {
            const state = freeze(transition(activated(), event(user("other", "other-local"))));

            const next = transition(state, freeze(event(skill("other", true))));

            expect(next.requests).toStrictEqual([{ ...state.requests[0], superseded: true }]);
            expect(next.revision).toBe(state.revision);
            expect(next.applications).toBe(state.applications);
            const superseded = freeze(next);
            for (const value of [skill(), questions()]) {
                expect(transition(superseded, freeze(event(value)))).toBe(superseded);
            }
            expect(transition(superseded, freeze(event(completed()))).requests).toEqual([]);
        });
    });

    it("keeps late thread assignment for superseded drafts without restoring ownership", () => {
        let state = transition(initial(), { kind: "startGeneration", type: Build.Board });
        state = transition(state, event(user("", "draft-local")));
        state = transition(state, event(user("other", "other-local")));
        state = transition(state, event(skill("other")));
        expect(state.requests[0].superseded).toBe(true);
        state = transition(
            state,
            event({
                type: "chatConversationChanged",
                threadId: "assigned",
                conversation: { id: "assigned", localId: "draft-local", createdAt: "", updatedAt: "" },
            }),
        );
        expect(state.requests[0]).toMatchObject({
            conversationId: "draft-local",
            threadId: "assigned",
            superseded: true,
        });
        expect(selectCopilotStatus(state, scope)).toBe("building");
        state = transition(state, event(completed("assigned")));
        expect(state.requests).toHaveLength(1);
        expect(state.requests[0].threadId).toBe("other");
        expect(selectCopilotStatus(state, scope)).toBe("building");
    });

    it.each([false, true])(
        "keeps ownership independent across targets (completed activation: %s)",
        (responseCompleted) => {
            let state = transition(activated(), event(completed()));
            const otherTarget = { ...target, objectId: "other-board" };
            state = transition(state, { kind: "context", context: { ...otherTarget, isEditing: true } });
            state = transition(state, event(user("other", "other-local")));
            state = transition(state, event(skill("other", responseCompleted)));
            expect(state.requests[0]).toMatchObject({
                ...target,
                threadId: "thread",
                responseFinished: true,
            });
            expect(state.requests[0].superseded).not.toBe(true);
            expect(selectCopilotStatus(state, target)).toBe("waiting");
            expect(selectCopilotStatus(state, { ...otherTarget, isEditing: true })).toBe(
                responseCompleted ? "idle" : "building",
            );
            expect(selectCopilotReplyThreadId(state, target)).toBe("thread");
        },
    );

    it("keeps ownership independent across registered workflow types", () => {
        let state = transition(activated(), event(completed()));
        const otherTarget = { type: Build.Document, objectId: "document" };
        state = transition(state, { kind: "context", context: { ...otherTarget, isEditing: true } });
        state = transition(state, event(user("other", "other-local")));
        state = transition(
            state,
            event({ ...skill("other"), skills: [{ name: "document_builder", title: "Document" }] }),
        );
        expect(state.requests[0].superseded).not.toBe(true);
        expect(selectCopilotStatus(state, target)).toBe("waiting");
        expect(selectCopilotStatus(state, { ...otherTarget, isEditing: true })).toBe("building");
        expect(selectCopilotReplyThreadId(state, target)).toBe("thread");
    });

    describe.each([false, true])("loader ownership (clarification: %s)", (clarification) => {
        it.each([false, true])(
            "keeps the owner when a new chat initially reports the previous thread (skill already activated: %s)",
            (activatedSkill) => {
                let state = activatedSkill ? activated() : started();
                if (clarification) {
                    state = transition(state, event(questions()));
                }
                state = transition(state, event(completed()));
                const owner = state.requests[0];
                const updates: ChatEvent[] = [
                    user("thread", "new-local"),
                    {
                        type: "chatConversationChanged",
                        threadId: "new-thread",
                        conversation: {
                            id: "new-thread",
                            localId: "new-local",
                            createdAt: "",
                            updatedAt: "",
                        },
                    },
                    { type: "chatReasoning", threadId: "new-thread", title: "Unrelated reasoning" },
                    completed("new-thread"),
                ];
                for (const value of updates) {
                    state = transition(state, event(value));
                    expect(state.requests[0]).toBe(owner);
                    expect(selectCopilotStatus(state, scope)).toBe("waiting");
                    expect(selectCopilotReplyThreadId(state, scope)).toBe("thread");
                }
                state = transition(state, event(user()));
                expect(selectCopilotStatus(state, scope)).toBe(activatedSkill ? "building" : "generating");
            },
        );

        it.each([false, true])(
            "keeps creation mode when ownership transfers in a read-only host (skill already activated: %s)",
            (activatedSkill) => {
                let state = transition(activatedSkill ? activated() : started(), {
                    kind: "context",
                    context: target,
                });
                if (clarification) {
                    state = transition(state, event(questions()));
                }
                state = transition(state, event(completed()));
                state = transition(state, event(user("other", "other-local")));
                expect(selectCopilotStatus(state, target)).toBe("waiting");
                state = transition(state, event(skill("other")));
                expect(selectCopilotStatus(state, target)).toBe("building");
                expect(selectCopilotGenerationPending(state, Build.Board)).toBe(true);
                state = transition(state, event(completed("other")));
                expect(selectCopilotStatus(state, target)).toBe("waiting");
                expect(selectCopilotReplyThreadId(state, target)).toBe("other");
                state = transition(
                    state,
                    event({
                        type: "chatAssistantMessage",
                        threadId: "other",
                        useCase: "GENERAL",
                        cancelled: true,
                    }),
                );
                expect(selectCopilotStatus(state, target)).toBe("idle");
                state = transition(state, event(skill()));
                expect(selectCopilotStatus(state, target)).toBe("idle");
            },
        );

        it.each([false, true])(
            "ignores unrelated chat activity (skill already activated: %s)",
            (activatedSkill) => {
                let state = activatedSkill ? activated() : started();
                if (clarification) {
                    state = transition(state, event(questions()));
                }
                state = transition(state, event(completed()));
                state = transition(state, event(user("other", "other-local")));
                const unrelated: ChatEvent[] = [
                    { type: "chatReasoning", threadId: "other", title: "Unrelated" },
                    {
                        type: "chatAssistantMessage",
                        threadId: "other",
                        useCase: "GENERAL",
                        skills: [{ name: "alert", title: "Alert" }],
                    },
                    questions("other"),
                    completed("other"),
                    { type: "chatAssistantMessage", threadId: "other", useCase: "INVALID" },
                    { type: "chatAssistantMessage", threadId: "other", useCase: "GENERAL", cancelled: true },
                ];
                for (const value of unrelated) {
                    state = transition(state, event(value));
                    expect(selectCopilotStatus(state, scope)).toBe("waiting");
                    expect(selectCopilotReplyThreadId(state, scope)).toBe("thread");
                    expect(selectCopilotReasoningTitle(state, scope)).toBeUndefined();
                    expect(selectCopilotGenerationPending(state, Build.Board)).toBe(true);
                }
                state = transition(state, event(user()));
                expect(selectCopilotStatus(state, scope)).toBe(activatedSkill ? "building" : "generating");
                state = transition(
                    state,
                    event({ type: "chatAssistantMessage", threadId: "thread", useCase: "INVALID" }),
                );
                expect(selectCopilotStatus(state, scope)).toBe("idle");
            },
        );

        it.each(["dashboard_builder", "dashboard_editor"] as const)(
            "transfers ownership only on %s and never resurrects the old wait",
            (name) => {
                let state = activated();
                if (clarification) {
                    state = transition(state, event(questions()));
                }
                state = transition(state, event(completed()));
                state = transition(state, event(user("other", "other-local")));
                state = transition(state, event({ ...skill("other"), skills: [{ name, title: "Build" }] }));
                expect(selectCopilotStatus(state, scope)).toBe("building");
                state = transition(state, event(questions("other")));
                expect(selectCopilotStatus(state, scope)).toBe("waiting");
                expect(selectCopilotReplyThreadId(state, scope)).toBe("other");
                for (const value of [skill(), questions(), completed()]) {
                    state = transition(state, event(value));
                    expect(selectCopilotStatus(state, scope)).toBe("waiting");
                    expect(selectCopilotReplyThreadId(state, scope)).toBe("other");
                }
                const failed = transition(
                    state,
                    event({ type: "chatAssistantMessage", threadId: "other", useCase: "INVALID" }),
                );
                expect(selectCopilotStatus(failed, scope)).toBe("idle");
                expect(selectCopilotGenerationPending(failed, Build.Board)).toBe(false);
                state = transition(state, {
                    kind: "applicationStarted",
                    id: "other-application",
                    source: { target, threadId: "other", conversationId: "other-local" },
                });
                state = transition(state, { kind: "applicationApplied", id: "other-application", target });
                expect(selectCopilotStatus(state, scope)).toBe("idle");
                expect(selectCopilotGenerationPending(state, Build.Board)).toBe(false);
                state = transition(state, event(user()));
                expect(selectCopilotStatus(state, scope)).toBe("idle");
                state = transition(state, event(skill()));
                expect(selectCopilotStatus(state, scope)).toBe("building");
            },
        );
    });

    describe.each([false, true])("creation before skill activation (clarification: %s)", (clarification) => {
        it.each([
            { type: "chatAssistantMessage", threadId: "thread", useCase: "INVALID" },
            { type: "chatAssistantMessage", threadId: "thread", useCase: "GENERAL", cancelled: true },
        ] satisfies ChatEvent[])("releases its background wait on $useCase", (value) => {
            let state = started();
            if (clarification) {
                state = transition(state, event(questions()));
            }
            state = transition(state, event(completed()));
            state = transition(state, event({ type: "chatReset" }));
            expect(selectCopilotStatus(state, target)).toBe("waiting");
            state = transition(state, event(value));
            expect(selectCopilotStatus(state, target)).toBe("idle");
            expect(selectCopilotGenerationPending(state, Build.Board)).toBe(false);
        });

        it("releases its background wait when the definition is applied", () => {
            let state = started();
            if (clarification) {
                state = transition(state, event(questions()));
            }
            state = transition(state, event(completed()));
            state = transition(state, event({ type: "chatReset" }));
            state = transition(state, event(user("other", "other-local")));
            state = applying(state);
            expect(selectCopilotStatus(state, target)).toBe("building");
            state = transition(state, { kind: "applicationApplied", id: "application", target });
            expect(selectCopilotStatus(state, target)).toBe("idle");
            expect(selectCopilotGenerationPending(state, Build.Board)).toBe(false);
        });

        it.each([false, true])(
            "preserves waiting in its original chat (switch before completion: %s)",
            (switchFirst) => {
                let state = started();
                if (clarification) {
                    state = transition(state, event(questions()));
                }
                if (switchFirst) {
                    state = transition(state, event({ type: "chatReset" }));
                }
                state = transition(state, event(completed()));
                state = transition(state, event({ type: "chatReset" }));
                expect(selectCopilotStatus(state, target)).toBe("waiting");
                state = transition(state, event(user("other", "other-local")));
                expect(state.requests[1].generation).toBeUndefined();
                expect(selectCopilotStatus(state, target)).toBe("waiting");
                state = transition(state, event(user()));
                expect(selectCopilotStatus(state, target)).toBe("generating");
                state = transition(state, event(skill()));
                expect(state.interaction.build?.intent).toBe("create");
                expect(selectCopilotStatus(state, target)).toBe("building");
                state = transition(state, event(completed()));
                state = transition(state, { kind: "cancelGeneration", type: Build.Board });
                expect(selectCopilotStatus(state, target)).toBe("idle");
            },
        );
    });

    describe.each(["clarification", "reply"] as const)("waiting for %s across chats", (waiting) => {
        it.each(
            waiting === "clarification"
                ? (["create", "edit", "builder"] as const)
                : (["create", "builder"] as const),
        )("preserves and resumes a %s workflow", (workflow) => {
            const query = {
                ...target,
                isEditing: workflow === "edit",
                isBuilder: workflow === "builder",
            };
            let state =
                workflow === "create"
                    ? activated()
                    : transition(transition(initial(), event(user())), event(skill()));
            if (workflow === "builder") {
                state = transition(state, { kind: "context", context: { ...target, builderTarget: target } });
            }
            if (waiting === "clarification" || workflow === "builder") {
                state = transition(state, event(questions()));
            }
            state = transition(state, event(completed()));
            expect(selectCopilotStatus(state, query)).toBe("waiting");
            state = transition(
                state,
                event({
                    type: "chatConversationChanged",
                    threadId: "other",
                    conversation: { id: "other", localId: "other-local", createdAt: "", updatedAt: "" },
                }),
            );
            expect(state.interaction.build).toBeUndefined();
            expect(selectCopilotStatus(state, query)).toBe("waiting");
            expect(state.requests[0]).toMatchObject({ type: Build.Board, responseFinished: true });
            expect(selectCopilotStatus(state, { ...query, objectId: "unrelated" })).toBe("idle");
            state = transition(
                state,
                event({
                    type: "chatConversationChanged",
                    threadId: "thread",
                    conversation: { id: "thread", localId: "local", createdAt: "", updatedAt: "" },
                }),
            );
            state = transition(
                state,
                event(
                    waiting === "clarification"
                        ? {
                              type: "chatUserAnswers",
                              threadId: "thread",
                              conversationId: "local",
                              interactionId: "question",
                              answers: [],
                          }
                        : user(),
                ),
            );
            expect(selectCopilotStatus(state, query)).toBe("building");
            expect(state.requests[0].intent).toBe(workflow === "create" ? "create" : "edit");
            state = transition(state, event(skill()));
            expect(state.requests[0].intent).toBe(workflow === "create" ? "create" : "edit");
            expect(state.interaction.build?.intent).toBe(workflow === "create" ? "create" : "edit");
            state = applying(state);
            state = transition(state, event(completed()));
            expect(selectCopilotStatus(state, query)).toBe("building");
            state = transition(state, { kind: "applicationApplied", id: "application", target });
            expect(selectCopilotStatus(state, query)).toBe("idle");
            expect(state.requests).toEqual([]);
        });

        it("releases a background wait on explicit cancellation", () => {
            let state = activated();
            if (waiting === "clarification") {
                state = transition(state, event(questions()));
            }
            state = transition(state, event(completed()));
            state = transition(state, event({ type: "chatReset" }));
            expect(selectCopilotStatus(state, target)).toBe("waiting");
            state = transition(state, { kind: "cancelGeneration", type: Build.Board });
            expect(state.requests).toEqual([]);
            expect(selectCopilotStatus(state, target)).toBe("idle");
        });

        it.each([
            {
                kind: "event",
                event: { type: "chatAssistantMessage", threadId: "thread", useCase: "INVALID" },
            },
            {
                kind: "event",
                event: {
                    type: "chatAssistantMessage",
                    threadId: "thread",
                    useCase: "GENERAL",
                    cancelled: true,
                },
            },
            { kind: "resetTarget", target },
        ] satisfies CopilotInput<Build>[])("releases a background wait on $kind", (input) => {
            let state = activated();
            if (waiting === "clarification") {
                state = transition(state, event(questions()));
            }
            state = transition(state, event(completed()));
            state = transition(state, event({ type: "chatReset" }));
            expect(selectCopilotStatus(state, target)).toBe("waiting");
            state = transition(state, input);
            expect(state.requests).toEqual([]);
            expect(selectCopilotStatus(state, target)).toBe("idle");
        });
    });

    it("retains a waiting request when skill activation arrives with completion", () => {
        let state = transition(started(), event(questions()));
        state = transition(state, event(skill("thread", true)));
        state = transition(state, event({ type: "chatReset" }));
        expect(selectCopilotStatus(state, target)).toBe("waiting");
        expect(state.requests[0]).toMatchObject({
            type: Build.Board,
            intent: "create",
            responseFinished: true,
        });
    });

    it.each([false, true])(
        "keeps creation owned by its request after switching chats (builder: %s)",
        (isBuilder) => {
            const query = { ...target, isBuilder };
            let state = transition(
                activated(),
                event({ type: "chatReasoning", threadId: "thread", title: "Planning" }),
            );
            state = transition(
                state,
                event({
                    type: "chatConversationChanged",
                    threadId: "other",
                    conversation: { id: "other", localId: "other-local", createdAt: "", updatedAt: "" },
                }),
            );
            expect(state.interaction.build).toBeUndefined();
            expect(state.interaction.reasoningTitle).toBeUndefined();
            expect(selectCopilotStatus(state, query)).toBe("building");
            expect(selectCopilotGenerationPending(state, Build.Board)).toBe(true);
            expect(selectCopilotStatus(state, { type: Build.Board, objectId: "unrelated", isBuilder })).toBe(
                "idle",
            );
            expect(selectCopilotStatus(state, { type: Build.Document, isBuilder })).toBe("idle");
            state = transition(state, event(questions()));
            expect(selectCopilotStatus(state, query)).toBe("waiting");
            state = applying(state);
            state = transition(state, event(completed()));
            expect(selectCopilotStatus(state, query)).toBe("building");
            state = transition(state, { kind: "applicationApplied", id: "application", target });
            expect(selectCopilotStatus(state, query)).toBe("idle");
            expect(selectCopilotGenerationPending(state, Build.Board)).toBe(false);
        },
    );

    it.each([
        completed(),
        { type: "chatAssistantMessage", threadId: "thread", useCase: "INVALID" },
        { type: "chatAssistantMessage", threadId: "thread", useCase: "GENERAL", cancelled: true },
    ] satisfies ChatEvent[])(
        "waits on normal background completion and releases on failure or cancellation: $type",
        (value) => {
            let state = transition(activated(), event({ type: "chatReset" }));
            expect(selectCopilotStatus(state, { type: Build.Board })).toBe("building");
            state = transition(state, event(value));
            const waiting = value.type === "chatAssistantMessage" && value.responseCompleted === true;
            expect(selectCopilotStatus(state, { type: Build.Board })).toBe(waiting ? "waiting" : "idle");
            expect(selectCopilotGenerationPending(state, Build.Board)).toBe(waiting);
            state = transition(state, { kind: "cancelGeneration", type: Build.Board });
            expect(selectCopilotStatus(state, { type: Build.Board })).toBe("idle");
            expect(selectCopilotGenerationPending(state, Build.Board)).toBe(false);
        },
    );

    it("keeps an activated edit building in a builder after switching chats, but not in read-only scope", () => {
        let state = transition(transition(initial(), event(user())), event(skill()));
        state = transition(state, { kind: "context", context: { ...target, builderTarget: target } });
        state = transition(state, event({ type: "chatReset" }));
        expect(selectCopilotStatus(state, { ...target, isBuilder: true })).toBe("building");
        expect(selectCopilotStatus(state, target)).toBe("idle");
        expect(selectCopilotGenerationPending(state, Build.Board)).toBe(false);
        state = transition(state, event(questions()));
        state = transition(state, event(completed()));
        expect(selectCopilotStatus(state, { ...target, isBuilder: true })).toBe("waiting");
        expect(selectCopilotStatus(state, target)).toBe("idle");
        state = transition(state, { kind: "cancelGeneration", type: Build.Board });
        expect(selectCopilotStatus(state, { ...target, isBuilder: true })).toBe("idle");
    });

    it("releases a builder follow-up whose answer offers nothing to place", () => {
        let state = transition(transition(initial(), event(user())), event(skill()));
        state = transition(state, { kind: "context", context: { ...target, builderTarget: target } });
        state = transition(state, event(questions()));
        state = transition(state, event(completed()));
        expect(selectCopilotStatus(state, scope)).toBe("waiting");
        state = transition(state, event(user()));
        state = transition(state, event(completed()));
        expect(selectCopilotStatus(state, scope)).toBe("idle");
        expect(state.requests).toEqual([]);
        expect(state.interaction.build).toBeUndefined();
    });

    it("preserves original intent but transfers ownership when another chat activates editing", () => {
        let state = transition(activated(), event({ type: "chatReset" }));
        state = transition(state, event(user("other", "other-local")));
        state = transition(state, event(skill("other")));
        expect(state.interaction.build?.intent).toBe("edit");
        expect(state.requests[0]).toMatchObject({ intent: "create", superseded: true });
        state = transition(state, event(skill()));
        expect(selectCopilotStatus(state, target)).toBe("idle");
        expect(selectCopilotGenerationPending(state, Build.Board)).toBe(false);
        state = transition(state, event(completed()));
        expect(selectCopilotStatus(state, target)).toBe("idle");
        expect(selectCopilotStatus(state, scope)).toBe("building");
        state = transition(state, event(questions("other")));
        state = transition(state, event(completed("other")));
        expect(selectCopilotStatus(state, { ...target, isEditing: true })).toBe("waiting");
        expect(selectCopilotStatus(state, scope)).toBe("waiting");
        expect(selectCopilotReplyThreadId(state, scope)).toBe("other");
        expect(state.requests).toEqual([
            expect.objectContaining({ threadId: "other", intent: "edit", awaitingClarification: true }),
        ]);
    });

    describe("a builder edit turn from the chat that filled the builder", () => {
        const built = () =>
            transition(
                applying(
                    transition(initial(), {
                        kind: "context",
                        context: { ...target, isEditing: true, builderTarget: target },
                    }),
                ),
                { kind: "applicationApplied", id: "application", target },
            );
        const answer = (threadId = "thread"): ChatAssistantMessageEvent => ({
            type: "chatAssistantMessage",
            threadId,
            useCase: "GENERAL",
        });
        const turn = (
            state: ICopilotSnapshot<Build>,
            newSkill: boolean,
            threadId = "thread",
            local = "local",
        ) =>
            transition(
                transition(state, event(user(threadId, local))),
                event(newSkill ? skill(threadId) : answer(threadId)),
            );
        const questionnaire = (state: ICopilotSnapshot<Build>, threadId = "thread") =>
            transition(transition(state, event(questions(threadId))), event(completed(threadId)));

        it.each([true, false])(
            "releases the builder when the answer offers a chart (new skill item: %s)",
            (newSkill) => {
                const state = transition(turn(built(), newSkill), event(offeredChart()));
                expect(selectCopilotStatus(state, scope)).toBe("idle");
                expect(state.requests).toEqual([]);
                expect(state.interaction.build).toBeUndefined();
            },
        );

        it.each([true, false])(
            "releases the builder when the answer asks a question in text (new skill item: %s)",
            (newSkill) => {
                const state = transition(turn(built(), newSkill), event(completed()));
                expect(selectCopilotStatus(state, scope)).toBe("idle");
                expect(state.requests).toEqual([]);
                expect(state.interaction.build).toBeUndefined();
            },
        );

        it.each([true, false])(
            "keeps the builder waiting while a questionnaire is open (new skill item: %s)",
            (newSkill) => {
                const state = questionnaire(turn(built(), newSkill));
                expect(selectCopilotStatus(state, scope)).toBe("waiting");
                expect(selectCopilotReplyThreadId(state, scope)).toBe("thread");
            },
        );

        it("shows building while the reply to a questionnaire streams", () => {
            let state = questionnaire(turn(built(), false));
            state = transition(
                state,
                event({
                    type: "chatUserAnswers",
                    threadId: "thread",
                    conversationId: "local",
                    interactionId: "question",
                    answers: [],
                }),
            );
            state = transition(state, event(answer()));
            expect(selectCopilotStatus(state, scope)).toBe("building");
        });

        it("shows building while a yes to an offered chart streams and places it", () => {
            let state = transition(turn(built(), true), event(offeredChart()));
            state = turn(state, false);
            expect(selectCopilotStatus(state, scope)).toBe("building");
            state = applying(state, "placement");
            expect(selectCopilotStatus(state, scope)).toBe("building");
            state = transition(state, { kind: "applicationApplied", id: "placement", target });
            state = transition(state, event(completed()));
            expect(selectCopilotStatus(state, scope)).toBe("idle");
        });

        it("leaves the builder idle when another chat offered a chart and this chat gets a plain answer", () => {
            let state = turn(built(), true, "other", "other-local");
            state = transition(state, event(offeredChart("other")));
            expect(selectCopilotStatus(state, scope)).toBe("idle");
            state = transition(turn(state, false), event(completed()));
            expect(selectCopilotStatus(state, scope)).toBe("idle");
            expect(state.requests).toEqual([]);
        });

        it("keeps another chat's open questionnaire when this chat gets a plain answer", () => {
            let state = questionnaire(turn(built(), true, "other", "other-local"), "other");
            expect(selectCopilotStatus(state, scope)).toBe("waiting");
            state = transition(turn(state, false), event(completed()));
            expect(selectCopilotStatus(state, scope)).toBe("waiting");
            expect(selectCopilotReplyThreadId(state, scope)).toBe("other");
            expect(state.requests).toHaveLength(1);
            expect(state.requests[0]).toMatchObject({ threadId: "other", awaitingClarification: true });
            expect(state.requests[0].superseded).not.toBe(true);
        });
    });

    it.each([
        completed(),
        { type: "chatAssistantMessage", threadId: "thread", useCase: "INVALID" },
        { type: "chatAssistantMessage", threadId: "thread", useCase: "GENERAL", cancelled: true },
    ] satisfies ChatEvent[])("keeps an installation building outside edit scope after $useCase", (value) => {
        const state = transition(applying(), event(value));
        expect(selectCopilotStatus(state, { type: Build.Board, isBuilder: true })).toBe("building");
        expect(selectCopilotStatus(state, { type: Build.Board })).toBe("building");
        expect(selectCopilotStatus(state, { type: Build.Document })).toBe("idle");
    });
    describe.each([
        { workflow: "creation before skill activation", create: true, activatedSkill: false },
        { workflow: "creation after skill activation", create: true, activatedSkill: true },
        { workflow: "editing", create: false, activatedSkill: true },
    ])("typed clarification reply during $workflow", ({ create, activatedSkill }) => {
        const waiting = (responseCompleted = true) => {
            let state = create ? started() : transition(initial(), event(user()));
            if (activatedSkill) {
                state = transition(state, event(skill()));
            }
            state = transition(state, event(questions()));
            state = transition(state, event({ ...questions(), interactionId: "second-question" }));
            return responseCompleted ? transition(state, event(completed())) : state;
        };

        it.each(["foreground", "background", "reloaded"] as const)(
            "preserves ownership when the forms are dismissed before a typed reply in %s conversation",
            (selection) => {
                let state = waiting();
                const owner = state.requests[0];
                const localId = selection === "reloaded" ? "reloaded-local" : "local";
                if (selection !== "foreground") {
                    state = transition(
                        state,
                        event({
                            type: "chatConversationChanged",
                            threadId: selection === "reloaded" ? "thread" : "other",
                            conversation: {
                                id: selection === "reloaded" ? "thread" : "other",
                                localId: selection === "reloaded" ? localId : "other-local",
                                createdAt: "",
                                updatedAt: "",
                            },
                        }),
                    );
                }
                for (const interactionId of ["question", "second-question"]) {
                    state = transition(state, event({ ...questions("thread", null), interactionId }));
                    expect(selectCopilotStatus(state, scope)).toBe("waiting");
                    expect(selectCopilotReplyThreadId(state, scope)).toBe("thread");
                    expect(state.requests[0]).toMatchObject({
                        revision: owner.revision,
                        type: owner.type,
                        generation: owner.generation,
                        intent: owner.intent,
                        objectId: "board",
                        responseFinished: true,
                    });
                }
                expect(state.requests[0].pendingClarificationIds).toEqual([]);
                state = transition(state, event(user("thread", localId)));
                expect(selectCopilotStatus(state, scope)).toBe(activatedSkill ? "building" : "generating");
                expect(state.requests).toHaveLength(1);
                expect(state.requests[0]).toMatchObject({
                    conversationId: localId,
                    threadId: "thread",
                    type: owner.type,
                    generation: owner.generation,
                    intent: owner.intent,
                    objectId: "board",
                    awaitingClarification: false,
                });
                expect(state.requests[0].responseFinished).not.toBe(true);
                expect(state.interaction.pendingClarificationIds).toEqual([]);
                state = transition(
                    state,
                    event({ type: "chatReasoning", threadId: "thread", title: "Resuming" }),
                );
                expect(selectCopilotReasoningTitle(state, scope)).toBe("Resuming");
                state = transition(
                    state,
                    event({
                        type: "chatAssistantMessage",
                        threadId: "thread",
                        useCase: "GENERAL",
                        cancelled: true,
                    }),
                );
                expect(selectCopilotStatus(state, scope)).toBe("idle");
            },
        );

        it("resumes a typed reply even when the form is dismissed before response completion", () => {
            let state = waiting(false);
            const owner = state.requests[0];
            state = transition(state, event(questions("thread", null)));
            state = transition(
                state,
                event({ ...questions("thread", null), interactionId: "second-question" }),
            );
            expect(selectCopilotStatus(state, scope)).toBe(activatedSkill ? "building" : "generating");
            state = transition(state, event(user()));
            expect(selectCopilotStatus(state, scope)).toBe(activatedSkill ? "building" : "generating");
            expect(state.requests[0]).toMatchObject({
                type: owner.type,
                generation: owner.generation,
                intent: owner.intent,
                objectId: "board",
                awaitingClarification: false,
            });
        });
    });

    describe.each([false, true])("clarification submission (skill activated: %s)", (activatedSkill) => {
        it.each(["foreground", "background", "reloaded"] as const)(
            "resumes the owning workflow after the form is filled in %s conversation",
            (selection) => {
                let state = transition(activatedSkill ? activated() : started(), event(questions()));
                state = transition(state, event(completed()));
                if (selection !== "foreground") {
                    state = transition(
                        state,
                        event({
                            type: "chatConversationChanged",
                            threadId: "other",
                            conversation: {
                                id: "other",
                                localId: "other-local",
                                createdAt: "",
                                updatedAt: "",
                            },
                        }),
                    );
                }
                const localId = selection === "reloaded" ? "reloaded-local" : "local";
                if (selection === "reloaded") {
                    state = transition(
                        state,
                        event({
                            type: "chatConversationChanged",
                            threadId: "thread",
                            conversation: { id: "thread", localId, createdAt: "", updatedAt: "" },
                        }),
                    );
                }
                state = transition(state, event(questions("thread", { answer: "Yes" })));
                state = transition(
                    state,
                    event({
                        type: "chatUserAnswers",
                        threadId: "thread",
                        conversationId: localId,
                        interactionId: "question",
                        answers: [],
                    }),
                );

                expect(selectCopilotStatus(state, scope)).toBe(activatedSkill ? "building" : "generating");
                expect(state.requests).toHaveLength(1);
                expect(state.requests[0]).toMatchObject({
                    conversationId: localId,
                    threadId: "thread",
                    awaitingClarification: false,
                    pendingClarificationIds: [],
                });
                expect(state.requests[0].responseFinished).not.toBe(true);
                state = transition(
                    state,
                    event({ type: "chatReasoning", threadId: "thread", title: "Resuming" }),
                );
                expect(selectCopilotReasoningTitle(state, scope)).toBe("Resuming");
            },
        );

        it("preserves ownership when the form is filled before the response completes", () => {
            let state = transition(activatedSkill ? activated() : started(), event(questions()));
            state = transition(state, event(questions("thread", { answer: "Yes" })));
            state = transition(
                state,
                event({
                    type: "chatUserAnswers",
                    threadId: "thread",
                    conversationId: "local",
                    interactionId: "question",
                    answers: [],
                }),
            );
            expect(selectCopilotStatus(state, scope)).toBe(activatedSkill ? "building" : "generating");
            expect(state.requests).toHaveLength(1);
            expect(state.requests[0]).toMatchObject({
                conversationId: "local",
                threadId: "thread",
                objectId: "board",
            });
        });
    });

    it("ignores clarification answers for another foreground thread", () => {
        const state = activated();
        expect(
            transition(
                state,
                event({ type: "chatUserAnswers", threadId: "other", interactionId: "q", answers: [] }),
            ),
        ).toBe(state);
    });

    it("ignores answers with a different local conversation even if they report the owner's thread", () => {
        const state = transition(transition(activated(), event(questions())), event(completed()));
        expect(
            transition(
                state,
                event({
                    type: "chatUserAnswers",
                    threadId: "thread",
                    conversationId: "other-local",
                    interactionId: "question",
                    answers: [],
                }),
            ),
        ).toBe(state);
        expect(selectCopilotStatus(state, scope)).toBe("waiting");
        expect(selectCopilotReplyThreadId(state, scope)).toBe("thread");
    });

    it("tracks multiple clarification items independently", () => {
        let state = transition(activated(), event(questions()));
        state = transition(state, event({ ...questions(), interactionId: "second-question" }));
        expect(state.interaction.pendingClarificationIds).toEqual(["question", "second-question"]);
        state = transition(state, event(questions("thread", { answer: "Yes" })));
        expect(state.interaction.pendingClarificationIds).toEqual(["second-question"]);
        expect(state.requests[0].awaitingClarification).toBe(true);
        state = transition(
            state,
            event({ ...questions("thread", { answer: "Yes" }), interactionId: "second-question" }),
        );
        expect(state.interaction.pendingClarificationIds).toEqual([]);
        expect(state.requests[0].awaitingClarification).toBe(false);
    });

    it("supports skill activation and completion before a backend thread exists", () => {
        let state = transition(initial(), { kind: "startGeneration", type: Build.Board });
        state = transition(state, event({ ...skill(), threadId: undefined }));
        expect(state.interaction.build).toEqual({ type: Build.Board, intent: "create" });
        state = transition(state, event({ ...completed(), threadId: undefined }));
        expect(selectCopilotStatus(state, { type: Build.Board })).toBe("waiting");
    });

    it("does not release a newer generation intent when an old application completes", () => {
        let state = applying();
        state = transition(state, { kind: "startGeneration", type: Build.Board });
        state = transition(state, { kind: "applicationApplied", id: "application", target });
        expect(state.generation).toBe(Build.Board);
        expect(selectCopilotStatus(state, { type: Build.Board })).toBe("generating");
    });

    it("completes an application across navigation even without a local conversation ID", () => {
        let state = transition(
            transition(initial(), { kind: "startGeneration", type: Build.Board }),
            event({ ...user(), conversationId: undefined }),
        );
        state = transition(state, event(skill()));
        state = transition(state, {
            kind: "applicationStarted",
            id: "app",
            source: { target, threadId: "thread" },
        });
        state = transition(state, { kind: "resetTarget", target });
        state = transition(state, { kind: "applicationApplied", id: "app", target });
        expect(selectCopilotStatus(state, { type: Build.Board, isBuilder: true })).toBe("idle");
    });

    it("ignores an acknowledgement from another build type", () => {
        const state = applying();
        expect(
            transition(state, {
                kind: "applicationApplied",
                id: "application",
                target: { type: Build.Document, objectId: "doc" },
            }),
        ).toBe(state);
    });

    it("preserves build intent on navigation but clears old requests and stale reasoning", () => {
        const state = transition(
            activated(),
            event({ type: "chatReasoning", threadId: "thread", title: "Planning" }),
        );
        const next = transition(state, { kind: "resetTarget", target });
        expect(next.interaction.build).toBe(state.interaction.build);
        expect(next.interaction.reasoningTitle).toBeUndefined();
        expect(next.interaction.threadId).toBeUndefined();
        expect(next.requests).toEqual([]);
        expect(transition(next, { kind: "resetTarget", target })).toBe(next);
        expect(transition(next, event({ type: "chatReasoning", threadId: "thread", title: "Late" }))).toBe(
            next,
        );
    });

    it.each([false, true])("ignores old equal-ID events after navigation to a builder: %s", (isBuilder) => {
        let state = initial();
        for (const [objectId, threadId] of [
            ["new-object", "new-thread"],
            ["old-object", "old-thread"],
        ]) {
            state = transition(state, {
                kind: "context",
                context: { type: Build.Board, objectId, isEditing: true },
            });
            state = transition(state, event(user(threadId, threadId)));
            state = transition(
                state,
                event({
                    type: "chatAssistantMessage",
                    threadId,
                    useCase: "GENERAL",
                    skills: [{ name: "dashboard_editor", title: "Edit" }],
                }),
            );
            state = transition(state, event({ type: "chatReasoning", threadId, title: "Planning" }));
        }
        const newRequest = state.requests[0];
        const build = state.interaction.build;
        state = transition(state, {
            kind: "resetTarget",
            target: { type: Build.Board, objectId: "old-object" },
        });
        state = transition(state, {
            kind: "context",
            context: isBuilder
                ? { builderTarget: { type: Build.Board, objectId: "new-object" } }
                : { type: Build.Board, objectId: "new-object", isEditing: true },
        });
        expect(state.requests).toEqual([newRequest]);
        expect(state.requests[0]).toBe(newRequest);
        expect(state.interaction.conversationId).toBe("old-thread");
        expect(state.interaction.threadId).toBeUndefined();
        expect(state.interaction.reasoningTitle).toBeUndefined();
        expect(state.interaction.build).toBe(build);
        for (const value of [
            { type: "chatReasoning", threadId: "old-thread", title: "Late" },
            skill("old-thread"),
            completed("old-thread"),
            { type: "chatAssistantMessage", threadId: "old-thread", useCase: "INVALID" },
            { type: "chatAssistantMessage", threadId: "old-thread", useCase: "GENERAL", cancelled: true },
            questions("old-thread"),
        ] satisfies ChatEvent[]) {
            expect(transition(state, event(value))).toBe(state);
        }
    });

    it("transfers generation intent to a skill, waits, continues, and applies", () => {
        let state = started();
        expect(selectCopilotStatus(state, scope)).toBe("generating");
        state = transition(state, event(skill()));
        expect(state.generation).toBeUndefined();
        expect(state.interaction.build).toEqual({ type: Build.Board, intent: "create" });
        expect(selectCopilotGenerationPending(state, Build.Board)).toBe(true);
        expect(selectCopilotStatus(state, scope)).toBe("building");
        state = transition(state, event(questions()));
        expect(selectCopilotStatus(state, scope)).toBe("waiting");
        state = transition(
            state,
            event({
                type: "chatUserAnswers",
                threadId: "thread",
                conversationId: "local",
                interactionId: "question",
                answers: [],
            }),
        );
        expect(state.interaction.pendingClarificationIds).toEqual([]);
        expect(selectCopilotStatus(state, scope)).toBe("building");
        state = applying(state);
        state = transition(state, event(completed()));
        expect(state.requests[0].responseFinished).toBe(true);
        expect(selectCopilotStatus(state, scope)).toBe("building");
        state = transition(state, { kind: "applicationApplied", id: "application", target });
        expect(selectCopilotStatus(state, scope)).toBe("idle");
        expect(state.requests).toEqual([]);
        expect(selectCopilotSource(state, target)).toEqual({ conversationId: "local", threadId: "thread" });
        expect(transition(state, event(skill("thread", true)))).toBe(state);
    });

    it("handles completion before or together with activation", () => {
        for (const state of [
            transition(started(), event(completed())),
            transition(started(), event(skill("thread", true))),
        ]) {
            expect(state.interaction.waitingForUserInput).toBe(true);
            expect(selectCopilotStatus(state, { type: Build.Board })).toBe("waiting");
        }
    });

    it("does not finish on repeated skill notifications", () => {
        const state = transition(activated(), event(skill()));
        expect(state.interaction.build?.intent).toBe("create");
        expect(state.interaction.waitingForUserInput).toBe(false);
    });

    it("correlates local conversations with server threads without clearing progress", () => {
        let state = transition(
            transition(initial(), { kind: "startGeneration", type: Build.Board }),
            event({ ...user(), threadId: undefined }),
        );
        state = transition(
            state,
            event({
                type: "chatConversationChanged",
                threadId: "server",
                conversation: { id: "server", localId: "local", createdAt: "", updatedAt: "" },
            }),
        );
        expect(state.requests[0].threadId).toBe("server");
        expect(state.interaction.threadId).toBe("server");
        state = transition(state, event(skill("server")));
        expect(state.interaction.build?.intent).toBe("create");
    });

    it("keeps background requests and clears foreground progress on chat reset or switch", () => {
        for (const change of [
            { type: "chatReset" },
            {
                type: "chatConversationChanged",
                threadId: "other",
                conversation: { id: "other", localId: "other-local", createdAt: "", updatedAt: "" },
            },
        ] satisfies ChatEvent[]) {
            const state = activated();
            const next = transition(state, event(change));
            expect(next.requests).toBe(state.requests);
            expect(next.interaction.build).toBeUndefined();
            expect(next.interaction.pendingClarificationIds).toEqual([]);
            expect(selectCopilotStatus(next, scope)).toBe("building");
        }
        expect(transition(started(), event({ type: "chatReset" })).generation).toBe(Build.Board);
    });

    it("isolates unrelated reasoning, skills, completion, and failure from foreground", () => {
        const state = transition(
            activated(),
            event({ type: "chatReasoning", threadId: "thread", title: "Planning" }),
        );
        for (const value of [
            { type: "chatReasoning", threadId: "other", title: "Unrelated" },
            { type: "chatReasoning", title: "Unknown" },
            skill("other"),
            completed("other"),
            { type: "chatAssistantMessage", useCase: "INVALID", threadId: "other" },
        ] satisfies ChatEvent[]) {
            expect(transition(state, event(value))).toBe(state);
        }
        expect(
            transition(state, event({ type: "chatReasoning", threadId: "thread" })).interaction
                .reasoningTitle,
        ).toBeUndefined();
    });

    it("mixed background edits wait only when all activated edits await clarification", () => {
        let state = transition(activated(), event(questions()));
        state = transition(state, event(user("second", "second-local")));
        state = transition(state, event(skill("second")));
        expect(selectCopilotStatus(state, scope)).toBe("building");
        state = transition(state, event(questions("second")));
        expect(selectCopilotStatus(state, scope)).toBe("waiting");
        const first = state.requests[0];
        state = transition(state, event(completed("second")));
        expect(state.requests[0]).toBe(first);
        expect(selectCopilotStatus(state, scope)).toBe("waiting");
    });

    it.each([
        completed(),
        { type: "chatAssistantMessage", threadId: "thread", useCase: "INVALID" },
        { type: "chatAssistantMessage", threadId: "thread", useCase: "GENERAL", cancelled: true },
    ] satisfies ChatEvent[])("retains applying requests through response termination: $type", (value) => {
        let state = transition(applying(), event(value));
        expect(state.requests[0].responseFinished).toBe(true);
        expect(selectCopilotStatus(state, scope)).toBe("building");
        const requests = state.requests;
        state = transition(state, { kind: "resetTarget", target });
        expect(state.requests).toBe(requests);
        state = transition(state, { kind: "applicationInterrupted", id: "application" });
        expect(state.requests).toEqual([]);
        expect(transition(state, { kind: "applicationInterrupted", id: "application" })).toBe(state);
    });

    it("does not terminate a running application when a clarification form is dismissed", () => {
        let state = transition(applying(), event(questions()));
        state = transition(state, event(questions("thread", null)));
        expect(state.requests[0].responseFinished).toBeUndefined();
        expect(state.requests[0].pendingClarificationIds).toEqual([]);
        expect(selectCopilotStatus(state, scope)).toBe("building");
        const requests = state.requests;
        state = transition(state, { kind: "resetTarget", target });
        expect(state.requests).toBe(requests);
        state = transition(state, { kind: "applicationInterrupted", id: "application" });
        expect(state.requests[0].applicationIds).toEqual([]);
        expect(selectCopilotStatus(state, scope)).toBe("building");
        expect(transition(state, { kind: "applicationInterrupted", id: "application" })).toBe(state);
        state = transition(state, event({ ...completed(), cancelled: true }));
        expect(state.requests).toEqual([]);
        expect(selectCopilotStatus(state, scope)).toBe("idle");
    });

    it("interruption preserves a running request and waits for a retry after completion", () => {
        let state = transition(applying(), { kind: "applicationInterrupted", id: "application" });
        expect(state.requests[0].applicationIds).toEqual([]);
        expect(state.requests[0].responseFinished).toBeUndefined();
        expect(state.applications).toEqual([]);
        expect(selectCopilotStatus(state, scope)).toBe("building");
        state = transition(state, event(completed()));
        expect(selectCopilotStatus(state, scope)).toBe("waiting");
        state = transition(state, { kind: "cancelGeneration", type: Build.Board });
        expect(state.requests).toEqual([]);
    });

    it.each([{ target }, { target, conversationId: "draft-local", threadId: "draft-thread" }])(
        "clears an interrupted standalone application from $conversationId",
        (source) => {
            let state = transition(initial(), { kind: "applicationStarted", id: "standalone", source });
            expect(selectCopilotStatus(state, scope)).toBe("building");
            state = transition(state, { kind: "applicationInterrupted", id: "standalone" });
            expect(state.requests).toEqual([]);
            expect(state.applications).toEqual([]);
            expect(selectCopilotStatus(state, scope)).toBe("idle");
        },
    );

    it.each([
        { type: "chatAssistantMessage", useCase: "INVALID" },
        { type: "chatAssistantMessage", useCase: "GENERAL", cancelled: true },
    ] satisfies ChatEvent[])("clears early generation after $useCase by local ID or no ID", (value) => {
        const config: ICopilotConfiguration = { registrations: [] };
        for (const conversationId of ["local", undefined]) {
            let state = transitionCopilot(
                createCopilotState(),
                { kind: "startGeneration", type: CopilotBuildType.Dashboard },
                config,
            );
            state = transitionCopilot(
                state,
                { kind: "event", event: { ...user(), conversationId, threadId: undefined } },
                config,
            );
            state = transitionCopilot(
                state,
                { kind: "event", event: { ...value, threadId: conversationId } },
                config,
            );
            expect(state.requests).toEqual([]);
            expect(state.generation).toBeUndefined();
            expect(selectCopilotGenerationPending(state, CopilotBuildType.Dashboard)).toBe(false);
            expect(selectCopilotStatus(state, { type: CopilotBuildType.Dashboard })).toBe("idle");
        }
    });

    it.each([
        { type: "chatReasoning", threadId: "local", title: "Early" },
        skill("local"),
        completed("local"),
        questions("local"),
    ] satisfies ChatEvent[])("does not accept local-ID $type as foreground before assignment", (value) => {
        const state = transition(
            transition(initial(), { kind: "startGeneration", type: Build.Board }),
            event({ ...user(), threadId: undefined }),
        );
        const next = transition(state, event(value));
        expect(next.interaction).toBe(state.interaction);
        expect(next.generation).toBe(state.generation);
    });

    it.each([
        { type: "chatAssistantMessage", useCase: "INVALID" },
        { type: "chatAssistantMessage", useCase: "GENERAL", cancelled: true },
    ] satisfies ChatEvent[])("ignores stale local-ID $useCase after backend thread assignment", (value) => {
        const state = activated();
        const next = transition(state, event({ ...value, threadId: "local" }));
        expect(next.interaction).toBe(state.interaction);
        expect(next.generation).toBe(state.generation);
        expect(selectCopilotStatus(next, scope)).toBe("building");
    });

    it("keeps multiple applications locked and ignores duplicate and stale acknowledgements", () => {
        let state = applying(applying(), "newer");
        state = transition(state, { kind: "applicationApplied", id: "application", target });
        expect(state.requests[0].applicationIds).toEqual(["newer"]);
        expect(selectCopilotStatus(state, scope)).toBe("building");
        expect(transition(state, { kind: "applicationApplied", id: "application", target })).toBe(state);
        state = transition(state, { kind: "applicationApplied", id: "newer", target });
        expect(state.requests).toEqual([]);
    });

    it("attributes the applied object to its origin after switching chats, and clears unknown origins", () => {
        let state = transition(applying(), event(user("other", "other-local")));
        state = transition(state, { kind: "applicationApplied", id: "application", target });
        expect(state.interaction.threadId).toBe("other");
        expect(selectCopilotSource(state, target)?.conversationId).toBe("local");
        state = transition(state, { kind: "applicationStarted", id: "unknown", source: { target } });
        state = transition(state, { kind: "applicationApplied", id: "unknown", target });
        expect(selectCopilotSource(state, target)).toBeUndefined();
    });

    it("does not overwrite a newer object's origin with a late application acknowledgement", () => {
        let state = applying();
        state = transition(state, {
            kind: "applicationStarted",
            id: "newer",
            source: { target, conversationId: "new-origin" },
        });
        state = transition(state, { kind: "applicationApplied", id: "newer", target });
        state = transition(state, { kind: "applicationApplied", id: "application", target });
        expect(selectCopilotSource(state, target)?.conversationId).toBe("new-origin");
    });

    it("supports another application's enum and non-dashboard skill without lifecycle branches", () => {
        let state = transition(activated(), event(user("document-thread", "doc-local")));
        state = transition(state, {
            kind: "context",
            context: { type: Build.Document, objectId: "doc", isEditing: true },
        });
        state = transition(
            state,
            event({
                type: "chatAssistantMessage",
                threadId: "document-thread",
                useCase: "GENERAL",
                skills: [{ name: "document_builder", title: "Write" }],
            }),
        );
        state = transition(state, event(questions("document-thread")));
        expect(selectCopilotStatus(state, { type: Build.Document, objectId: "doc", isEditing: true })).toBe(
            "waiting",
        );
        expect(selectCopilotStatus(state, scope)).toBe("building");
        expect(
            selectCopilotStatus(state, { type: Build.Document, objectId: "different", isEditing: true }),
        ).toBe("idle");
    });

    it("is deterministic, immutable, and preserves unchanged-state identity", () => {
        const state = freeze(activated());
        const input = freeze(event(questions()));
        const config = freeze(configuration);
        expect(transitionCopilot(state, input, config)).toEqual(transitionCopilot(state, input, config));
        expect(state.interaction.pendingClarificationIds).toEqual([]);
        expect(transition(state, event({ type: "chatOpened" }))).toBe(state);
        expect(transition(state, { kind: "context", context: { ...target, isEditing: true } })).toBe(state);
    });

    describe("application lifecycle boundaries", () => {
        it("ignores a duplicate application start even with a different source", () => {
            const state = freeze(applying());
            const input = freeze({
                kind: "applicationStarted",
                id: "application",
                source: { target: { type: Build.Document, objectId: "doc" }, conversationId: "other" },
            } satisfies CopilotInput<Build>);

            expect(transition(state, input)).toBe(state);
        });

        it.each([
            { source: { target, conversationId: "local", threadId: "reassigned" }, index: 0 },
            { source: { target, conversationId: "unknown", threadId: "thread" }, index: -1 },
            { source: { target, threadId: "thread" }, index: 1 },
            { source: { target, threadId: "second-local" }, index: 1 },
            { source: { target, conversationId: "second-local" }, index: 1 },
        ])(
            "correlates application sources without merging local and thread policies: $source",
            ({ source, index }) => {
                const state = freeze(transition(activated(), event(user("thread", "second-local"))));
                const input = freeze({ kind: "applicationStarted", id: "application", source } as const);
                const pending = state.requests[index];

                const next = transition(state, input);

                expect(next.revision).toBe(state.revision + 1);
                expect(next.requests.slice(0, -1)).toEqual(state.requests.filter((_, i) => i !== index));
                next.requests.slice(0, -1).forEach((request) => expect(state.requests).toContain(request));
                expect(next.requests.at(-1)).toStrictEqual({
                    ...pending,
                    revision: pending?.revision ?? next.revision,
                    type: Build.Board,
                    objectId: target.objectId,
                    conversationId: source.conversationId ?? pending?.conversationId,
                    threadId: source.threadId ?? pending?.threadId,
                    responseFinished: pending ? pending.responseFinished : true,
                    awaitingClarification: false,
                    applicationIds: ["application"],
                });
                expect(next.applications).toStrictEqual([
                    {
                        ...source,
                        id: "application",
                        revision: next.revision,
                        requestRevision: next.requests.at(-1)?.revision,
                    },
                ]);
                expect(next.applications[0].target).not.toBe(source.target);
                expect(next.interaction).toBe(state.interaction);
                expect(next.context).toBe(state.context);
                expect(next.sources).toBe(state.sources);
                expect(state.applications).toEqual([]);
            },
        );

        it.each([
            { kind: "applicationApplied", id: "unknown", target },
            { kind: "applicationInterrupted", id: "unknown" },
            {
                kind: "applicationApplied",
                id: "application",
                target: { type: Build.Document, objectId: "doc" },
            },
        ] satisfies CopilotInput<Build>[])(
            "preserves snapshot identity for an invalid acknowledgement: $kind/$id",
            (input) => {
                const state = freeze(applying());

                expect(transition(state, freeze(input))).toBe(state);
            },
        );

        it.each([
            { kind: "applicationApplied", responseFinished: false },
            { kind: "applicationApplied", responseFinished: true },
            { kind: "applicationInterrupted", responseFinished: false },
            { kind: "applicationInterrupted", responseFinished: true },
        ] as const)(
            "retains sibling installations when $kind finishes a response: $responseFinished",
            ({ kind, responseFinished }) => {
                let state = applying(applying(), "second");
                if (responseFinished) {
                    state = transition(state, event(completed()));
                }
                freeze(state);

                const next = transition(state, { kind, id: "application", target });

                expect(next.applications).toEqual([state.applications[1]]);
                expect(next.applications[0]).toBe(state.applications[1]);
                expect(next.requests[0]).toEqual({ ...state.requests[0], applicationIds: ["second"] });
                expect(next.interaction).toBe(state.interaction);
                expect(next.revision).toBe(state.revision);
                const finished = transition(freeze(next), { kind, id: "second", target });
                expect(finished.applications).toEqual([]);
                expect(finished.requests).toEqual(
                    kind === "applicationApplied" || responseFinished
                        ? []
                        : [{ ...state.requests[0], applicationIds: [] }],
                );
                expect(finished.interaction === state.interaction).toBe(kind === "applicationInterrupted");
                expect(finished.sources === state.sources).toBe(kind === "applicationInterrupted");
            },
        );

        it("attributes the final target, preserves other sources, and clears an unassigned foreground generation", () => {
            const otherSource = { target: { type: Build.Document, objectId: "doc" }, revision: 0 };
            const state = freeze(
                transition(
                    {
                        ...transition(initial(), { kind: "startGeneration", type: Build.Board }),
                        sources: [otherSource],
                    },
                    {
                        kind: "applicationStarted",
                        id: "application",
                        source: { target, conversationId: "origin", threadId: "server" },
                    },
                ),
            );
            const finalTarget = freeze({ type: Build.Board, objectId: "created-board" });

            const next = transition(state, {
                kind: "applicationApplied",
                id: "application",
                target: finalTarget,
            });

            expect(next.sources).toStrictEqual([
                otherSource,
                {
                    target: finalTarget,
                    revision: state.applications[0].revision,
                    source: { conversationId: "origin", threadId: "server" },
                },
            ]);
            expect(next.sources[0]).toBe(otherSource);
            expect(next.sources[1].target).not.toBe(finalTarget);
            expect(next.requests).toEqual([]);
            expect(next.generation).toBeUndefined();
            expect(next.interaction).toEqual(createCopilotState<Build>().interaction);
            expect(next.revision).toBe(state.revision);
        });

        it("does not clear a newer request from the same conversation when an older application finishes", () => {
            const state = freeze(transition(applying(), event(user())));
            const newer = state.requests[1];

            const next = transition(state, { kind: "applicationApplied", id: "application", target });

            expect(next.requests).toEqual([newer]);
            expect(next.requests[0]).toBe(newer);
            expect(next.interaction).toBe(state.interaction);
            expect(next.applications).toEqual([]);
            expect(selectCopilotSource(next, target)).toEqual({
                conversationId: "local",
                threadId: "thread",
            });
        });

        it("releases a claimed generation only after its completed application is interrupted", () => {
            const state = freeze(transition(applying(started()), event(completed())));
            expect(state.generation).toBe(Build.Board);

            const next = transition(state, { kind: "applicationInterrupted", id: "application" });

            expect(next.requests).toEqual([]);
            expect(next.generation).toBeUndefined();
            expect(next.interaction).toBe(state.interaction);
            expect(next.sources).toBe(state.sources);
        });
    });

    describe("a reply to a waiting workflow", () => {
        const fresh = () =>
            transition(createCopilotState<Build>(), {
                kind: "context",
                context: { type: Build.Board, isEditing: true },
            });
        const creating = () =>
            transition(transition(fresh(), { kind: "startGeneration", type: Build.Board }), event(user()));
        const inBuilder = () =>
            transition(
                applying(
                    transition(initial(), {
                        kind: "context",
                        context: { ...target, isEditing: true, builderTarget: target },
                    }),
                ),
                { kind: "applicationApplied", id: "application", target },
            );
        const plainAnswer: ChatAssistantMessageEvent = {
            type: "chatAssistantMessage",
            threadId: "thread",
            useCase: "GENERAL",
        };
        const form = (state: ICopilotSnapshot<Build>) =>
            transition(transition(state, event(questions())), event(completed()));
        const typed = [event(questions("thread", null)), event(user())];
        const answered = [
            event({
                type: "chatUserAnswers",
                threadId: "thread",
                conversationId: "local",
                interactionId: "question",
                answers: [],
            }),
        ];
        const creationScope = { type: Build.Board, isEditing: true };

        it.each([
            [
                "a creation question before any skill item",
                () => transition(creating(), event(completed())),
                [event(user())],
                creationScope,
                "generating",
            ],
            [
                "a creation question after a skill item",
                () => transition(transition(creating(), event(skill())), event(completed())),
                [event(user())],
                creationScope,
                "building",
            ],
            [
                "a creation form answered by typing",
                () => form(transition(creating(), event(skill()))),
                typed,
                creationScope,
                "building",
            ],
            [
                "a builder form without a skill item, answered by typing",
                () => form(transition(transition(inBuilder(), event(user())), event(plainAnswer))),
                typed,
                scope,
                "building",
            ],
            [
                "a builder form without a skill item, answered through the form",
                () => form(transition(transition(inBuilder(), event(user())), event(plainAnswer))),
                answered,
                scope,
                "building",
            ],
        ] as const)("keeps the lock for %s", (_, waiting, reply, replyScope, expected) => {
            let state = waiting();
            expect(selectCopilotStatus(state, replyScope)).toBe("waiting");
            for (const input of reply) {
                state = transition(state, input);
            }
            expect(selectCopilotStatus(state, replyScope)).toBe(expected);
        });
    });
});
