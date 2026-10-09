// (C) 2026 GoodData Corporation

import {
    type JsonApiReportInAttributes,
    type JsonApiReportPageLayoutInAttributes,
    type JsonApiReportTemplateInAttributes,
} from "@gooddata/api-client-tiger";
import {
    type IPublisherDocumentDefinition,
    type IPublisherDocumentTemplateDefinition,
    type IPublisherPageLayoutDefinition,
} from "@gooddata/sdk-model";

export function convertPublisherPageLayoutToBackend(
    layout: IPublisherPageLayoutDefinition,
): JsonApiReportPageLayoutInAttributes {
    return {
        title: layout.title,
        description: layout.description,
        tags: layout.tags,
        content: layout.content,
    };
}

export function convertPublisherDocumentTemplateToBackend(
    template: IPublisherDocumentTemplateDefinition,
): JsonApiReportTemplateInAttributes {
    return {
        title: template.title,
        description: template.description,
        tags: template.tags,
        content: template.content,
    };
}

export function convertPublisherDocumentToBackend(
    publisherDocument: IPublisherDocumentDefinition,
): JsonApiReportInAttributes {
    return {
        title: publisherDocument.title,
        description: publisherDocument.description,
        tags: publisherDocument.tags,
        periodStart: publisherDocument.periodStart,
        periodEnd: publisherDocument.periodEnd,
        content: publisherDocument.content,
        variableValues: publisherDocument.variableValues,
    };
}
