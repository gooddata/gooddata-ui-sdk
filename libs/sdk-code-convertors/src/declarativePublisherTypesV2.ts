// (C) 2026 GoodData Corporation

// These types are a hand-written stand-in for the stored v2 Publisher entities. Replace them with the
// api-client-tiger declarative types once the client is regenerated for the Document entities (LX-3296).

import {
    type IPublisherDocumentDefinitionV2,
    type IPublisherDocumentTemplateDefinitionV2,
    type IPublisherPageTemplateDefinitionV2,
} from "@gooddata/sdk-model";

/**
 * A document as the declarative API stores it: the model's definition named by a bare id.
 *
 * @alpha
 */
export type DeclarativePublisherDocumentV2 = Omit<IPublisherDocumentDefinitionV2, "ref"> & { id: string };

/**
 * A document template as the declarative API stores it.
 *
 * @alpha
 */
export type DeclarativePublisherDocumentTemplateV2 = Omit<IPublisherDocumentTemplateDefinitionV2, "ref"> & {
    id: string;
};

/**
 * A page template as the declarative API stores it. The backend's default page templates are not
 * part of the declarative layout.
 *
 * @alpha
 */
export type DeclarativePublisherPageTemplateV2 = Omit<IPublisherPageTemplateDefinitionV2, "ref"> & {
    id: string;
};
