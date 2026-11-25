// (C) 2026 GoodData Corporation

import { type UnknownAction } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";

import { type IInsight } from "@gooddata/sdk-model";

import {
    type IChatConversationLocal,
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
    makeConversationItem,
} from "../../model.js";

import {
    messagesSliceReducer,
    saveVisualisationRenderStatusSuccessAction,
    saveVisualizationAction,
    saveVisualizationErrorAction,
    saveVisualizationSuccessAction,
    savedVisualizationAction,
} from "./messagesSlice.js";

type VisualizationPart = Extract<IChatConversationMultipartLocalPart, { type: "visualization" }> & {
    visualization: IInsight;
};

const makeVisualization = (identifier = "draft"): VisualizationPart => ({
    type: "visualization",
    visualization: { insight: { identifier, title: "Original title" } } as IInsight,
    saving: { started: true, completed: false },
    reporting: true,
    error: { name: "PreviousError", message: "Previous error" },
    saved: "previous-save",
});

const makeMessage = (
    parts: IChatConversationMultipartLocalPart[] = [makeVisualization()],
): IChatConversationLocalItem => ({
    ...makeConversationItem({
        type: "item",
        id: "assistant-server",
        responseId: "response",
        role: "assistant",
        createdAt: 1,
        content: { type: "multipart", parts },
    }),
    localId: "assistant-local",
});

const makeConversation = (localId: string): IChatConversationLocal => ({
    id: `server-${localId}`,
    localId,
    title: localId,
    createdAt: new Date(1).toISOString(),
    updatedAt: new Date(1).toISOString(),
});

const makeState = (message = makeMessage()): ReturnType<typeof messagesSliceReducer> => ({
    ...messagesSliceReducer(undefined, { type: "test/init" }),
    currentConversation: makeConversation("origin"),
    conversations: [makeConversation("origin"), makeConversation("other")],
    conversationsData: {
        origin: { order: [message.localId], items: { [message.localId]: message } },
        other: { order: [message.localId], items: { [message.localId]: makeMessage() } },
    },
});

const target = { assistantMessageId: "assistant-local", visualizationId: "draft" };
const saveError = { name: "SaveError", message: "Save failed" };

const cases: {
    name: string;
    action: (conversationId?: string) => UnknownAction;
    expected: (part: VisualizationPart) => VisualizationPart;
    usesPayloadConversation: boolean;
}[] = [
    {
        name: "saveVisualizationAction",
        action: () => saveVisualizationAction({ ...target, visualizationTitle: "New title", explore: true }),
        expected: (part) => ({
            ...part,
            visualization: { insight: { ...part.visualization.insight, title: "New title" } },
            saving: { started: true, completed: false },
        }),
        usesPayloadConversation: false,
    },
    {
        name: "savedVisualizationAction",
        action: () => savedVisualizationAction(target),
        expected: (part) => {
            const result = { ...part };
            delete result.saving;
            return result;
        },
        usesPayloadConversation: false,
    },
    {
        name: "saveVisualizationErrorAction",
        action: (conversationId) =>
            saveVisualizationErrorAction({ ...target, conversationId, error: saveError }),
        expected: (part) => ({
            ...part,
            saving: { started: false, completed: false },
            error: saveError,
        }),
        usesPayloadConversation: true,
    },
    {
        name: "saveVisualizationSuccessAction",
        action: (conversationId) =>
            saveVisualizationSuccessAction({
                ...target,
                conversationId,
                savedVisualizationId: "saved",
                explore: true,
            }),
        expected: (part) => ({
            ...part,
            visualization: { insight: { ...part.visualization.insight, identifier: "saved" } },
            saving: { started: true, completed: true },
        }),
        usesPayloadConversation: true,
    },
    {
        name: "saveVisualisationRenderStatusSuccessAction",
        action: () => saveVisualisationRenderStatusSuccessAction({ ...target, status: "SUCCESSFUL" }),
        expected: (part) => {
            const result = { ...part };
            delete result.reporting;
            return result;
        },
        usesPayloadConversation: false,
    },
];

describe.each(cases)("$name visualization lookup", ({ action, expected, usesPayloadConversation }) => {
    it("updates only the first matching visualization in the targeted local message", () => {
        const part = makeVisualization();
        part.saving = { started: false, completed: true };
        const parts: IChatConversationMultipartLocalPart[] = [
            { type: "text", text: "A chart" },
            { type: "visualization", visualization: null },
            makeVisualization("unrelated"),
            part,
            makeVisualization(),
        ];
        const message = makeMessage(parts);
        const otherMessage = { ...makeMessage(), localId: "other-message" };
        const before = makeState(message);
        before.conversationsData["origin"].items[otherMessage.localId] = otherMessage;
        before.conversationsData["origin"].order.push(otherMessage.localId);
        const original = structuredClone(before);

        const state = messagesSliceReducer(before, action("origin"));

        expect(state).toStrictEqual({
            ...before,
            conversationsData: {
                ...before.conversationsData,
                origin: {
                    ...before.conversationsData["origin"],
                    items: {
                        ...before.conversationsData["origin"].items,
                        [message.localId]: {
                            ...message,
                            content: {
                                type: "multipart",
                                parts: [...parts.slice(0, 3), expected(part), parts[4]],
                            },
                        },
                    },
                },
            },
        });
        expect(before).toStrictEqual(original);
    });

    it.each([
        { name: "empty parts", parts: [] },
        { name: "non-visualization parts", parts: [{ type: "text", text: "No chart" }] },
        { name: "a null visualization", parts: [{ type: "visualization", visualization: null }] },
        { name: "an unmatched visualization", parts: [makeVisualization("unmatched")] },
    ] satisfies { name: string; parts: IChatConversationMultipartLocalPart[] }[])(
        "does nothing for $name",
        ({ parts }) => {
            const before = makeState(makeMessage(parts));

            expect(messagesSliceReducer(before, action("origin"))).toBe(before);
        },
    );

    it.each([
        { type: "text", text: "Not multipart" },
        { type: "error", message: "Not multipart" },
    ] satisfies IChatConversationLocalItem["content"][])("rejects $type content", (content) => {
        const before = makeState({ ...makeMessage(), content });

        expect(() => messagesSliceReducer(before, action("origin"))).toThrow("Unexpected message type");
    });

    it.each(["user", "system"] as const)("rejects a %s message", (role) => {
        const before = makeState({ ...makeMessage(), role });

        expect(() => messagesSliceReducer(before, action("origin"))).toThrow(
            "Unexpected error during message evaluation.",
        );
    });

    it("still throws when the assistant message is missing", () => {
        const before = makeState();
        before.conversationsData["origin"] = { order: [], items: {} };

        expect(() => messagesSliceReducer(before, action("origin"))).toThrow(TypeError);
    });

    it("keeps the existing conversation policy when the selected conversation changes", () => {
        const before = { ...makeState(), currentConversation: makeConversation("other") };
        const targetId = usesPayloadConversation ? "origin" : "other";
        const untouchedId = usesPayloadConversation ? "other" : "origin";

        const state = messagesSliceReducer(before, action("origin"));

        expect(state.conversationsData[targetId].items[target.assistantMessageId].content).toStrictEqual({
            type: "multipart",
            parts: [expected(makeVisualization())],
        });
        expect(state.conversationsData[untouchedId]).toBe(before.conversationsData[untouchedId]);
        expect(state.currentConversation).toBe(before.currentConversation);
    });

    it("does not fall back when the required conversation identity is missing", () => {
        const before = usesPayloadConversation
            ? makeState()
            : { ...makeState(), currentConversation: undefined };

        expect(() => messagesSliceReducer(before, action())).toThrow(
            "Unexpected error during message evaluation.",
        );
    });
});

describe.each(cases.filter(({ usesPayloadConversation }) => usesPayloadConversation))(
    "$name explicit conversation identity",
    ({ action }) => {
        it.each(["missing", "server-origin"])("does not resolve or fall back from %s", (conversationId) => {
            const before = makeState();

            expect(() => messagesSliceReducer(before, action(conversationId))).toThrow(TypeError);
        });
    },
);
