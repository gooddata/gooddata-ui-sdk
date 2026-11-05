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
    type IPublisherPageBodyV2,
    type IPublisherPageTemplateDefinitionV2,
    type PublisherDocumentContentV2,
} from "@gooddata/sdk-model";

type PublisherEntityDefinitionV2 =
    | IPublisherDocumentDefinitionV2
    | IPublisherDocumentTemplateDefinitionV2
    | IPublisherPageTemplateDefinitionV2;

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

function entityAttributes(
    entity: PublisherEntityDefinitionV2,
): Pick<JsonApiPublisherDocumentInAttributes, "title" | "description" | "tags" | "version"> {
    return {
        title: entity.title,
        ...descriptiveAttributes(entity),
        version: entity.version,
    };
}

// The api client types the stored content after the backend's schema, and sdk-model after its own
// definition of the same JSON. Sound: assertPublisherEntitySupportedV2 has checked the content against
// the sdk-model definition, and the backend stores what passes it.
function storedContent<T>(content: PublisherDocumentContentV2 | IPublisherPageBodyV2): T {
    return content as unknown as T;
}

export function convertPublisherPageTemplateToBackendV2(
    template: IPublisherPageTemplateDefinitionV2,
): JsonApiPublisherDocumentPageTemplateInAttributes {
    assertPublisherEntitySupportedV2(template);
    return { ...entityAttributes(template), content: storedContent(template.content) };
}

export function convertPublisherDocumentTemplateToBackendV2(
    template: IPublisherDocumentTemplateDefinitionV2,
): JsonApiPublisherDocumentTemplateInAttributes {
    assertPublisherEntitySupportedV2(template);
    return { ...entityAttributes(template), content: storedContent(template.content) };
}

export function convertPublisherDocumentToBackendV2(
    publisherDocument: IPublisherDocumentDefinitionV2,
): JsonApiPublisherDocumentInAttributes {
    assertPublisherEntitySupportedV2(publisherDocument);
    return {
        ...entityAttributes(publisherDocument),
        period: publisherDocument.period,
        content: storedContent(publisherDocument.content),
    };
}
