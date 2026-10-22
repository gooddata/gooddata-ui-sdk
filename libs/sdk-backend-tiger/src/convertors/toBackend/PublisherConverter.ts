// (C) 2026 GoodData Corporation

import {
    type JsonApiReportInAttributes,
    type JsonApiReportPageLayoutInAttributes,
    type JsonApiReportTemplateInAttributes,
} from "@gooddata/api-client-tiger";
import {
    type IPublisherDocumentDefinitionV1,
    type IPublisherDocumentTemplateDefinitionV1,
    type IPublisherPageTemplateDefinitionV1,
} from "@gooddata/sdk-model";

export function convertPublisherPageLayoutToBackend(
    layout: IPublisherPageTemplateDefinitionV1,
): JsonApiReportPageLayoutInAttributes {
    return {
        title: layout.title,
        description: layout.description,
        tags: layout.tags,
        content: layout.content,
    };
}

export function convertPublisherDocumentTemplateToBackend(
    template: IPublisherDocumentTemplateDefinitionV1,
): JsonApiReportTemplateInAttributes {
    return {
        title: template.title,
        description: template.description,
        tags: template.tags,
        content: template.content,
    };
}

export function convertPublisherDocumentToBackend(
    publisherDocument: IPublisherDocumentDefinitionV1,
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
