// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type ChatDefinitionReceivedEvent } from "../store/events.js";

import { CopilotHandler } from "./CopilotHandler.js";
import { CopilotBuildType, type ICopilotConfiguration, type ICopilotRegistration } from "./types.js";

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
