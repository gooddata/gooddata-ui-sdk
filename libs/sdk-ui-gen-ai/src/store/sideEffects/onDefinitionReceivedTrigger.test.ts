// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IPublisherDocumentDefinition, type IPublisherDocumentDefinitionV2 } from "@gooddata/sdk-model";

import { type IChatConversationLocalItem } from "../../model.js";

import { notifyDefinitionReceived } from "./onDefinitionReceivedTrigger.js";

const publisherDocument: IPublisherDocumentDefinition = {
    type: "report",
    title: "Q2",
    periodStart: "2026-04-01",
    periodEnd: "2026-06-30",
    content: { version: "1", pages: [] },
};

const publisherDocumentV2: IPublisherDocumentDefinitionV2 = {
    type: "document",
    version: "2",
    title: "Q2",
    period: { type: "absolute", granularity: "GDC.time.date", from: "2026-04-01", to: "2026-06-30" },
    content: { pages: [] },
};

const itemWith = (part: Record<string, unknown>) =>
    ({
        id: "item-1",
        localId: "local-1",
        responseId: "resp-1",
        role: "assistant",
        content: { type: "multipart", parts: [part] },
    }) as unknown as IChatConversationLocalItem;

const draftFields = { ref: "report_2", refines: "report_1", reworksOpenDocument: true, baseDocumentId: "q2" };

/** The actions the saga puts, collected without a store. */
function putActions(item: IChatConversationLocalItem) {
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
        const [action] = putActions(
            itemWith({ type: "publisherDocument", publisherDocument, ...draftFields }),
        );

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

    it("raises a v2 document in its own field", () => {
        const [action] = putActions(
            itemWith({ type: "publisherDocumentV2", publisherDocument: publisherDocumentV2, ...draftFields }),
        );

        expect(action.payload).toMatchObject({
            definitionType: "publisherDocumentV2",
            conversationId: "conv-1",
            publisherDocumentV2,
            documentRef: "report_2",
            refines: "report_1",
            reworksOpenDocument: true,
            baseDocumentId: "q2",
        });
        expect(action.payload).not.toHaveProperty("publisherDocument");
    });

    it("raises nothing for a v2 part without a document", () => {
        expect(putActions(itemWith({ type: "publisherDocumentV2", publisherDocument: null }))).toEqual([]);
    });
});
