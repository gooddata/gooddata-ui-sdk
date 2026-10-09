// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IPublisherDocumentDefinition } from "@gooddata/sdk-model";

import { type IChatConversationLocalItem } from "../../model.js";

import { notifyDefinitionReceived } from "./onDefinitionReceivedTrigger.js";

const publisherDocument: IPublisherDocumentDefinition = {
    type: "report",
    title: "Q2",
    periodStart: "2026-04-01",
    periodEnd: "2026-06-30",
    content: { version: "1", pages: [] },
};

const item = {
    id: "item-1",
    localId: "local-1",
    responseId: "resp-1",
    role: "assistant",
    content: {
        type: "multipart",
        parts: [
            {
                type: "publisherDocument",
                publisherDocument,
                ref: "report_2",
                refines: "report_1",
                reworksOpenDocument: true,
                baseDocumentId: "q2",
            },
        ],
    },
} as unknown as IChatConversationLocalItem;

/** The actions the saga puts, collected without a store. */
function putActions() {
    const actions: unknown[] = [];
    const saga = notifyDefinitionReceived(item, "conv-1");
    for (let step = saga.next(); !step.done; step = saga.next()) {
        const effect = step.value as { type?: string; payload?: { action?: unknown } };
        if (effect.type === "PUT") {
            actions.push(effect.payload?.action);
        }
    }
    return actions as { payload: Record<string, unknown> }[];
}

describe("notifyDefinitionReceived", () => {
    it("raises a document with what an app needs to apply it", () => {
        const [action] = putActions();

        expect(action.payload).toMatchObject({
            definitionType: "publisherDocument",
            conversationId: "conv-1",
            publisherDocument,
            documentRef: "report_2",
            refines: "report_1",
            reworksOpenDocument: true,
            baseDocumentId: "q2",
        });
    });
});
