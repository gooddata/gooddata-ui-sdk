// (C) 2026 GoodData Corporation

import { type AiPublisherDocumentPart } from "@gooddata/api-client-tiger";
import { type IChatConversationPublisherDocumentContentV2 } from "@gooddata/sdk-backend-spi";
import {
    type AacPublisherDocumentV2,
    type AacPublisherEntityWithOptionalIdV2,
    yamlPublisherDocumentToDefinitionV2,
} from "@gooddata/sdk-code-convertors";
import { type IPublisherDocumentDefinitionV2, validateLoadedPublisherEntityV2 } from "@gooddata/sdk-model";

// The convertor throws on a document it cannot read, so this only has to tell a document from any other
// value; what is inside is the convertor's and the validator's to reject.
function isAacPublisherDocumentV2(
    value: unknown,
): value is AacPublisherEntityWithOptionalIdV2<AacPublisherDocumentV2> {
    return typeof value === "object" && value !== null && "type" in value && value.type === "document";
}

function toPublisherDocumentDefinitionV2(document: object): IPublisherDocumentDefinitionV2 | null {
    if (!isAacPublisherDocumentV2(document)) {
        console.error("The document part does not carry a document.");
        return null;
    }
    try {
        const definition = yamlPublisherDocumentToDefinitionV2(document);
        const issues = validateLoadedPublisherEntityV2(definition);
        if (issues.length > 0) {
            console.error("The document part's document is not valid.", issues);
            return null;
        }
        return definition;
    } catch (e) {
        console.error(e);
        return null;
    }
}

/**
 * Converts a document part. A document that cannot be read still yields a part, with `publisherDocument`
 * null, so the chat can say the document is unavailable instead of dropping it.
 */
export function convertPublisherDocumentPartV2(
    part: AiPublisherDocumentPart,
): IChatConversationPublisherDocumentContentV2 {
    return {
        type: "publisherDocumentV2",
        publisherDocument: part.document ? toPublisherDocumentDefinitionV2(part.document) : null,
        saved: part.saved_document_id,
        ref: part.document_ref,
        baseDocumentId: part.base_document_id,
        refines: part.refines_ref,
        ...(part.reworks_open_document ? { reworksOpenDocument: true } : {}),
    };
}
