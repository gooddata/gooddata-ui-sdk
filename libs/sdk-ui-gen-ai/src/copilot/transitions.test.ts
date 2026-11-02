// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type ChatClarificationQuestionsEvent,
    type ChatEvent,
    type ChatUserMessageEvent,
} from "../store/events.js";

import { selectCopilotGenerationPending, selectCopilotSource, selectCopilotStatus } from "./selectors.js";
import { createCopilotState, transitionCopilot } from "./transitions.js";
import {
    CopilotBuildType,
    type CopilotInput,
    type ICopilotConfiguration,
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
const skill = (threadId = "thread", responseCompleted = false): ChatEvent => ({
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
const completed = (threadId = "thread"): ChatEvent => ({
    type: "chatAssistantMessage",
    threadId,
    useCase: "GENERAL",
    responseCompleted: true,
});
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
    it("ignores clarification answers for another foreground thread", () => {
        const state = activated();
        expect(
            transition(
                state,
                event({ type: "chatUserAnswers", threadId: "other", interactionId: "q", answers: [] }),
            ),
        ).toBe(state);
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
        questions("thread", null),
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

    it("interruption preserves a still-running request until completion", () => {
        let state = transition(applying(), { kind: "applicationInterrupted", id: "application" });
        expect(state.requests[0].applicationIds).toEqual([]);
        expect(state.requests[0].responseFinished).toBeUndefined();
        expect(state.applications).toEqual([]);
        expect(selectCopilotStatus(state, scope)).toBe("building");
        state = transition(state, event(completed()));
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
});
