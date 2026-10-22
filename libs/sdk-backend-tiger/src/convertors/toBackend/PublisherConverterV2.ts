// (C) 2026 GoodData Corporation

import {
    type JsonApiPublisherDocumentInAttributes,
    type JsonApiPublisherDocumentPageTemplateInAttributes,
    type JsonApiPublisherDocumentTemplateInAttributes,
} from "@gooddata/api-client-tiger";
import { assertPublisherEntitySupportedV2 } from "@gooddata/sdk-backend-spi";
import {
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentTemplateDefinitionV2,
    type IPublisherPageTemplateDefinitionV2,
} from "@gooddata/sdk-model";

function descriptiveAttributes({
    description,
    tags,
}: Pick<IPublisherDocumentDefinitionV2, "description" | "tags">): Pick<
    JsonApiPublisherDocumentInAttributes,
    "description" | "tags"
> {
    return {
        ...(description ? { description } : {}),
        ...(tags?.length ? { tags } : {}),
    };
}

function templateAttributes(
    template: IPublisherPageTemplateDefinitionV2 | IPublisherDocumentTemplateDefinitionV2,
): JsonApiPublisherDocumentPageTemplateInAttributes & JsonApiPublisherDocumentTemplateInAttributes {
    assertPublisherEntitySupportedV2(template);
    return {
        title: template.title,
        ...descriptiveAttributes(template),
        version: template.version,
        content: template.content,
    };
}

export function convertPublisherPageTemplateToBackendV2(
    template: IPublisherPageTemplateDefinitionV2,
): JsonApiPublisherDocumentPageTemplateInAttributes {
    return templateAttributes(template);
}

export function convertPublisherDocumentTemplateToBackendV2(
    template: IPublisherDocumentTemplateDefinitionV2,
): JsonApiPublisherDocumentTemplateInAttributes {
    return templateAttributes(template);
}

export function convertPublisherDocumentToBackendV2(
    publisherDocument: IPublisherDocumentDefinitionV2,
): JsonApiPublisherDocumentInAttributes {
    assertPublisherEntitySupportedV2(publisherDocument);
    return {
        title: publisherDocument.title,
        ...descriptiveAttributes(publisherDocument),
        version: publisherDocument.version,
        period: publisherDocument.period,
        content: publisherDocument.content,
    };
}
