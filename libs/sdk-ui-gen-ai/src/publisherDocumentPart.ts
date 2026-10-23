// (C) 2026 GoodData Corporation

import {
    type GenAIPublisherDocumentFormat,
    type IChatConversationMultipartPart,
    type IChatConversationPublisherDocumentContent,
    type IChatConversationPublisherDocumentContentV2,
    isChatConversationPublisherDocumentContent,
    isChatConversationPublisherDocumentContentV2,
} from "@gooddata/sdk-backend-spi";
import {
    type IUserWorkspaceSettings,
    isPublisherAbsolutePeriodV2,
    publisherDocumentContentSectionsV2,
} from "@gooddata/sdk-model";

export type PublisherDocumentPart =
    | IChatConversationPublisherDocumentContent
    | IChatConversationPublisherDocumentContentV2;

export function isPublisherDocumentPart(part: IChatConversationMultipartPart): part is PublisherDocumentPart {
    return (
        isChatConversationPublisherDocumentContent(part) || isChatConversationPublisherDocumentContentV2(part)
    );
}

export function publisherDocumentPartFormat(part: PublisherDocumentPart): GenAIPublisherDocumentFormat {
    return isChatConversationPublisherDocumentContentV2(part) ? "aac-v2" : "aac-v1";
}

export function publisherDocumentFormatOf(
    settings: IUserWorkspaceSettings | undefined,
): GenAIPublisherDocumentFormat {
    return settings?.enablePublisherV2 ? "aac-v2" : "aac-v1";
}

export interface IPublisherDocumentSummary {
    title: string;
    /**
     * Both `YYYY-MM-DD`. Absent for a period counted from today, which only the Publisher app resolves.
     */
    period?: { from: string; to: string };
    pageCount: number;
}

export function summarizePublisherDocument(part: PublisherDocumentPart): IPublisherDocumentSummary | null {
    if (isChatConversationPublisherDocumentContentV2(part)) {
        const publisherDocument = part.publisherDocument;
        if (!publisherDocument) {
            return null;
        }
        const pages = publisherDocumentContentSectionsV2(publisherDocument.content).flatMap(
            (section) => section.pages,
        );
        return {
            title: publisherDocument.title,
            ...(isPublisherAbsolutePeriodV2(publisherDocument.period)
                ? { period: { from: publisherDocument.period.from, to: publisherDocument.period.to } }
                : {}),
            pageCount: pages.filter((page) => page.visible !== false).length,
        };
    }
    const publisherDocument = part.publisherDocument;
    if (!publisherDocument) {
        return null;
    }
    return {
        title: publisherDocument.title,
        period: { from: publisherDocument.periodStart, to: publisherDocument.periodEnd },
        pageCount: publisherDocument.content.pages.length,
    };
}

// With no name, the first document part.
export function findPublisherDocumentPart<T extends IChatConversationMultipartPart>(
    parts: T[],
    documentRef: string | undefined,
): (T & PublisherDocumentPart) | undefined {
    const documents = parts.filter((part): part is T & PublisherDocumentPart =>
        isPublisherDocumentPart(part),
    );
    return documentRef === undefined ? documents[0] : documents.find((part) => part.ref === documentRef);
}
