// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { AssistantMessage, Message, SemanticSearchContents } from "../../../model.js";
import { mergeWithCache } from "../onThreadLoad.js";

const makeSemanticSearchContents = (
    overrides: Partial<SemanticSearchContents> = {},
): SemanticSearchContents => ({
    type: "semanticSearch",
    text: "Found results",
    searchResults: [
        {
            id: "obj-1",
            type: "dashboard",
            title: "My Dashboard",
            description: "",
            score: 0.9,
            workspaceId: "ws",
        },
    ],
    relationships: [],
    ...overrides,
});

const makeAssistantMessage = (id: string, content: AssistantMessage["content"] = []): AssistantMessage => ({
    id,
    localId: `local-${id}`,
    created: 1000,
    cancelled: false,
    complete: true,
    role: "assistant",
    feedback: "NONE",
    content,
});

const makeUserMessage = (id: string): Message => ({
    id,
    localId: `local-user-${id}`,
    created: 999,
    cancelled: false,
    complete: true,
    role: "user",
    content: [{ type: "text", text: "Find me a dashboard", objects: [] }],
});

describe("mergeWithCache", () => {
    it("returns backend messages unchanged when there are no cached messages", () => {
        const backend = [makeAssistantMessage("interaction-1")];
        const result = mergeWithCache(backend, []);
        expect(result).toEqual(backend);
    });

    it("returns backend messages unchanged when backend already has semanticSearch content", () => {
        const semanticContent = makeSemanticSearchContents();
        const backend = [makeAssistantMessage("interaction-1", [semanticContent])];
        const cachedSemanticContent = makeSemanticSearchContents({ text: "cached" });
        const cached = [makeAssistantMessage("interaction-1", [cachedSemanticContent])];

        const result = mergeWithCache(backend, cached);

        // Backend data takes precedence
        expect(result[0].content).toEqual([semanticContent]);
    });

    it("injects cached semanticSearch content when backend message lacks it", () => {
        const textContent = { type: "text" as const, text: "Here are some results", objects: [] };
        const backend = [makeAssistantMessage("interaction-1", [textContent])];

        const cachedSemanticContent = makeSemanticSearchContents();
        const cached = [makeAssistantMessage("interaction-1", [textContent, cachedSemanticContent])];

        const result = mergeWithCache(backend, cached);

        expect(result[0].content).toHaveLength(2);
        expect(result[0].content[0]).toEqual(textContent);
        expect(result[0].content[1]).toEqual(cachedSemanticContent);
    });

    it("does not alter user messages", () => {
        const userMsg = makeUserMessage("interaction-1");
        const backend: Message[] = [userMsg];
        const cached: Message[] = [userMsg];

        const result = mergeWithCache(backend, cached);
        expect(result[0]).toBe(userMsg);
    });

    it("does not inject cache data for unmatched interaction IDs", () => {
        const backend = [
            makeAssistantMessage("interaction-2", [{ type: "text" as const, text: "hi", objects: [] }]),
        ];
        const cached = [makeAssistantMessage("interaction-1", [makeSemanticSearchContents()])];

        const result = mergeWithCache(backend, cached);

        // backend message with interaction-2 has no cached counterpart, stays unchanged
        expect(result[0].content).toEqual([{ type: "text", text: "hi", objects: [] }]);
    });

    it("preserves all other message properties when injecting cache content", () => {
        const textContent = { type: "text" as const, text: "result", objects: [] };
        const backend = [makeAssistantMessage("interaction-1", [textContent])];
        const cachedSemanticContent = makeSemanticSearchContents();
        const cached = [makeAssistantMessage("interaction-1", [cachedSemanticContent])];

        const result = mergeWithCache(backend, cached);
        const merged = result[0] as AssistantMessage;

        expect(merged.id).toBe("interaction-1");
        expect(merged.localId).toBe("local-interaction-1");
        expect(merged.role).toBe("assistant");
        expect(merged.complete).toBe(true);
        expect(merged.feedback).toBe("NONE");
    });

    it("handles multiple interactions, merging only the ones that need it", () => {
        const semanticContent = makeSemanticSearchContents();
        const cachedSemantic = makeSemanticSearchContents({ text: "cached search" });

        const backend: Message[] = [
            makeAssistantMessage("int-1", [{ type: "text" as const, text: "no search", objects: [] }]),
            makeAssistantMessage("int-2", [semanticContent]),
            makeAssistantMessage("int-3", [{ type: "text" as const, text: "also no search", objects: [] }]),
        ];

        const cached: Message[] = [
            makeAssistantMessage("int-1", [cachedSemantic]),
            makeAssistantMessage("int-2", [semanticContent]),
            makeAssistantMessage("int-3", []),
        ];

        const result = mergeWithCache(backend, cached);

        // int-1: missing semanticSearch in backend but cached has it → merged
        expect(result[0].content).toHaveLength(2);
        expect(result[0].content[1]).toEqual(cachedSemantic);

        // int-2: backend already has semanticSearch → unchanged
        expect(result[1].content).toEqual([semanticContent]);

        // int-3: neither backend nor cached has semanticSearch → unchanged
        expect(result[2].content).toEqual([{ type: "text", text: "also no search", objects: [] }]);
    });
});
