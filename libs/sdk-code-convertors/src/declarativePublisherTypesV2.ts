// (C) 2026 GoodData Corporation

import {
    type DeclarativePublisherDocument,
    type DeclarativePublisherDocumentPageTemplate,
    type DeclarativePublisherDocumentTemplate,
} from "@gooddata/api-client-tiger";
import {
    type IPublisherPageBodyV2,
    type PublisherContentVersionV2,
    type PublisherDocumentContentV2,
} from "@gooddata/sdk-model";

/**
 * A v2 document as the declarative API stores it, with typed version and content.
 *
 * @alpha
 */
export type DeclarativePublisherDocumentV2 = Omit<DeclarativePublisherDocument, "content" | "version"> & {
    version: PublisherContentVersionV2;
    content: PublisherDocumentContentV2;
};

/**
 * A v2 document template as the declarative API stores it, with typed version and content.
 *
 * @alpha
 */
export type DeclarativePublisherDocumentTemplateV2 = Omit<
    DeclarativePublisherDocumentTemplate,
    "content" | "version"
> & {
    version: PublisherContentVersionV2;
    content: PublisherDocumentContentV2;
};

/**
 * A v2 page template as the declarative API stores it, with typed version and content.
 *
 * @alpha
 */
export type DeclarativePublisherPageTemplateV2 = Omit<
    DeclarativePublisherDocumentPageTemplate,
    "content" | "version"
> & {
    version: PublisherContentVersionV2;
    content: IPublisherPageBodyV2;
};

/**
 * The kind of a stored v2 Publisher entity. The declarative API stores no `type` key, so the kind is
 * passed next to the entity.
 *
 * @alpha
 */
export type DeclarativePublisherEntityKindV2 = "document" | "documentTemplate" | "pageTemplate";
