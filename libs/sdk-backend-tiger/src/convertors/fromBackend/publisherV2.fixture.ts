// (C) 2026 GoodData Corporation

import {
    type JsonApiPublisherDocumentOutMeta,
    type JsonApiPublisherDocumentOutRelationships,
    type JsonApiPublisherDocumentOutWithLinks,
    type JsonApiPublisherDocumentPageTemplateOutWithLinks,
    type JsonApiPublisherDocumentTemplateOutWithLinks,
    type JsonApiUserIdentifierOutWithLinks,
} from "@gooddata/api-client-tiger";
import {
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentTemplateDefinitionV2,
    type IPublisherPageBodyV2,
    type IPublisherPageTemplateDefinitionV2,
    type PublisherDocumentContentV2,
} from "@gooddata/sdk-model";

export const pageBodyV2: IPublisherPageBodyV2 = {
    layout: {
        type: "column",
        children: [
            { type: "title", id: "pageTitle", markdown: "Revenue" },
            { type: "visualization", id: "widget1" },
        ],
    },
};

export const documentContentV2: PublisherDocumentContentV2 = {
    pages: [{ ...pageBodyV2, id: "page_a" }],
};

export const absolutePeriodDocumentV2: IPublisherDocumentDefinitionV2 = {
    type: "document",
    title: "Northwind H1",
    version: "2",
    period: { type: "absolute", granularity: "GDC.time.date", from: "2026-01-01", to: "2026-06-30" },
    content: documentContentV2,
};

export const relativePeriodDocumentV2: IPublisherDocumentDefinitionV2 = {
    type: "document",
    title: "Northwind last 6 months",
    version: "2",
    period: { type: "relative", granularity: "GDC.time.month", from: -6, to: -1 },
    content: documentContentV2,
};

export const documentTemplateV2: IPublisherDocumentTemplateDefinitionV2 = {
    type: "documentTemplate",
    title: "Quarterly",
    version: "2",
    content: documentContentV2,
};

export const pageTemplateV2: IPublisherPageTemplateDefinitionV2 = {
    type: "pageTemplate",
    title: "Content",
    version: "2",
    content: pageBodyV2,
};

export const parentOriginMetaV2: JsonApiPublisherDocumentOutMeta = {
    origin: { originType: "PARENT", originId: "parent" },
};

export const auditRelationshipsV2: JsonApiPublisherDocumentOutRelationships = {
    createdBy: { data: { id: "alice", type: "userIdentifier" } },
    modifiedBy: { data: { id: "bob", type: "userIdentifier" } },
};

export const auditUsersV2: JsonApiUserIdentifierOutWithLinks[] = [
    {
        id: "alice",
        type: "userIdentifier",
        attributes: { firstname: "Alice", lastname: "Novak", email: "alice@example.com" },
    },
    {
        id: "bob",
        type: "userIdentifier",
        attributes: { firstname: "Bob", lastname: "Svoboda", email: "bob@example.com" },
    },
];

export function documentOutV2(
    id: string,
    attributes: Partial<JsonApiPublisherDocumentOutWithLinks["attributes"]> = {},
): JsonApiPublisherDocumentOutWithLinks {
    return {
        id,
        type: "document",
        attributes: {
            title: absolutePeriodDocumentV2.title,
            version: "2",
            period: absolutePeriodDocumentV2.period,
            content: absolutePeriodDocumentV2.content,
            ...attributes,
        },
    };
}

export function documentTemplateOutV2(
    id: string,
    attributes: Partial<JsonApiPublisherDocumentTemplateOutWithLinks["attributes"]> = {},
): JsonApiPublisherDocumentTemplateOutWithLinks {
    return {
        id,
        type: "documentTemplate",
        attributes: {
            title: documentTemplateV2.title,
            version: "2",
            content: documentTemplateV2.content,
            ...attributes,
        },
    };
}

export function pageTemplateOutV2(
    id: string,
    attributes: Partial<JsonApiPublisherDocumentPageTemplateOutWithLinks["attributes"]> = {},
): JsonApiPublisherDocumentPageTemplateOutWithLinks {
    return {
        id,
        type: "pageTemplate",
        attributes: {
            title: pageTemplateV2.title,
            version: "2",
            content: pageTemplateV2.content,
            ...attributes,
        },
    };
}
