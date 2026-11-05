// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type ChatDefinitionReceivedEvent } from "../store/events.js";

import { CopilotHandler } from "./CopilotHandler.js";
import {
    CopilotBuildType,
    type ICopilotConfiguration,
    type ICopilotContext,
    type ICopilotRegistration,
    type ICopilotTarget,
} from "./types.js";

const type = CopilotBuildType.Dashboard;
const target = { type, objectId: "object" };
const definition: ChatDefinitionReceivedEvent = {
    type: "onDefinitionReceived",
    definitionType: "dashboard",
    itemId: "item",
    conversationId: "local",
    threadId: "thread",
};

function setup(overrides: Partial<ICopilotRegistration> = {}) {
    const onApplyDefinition = vi.fn<ICopilotRegistration["onApplyDefinition"]>();
    const onClarificationQuestions = vi.fn<NonNullable<ICopilotConfiguration["onClarificationQuestions"]>>();
    const handler = new CopilotHandler({
        registrations: [
            {
                type,
                skills: ["dashboard_builder"],
                resolveDefinition: () => target,
                onApplyDefinition,
                ...overrides,
            },
        ],
        onClarificationQuestions,
    });
    handler.setContext({ ...target, isEditing: true });
    handler.handleEvent({
        type: "chatUserMessage",
        threadId: "thread",
        conversationId: "local",
        question: "Build",
        objects: [],
    });
    return { handler, onApplyDefinition, onClarificationQuestions };
}

describe("CopilotHandler", () => {
    it("publishes application state before the callback and requires an acknowledgement", () => {
        const { handler, onApplyDefinition } = setup();
        const order: string[] = [];
        handler.subscribe(() => order.push("published"));
        onApplyDefinition.mockImplementation((_, id) => {
            order.push("callback");
            expect(handler.getSnapshot().applications[0].id).toBe(id);
            expect(handler.getStatus({ ...target, isEditing: true })).toBe("building");
        });
        handler.handleEvent(definition);
        expect(order).toEqual(["published", "callback"]);
        const id = onApplyDefinition.mock.calls[0][1];
        expect(handler.getSnapshot().applications).toHaveLength(1);
        handler.definitionApplied(id, target);
        expect(handler.getSnapshot().applications).toEqual([]);
        expect(handler.getAppliedSource(target)).toEqual({ conversationId: "local", threadId: "thread" });
    });

    it("allows synchronous acknowledgement from the callback", () => {
        const { handler, onApplyDefinition } = setup();
        onApplyDefinition.mockImplementation((_, id) => handler.definitionApplied(id, target));
        handler.handleEvent(definition);
        expect(handler.getSnapshot().applications).toEqual([]);
    });

    it("interrupts on synchronous callback errors but retains a running response", () => {
        const error = new Error("Failed installation");
        const { handler } = setup({
            onApplyDefinition: () => {
                throw error;
            },
        });
        expect(() => handler.handleEvent(definition)).toThrow(error);
        expect(handler.getSnapshot().applications).toEqual([]);
        expect(handler.getSnapshot().requests[0].applicationIds).toEqual([]);
        handler.handleEvent({
            type: "chatAssistantMessage",
            threadId: "thread",
            useCase: "GENERAL",
            responseCompleted: true,
        });
        expect(handler.getSnapshot().requests).toEqual([]);
    });

    it("rejects definitions through the configured policy", () => {
        const { handler, onApplyDefinition } = setup({ resolveDefinition: () => undefined });
        const snapshot = handler.getSnapshot();
        handler.handleEvent(definition);
        expect(handler.getSnapshot()).toBe(snapshot);
        expect(onApplyDefinition).not.toHaveBeenCalled();
    });

    it.each<{
        name: string;
        context: ICopilotContext<string>;
        generation?: string;
        interactionId?: string;
        resolvedTarget?: ICopilotTarget<string>;
        applies: boolean;
    }>([
        { name: "matching builder", context: { builderTarget: target }, applies: true },
        {
            name: "matching builder history",
            context: { builderTarget: target },
            interactionId: "persisted",
            applies: true,
        },
        { name: "edited object", context: { ...target, isEditing: true }, applies: true },
        { name: "viewed object", context: target, applies: false },
        {
            name: "another edited object",
            context: { type, objectId: "another-object", isEditing: true },
            applies: false,
        },
        {
            name: "edited object history",
            context: { ...target, isEditing: true },
            interactionId: "persisted",
            applies: false,
        },
        { name: "pending generation", context: {}, generation: type, applies: true },
        {
            name: "history during generation",
            context: {},
            generation: type,
            interactionId: "persisted",
            applies: false,
        },
        { name: "unrelated generation", context: {}, generation: "report", applies: false },
        {
            name: "another workflow's builder with the same identifier",
            context: { builderTarget: { type: "report", objectId: target.objectId } },
            applies: false,
        },
        {
            name: "another workflow's edited object with the same identifier",
            context: { type: "report", objectId: target.objectId, isEditing: true },
            applies: false,
        },
        {
            name: "application-defined workflow",
            context: { type: "report", objectId: target.objectId, isEditing: true },
            resolvedTarget: { type: "report", objectId: target.objectId },
            applies: true,
        },
    ])("applies resolved targets only for an eligible workflow: $name", (testCase) => {
        const resolvedTarget = testCase.resolvedTarget ?? target;
        const onApplyDefinition = vi.fn();
        const handler = new CopilotHandler<string>({
            registrations: [
                {
                    type: resolvedTarget.type,
                    skills: ["dashboard_builder"],
                    resolveDefinition: () => resolvedTarget,
                    onApplyDefinition,
                },
            ],
        });
        handler.setContext(testCase.context);
        if (testCase.generation) {
            handler.startGeneration(testCase.generation);
        }
        const snapshot = handler.getSnapshot();
        const event = { ...definition, interactionId: testCase.interactionId };

        handler.handleEvent(event);

        const expectedCalls = [[event, expect.any(String), resolvedTarget]];
        expect(onApplyDefinition.mock.calls).toEqual(testCase.applies ? expectedCalls : []);
        expect(handler.getSnapshot().applications.map((application) => application.target)).toEqual(
            testCase.applies ? [resolvedTarget] : [],
        );
        expect(handler.getSnapshot() === snapshot).toBe(!testCase.applies);
    });

    it.each([
        {
            name: "same server thread with another local ID",
            origin: { conversationId: "another-local", threadId: "thread" },
            applies: true,
        },
        { name: "local ID fallback", origin: { threadId: undefined }, applies: true },
        {
            name: "local ID fallback before the source has a thread",
            origin: { threadId: "new-thread" },
            sourceThreadId: undefined,
            applies: true,
        },
        { name: "another server thread", origin: { threadId: "another-thread" }, applies: false },
        {
            name: "another local ID without a server thread",
            origin: { conversationId: "another-local", threadId: undefined },
            applies: false,
        },
        { name: "unknown origin", origin: { conversationId: "", threadId: undefined }, applies: false },
        { name: "history replay", origin: { interactionId: "persisted" }, applies: false },
        { name: "closed builder", origin: {}, leaveBuilder: true, applies: false },
    ])("accepts a changed draft identifier only from its live builder source: $name", (testCase) => {
        const updatedTarget = { ...target, objectId: "updated-draft" };
        const { handler, onApplyDefinition } = setup({ resolveDefinition: () => updatedTarget });
        const applicationId = handler.definitionApplicationStarted({
            target,
            conversationId: "local",
            threadId: "sourceThreadId" in testCase ? testCase.sourceThreadId : "thread",
        });
        handler.definitionApplied(applicationId, target);
        handler.handleEvent({
            type: "chatAssistantMessage",
            threadId: "thread",
            useCase: "GENERAL",
            responseCompleted: true,
        });
        handler.setContext({ type, builderTarget: testCase.leaveBuilder ? undefined : target });
        expect(handler.isGenerationPending(type)).toBe(false);
        const snapshot = handler.getSnapshot();

        handler.handleEvent({ ...definition, ...testCase.origin });

        expect(onApplyDefinition).toHaveBeenCalledTimes(testCase.applies ? 1 : 0);
        expect(handler.getSnapshot().applications.map((application) => application.target)).toEqual(
            testCase.applies ? [updatedTarget] : [],
        );
        expect(handler.getSnapshot() === snapshot).toBe(!testCase.applies);
    });

    it("does not deduplicate streamed revisions by item ID", () => {
        const { handler, onApplyDefinition } = setup();
        handler.handleEvent(definition);
        handler.handleEvent({ ...definition });
        const [first, second] = onApplyDefinition.mock.calls.map((call) => call[1]);
        expect(first).not.toBe(second);
        handler.definitionApplied(first, target);
        expect(handler.getStatus({ ...target, isEditing: true })).toBe("building");
        const snapshot = handler.getSnapshot();
        handler.definitionApplicationInterrupted(first);
        handler.definitionApplied(first, target);
        expect(handler.getSnapshot()).toBe(snapshot);
        handler.definitionApplied(second, target);
        expect(handler.getStatus({ ...target, isEditing: true })).toBe("idle");
    });

    it("an old application cannot clear a newer follow-up in the same thread", () => {
        const { handler } = setup();
        const id = handler.definitionApplicationStarted({
            target,
            conversationId: "local",
            threadId: "thread",
        });
        handler.handleEvent({
            type: "chatUserMessage",
            threadId: "thread",
            conversationId: "local",
            question: "Follow up",
            objects: [],
        });
        handler.handleEvent({
            type: "chatAssistantMessage",
            threadId: "thread",
            useCase: "GENERAL",
            skills: [{ name: "dashboard_builder", title: "Build" }],
        });
        handler.definitionApplied(id, target);
        expect(handler.getSnapshot().interaction.build).toBeDefined();
        expect(handler.getSnapshot().requests).toHaveLength(1);
        expect(handler.getStatus({ ...target, isEditing: true })).toBe("building");
    });

    it("supports host-initiated applications without a chat event or backend thread", () => {
        const handler = new CopilotHandler({ registrations: [] });
        const id = handler.definitionApplicationStarted({ target, conversationId: "origin" });
        handler.definitionApplied(id, target);
        expect(handler.getAppliedSource(target)).toEqual({ conversationId: "origin", threadId: undefined });
    });

    it.each([
        { status: "pending", conversationId: "origin" },
        { status: "applied", conversationId: "origin" },
        { status: "pending", conversationId: undefined },
        { status: "applied", conversationId: undefined },
    ])(
        "finds a $status definition with origin $conversationId by exact target",
        ({ status, conversationId }) => {
            const handler = new CopilotHandler<string>({ registrations: [] });
            expect(handler.hasDefinition(target)).toBe(false);
            const id = handler.definitionApplicationStarted({ target, conversationId });
            if (status === "applied") {
                handler.definitionApplied(id, target);
            }
            handler.setContext({ type: "report", objectId: "another-object" });
            handler.handleEvent({
                type: "chatConversationChanged",
                threadId: "another-thread",
                conversation: {
                    id: "another-thread",
                    localId: "another-local",
                    createdAt: "",
                    updatedAt: "",
                },
            });
            const snapshot = handler.getSnapshot();
            const listener = vi.fn();
            handler.subscribe(listener);

            expect(handler.hasDefinition({ ...target })).toBe(true);
            expect(handler.hasDefinition({ ...target, objectId: "another-object" })).toBe(false);
            expect(handler.hasDefinition({ ...target, type: "report" })).toBe(false);
            expect(handler.getSnapshot()).toBe(snapshot);
            expect(listener).not.toHaveBeenCalled();
        },
    );

    it("does not retain an interrupted definition as a known target", () => {
        const handler = new CopilotHandler({ registrations: [] });
        const id = handler.definitionApplicationStarted({ target });
        expect(handler.hasDefinition(target)).toBe(true);

        handler.definitionApplicationInterrupted(id);

        expect(handler.hasDefinition(target)).toBe(false);
    });

    it("finds an applied definition by its final identifier", () => {
        const handler = new CopilotHandler({ registrations: [] });
        const id = handler.definitionApplicationStarted({ target });
        const appliedTarget = { ...target, objectId: "final-object" };

        handler.definitionApplied(id, appliedTarget);

        expect(handler.hasDefinition(appliedTarget)).toBe(true);
        expect(handler.hasDefinition(target)).toBe(false);
    });

    it("keeps snapshots stable for unchanged input and unsubscribes directly", () => {
        const { handler } = setup();
        const listener = vi.fn<() => void>();
        const unsubscribe = handler.subscribe(listener);
        const before = handler.getSnapshot();
        handler.handleEvent({ type: "chatReasoning", threadId: "other", title: "Ignored" });
        handler.setContext({ ...target, isEditing: true });
        expect(handler.getSnapshot()).toBe(before);
        expect(listener).not.toHaveBeenCalled();
        handler.handleEvent({ type: "chatReasoning", threadId: "thread", title: "Planning" });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(handler.getReasoningTitle()).toBe("Planning");
        unsubscribe();
        handler.resetInteraction();
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("returns recursively read-only snapshots without freezing host input", () => {
        const { handler } = setup();
        const builderTarget = { ...target };
        handler.setContext({ builderTarget });
        expect(Object.isFrozen(builderTarget)).toBe(false);
        expect(Object.isFrozen(handler.getSnapshot().context.builderTarget)).toBe(true);
        expect(Object.isFrozen(handler.getSnapshot().requests)).toBe(true);
    });

    it("publishes clarification before its callback and forwards a repeated item once", () => {
        const { handler, onClarificationQuestions } = setup();
        handler.startGeneration(type);
        handler.handleEvent({
            type: "chatUserMessage",
            threadId: "thread",
            conversationId: "local",
            question: "Build",
            objects: [],
        });
        onClarificationQuestions.mockImplementation(() => {
            expect(handler.getSnapshot().interaction.pendingClarificationIds).toEqual(["question"]);
            expect(handler.getStatus({ type })).toBe("waiting");
        });
        const questions = {
            type: "chatClarificationQuestions" as const,
            threadId: "thread",
            interactionId: "question",
            questions: [
                { text: "Choose", control: { type: "singleChoice" as const, options: [{ text: "Yes" }] } },
            ],
        };
        handler.handleEvent(questions);
        const snapshot = handler.getSnapshot();
        handler.handleEvent(questions);
        expect(handler.getSnapshot()).toBe(snapshot);
        expect(onClarificationQuestions).toHaveBeenCalledTimes(1);
    });

    it("instances have isolated state, application IDs, and listeners", () => {
        const first = setup().handler;
        const second = setup().handler;
        const listener = vi.fn<() => void>();
        second.subscribe(listener);
        first.startGeneration(type);
        expect(second.isGenerationPending(type)).toBe(false);
        expect(listener).not.toHaveBeenCalled();
        const a = first.definitionApplicationStarted({ target });
        const b = second.definitionApplicationStarted({ target });
        expect(a).not.toBe(b);
        first.definitionApplied(b, target);
        expect(first.getSnapshot().applications[0].id).toBe(a);
    });

    it("disposal stops events, callbacks, subscriptions, and late acknowledgements", () => {
        const { handler, onApplyDefinition } = setup();
        const listener = vi.fn<() => void>();
        handler.subscribe(listener);
        const id = handler.definitionApplicationStarted({ target });
        handler.dispose();
        handler.dispose();
        listener.mockClear();
        const snapshot = handler.getSnapshot();
        handler.subscribe(listener);
        handler.handleEvent(definition);
        handler.startGeneration(type);
        handler.resetInteraction();
        handler.definitionApplied(id, target);
        handler.definitionApplicationInterrupted(id);
        expect(handler.definitionApplicationStarted({ target })).toBe("");
        expect(handler.getSnapshot()).toBe(snapshot);
        expect(listener).not.toHaveBeenCalled();
        expect(onApplyDefinition).not.toHaveBeenCalled();
    });
});
