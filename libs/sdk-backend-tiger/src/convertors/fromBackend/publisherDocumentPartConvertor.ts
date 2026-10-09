// (C) 2026 GoodData Corporation

import { type AiReportPart } from "@gooddata/api-client-tiger";
import { type IChatConversationPublisherDocumentContent } from "@gooddata/sdk-backend-spi";
import { type AacPublisherDocument, yamlPublisherDocumentToDefinition } from "@gooddata/sdk-code-convertors";
import { type IPublisherDocumentDefinition, isIdentifierRef } from "@gooddata/sdk-model";

type PublisherDocumentFormatConvertor = (
    publisherDocument: AacPublisherDocument,
) => IPublisherDocumentDefinition;

const DEFAULT_PUBLISHER_DOCUMENT_FORMAT = "aac-v1";

// The backend can name a format this client was not generated for, so the name is read as text.
const PUBLISHER_DOCUMENT_FORMAT_CONVERTORS = new Map<string, PublisherDocumentFormatConvertor>([
    [DEFAULT_PUBLISHER_DOCUMENT_FORMAT, yamlPublisherDocumentToDefinition],
]);

// The convertor throws on a document it cannot read, so this only has to tell a document from any other
// value; what is inside is the convertor's to reject.
function isAacPublisherDocument(value: unknown): value is AacPublisherDocument {
    return typeof value === "object" && value !== null && "type" in value && value.type === "report";
}

const isText = (value: unknown): value is string => typeof value === "string";

const isTextList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isText);

const isTextMap = (value: unknown): value is Record<string, string> =>
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(isText);

// The format convertors copy the fields across as written. Without a text title and period the document
// cannot be shown, so a wrong type rejects it.
const hasTypedRequiredFields = ({ title, periodStart, periodEnd }: IPublisherDocumentDefinition) =>
    [title, periodStart, periodEnd].every(isText);

// An optional field of the wrong type would reach the caller typed as the right one.
// Dropping it keeps the rest of the document readable.
function withTypedOptionalFields(definition: IPublisherDocumentDefinition): IPublisherDocumentDefinition {
    const { description, tags, variableValues, ref, ...required } = definition;
    return {
        ...required,
        ...(isText(description) ? { description } : {}),
        ...(isTextList(tags) ? { tags } : {}),
        ...(isTextMap(variableValues) ? { variableValues } : {}),
        ...(isIdentifierRef(ref) && isText(ref.identifier) ? { ref } : {}),
    };
}

function toPublisherDocumentDefinition(
    publisherDocument: object,
    format: string,
): IPublisherDocumentDefinition | null {
    const convertor = PUBLISHER_DOCUMENT_FORMAT_CONVERTORS.get(format);
    if (!convertor) {
        console.error(`Unknown document format "${format}".`);
        return null;
    }
    if (!isAacPublisherDocument(publisherDocument)) {
        console.error("The report part does not carry a document.");
        return null;
    }
    try {
        const definition = convertor(publisherDocument);
        if (!hasTypedRequiredFields(definition)) {
            console.error("The document's title or period is not text.");
            return null;
        }
        return withTypedOptionalFields(definition);
    } catch (e) {
        console.error(e);
        return null;
    }
}

/**
 * Converts a report part. A document that cannot be read still yields a part, with `publisherDocument`
 * null, so the chat can say the document is unavailable instead of dropping it.
 */
export function convertPublisherDocumentPart(part: AiReportPart): IChatConversationPublisherDocumentContent {
    return {
        type: "publisherDocument",
        publisherDocument: part.report
            ? toPublisherDocumentDefinition(part.report, part.format ?? DEFAULT_PUBLISHER_DOCUMENT_FORMAT)
            : null,
        saved: part.saved_report_id,
        ref: part.report_ref,
        baseDocumentId: part.base_report_id,
        refines: part.refines_ref,
        ...(part.reworks_open_report ? { reworksOpenDocument: true } : {}),
    };
}
