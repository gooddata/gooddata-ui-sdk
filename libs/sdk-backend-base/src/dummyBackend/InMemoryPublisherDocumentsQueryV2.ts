// (C) 2026 GoodData Corporation

import {
    type IFilterBaseOptions,
    type IPublisherDocumentSummaryV2,
    type IPublisherDocumentsQueryResultV2,
    type IPublisherDocumentsQueryV2,
} from "@gooddata/sdk-backend-spi";
import { type IPublisherDocumentV2, isIdentifierRef } from "@gooddata/sdk-model";

import { InMemoryPaging } from "../toolkit/paging.js";

function documentId(document: IPublisherDocumentV2): string | undefined {
    return isIdentifierRef(document.ref) ? document.ref.identifier : undefined;
}

function matches(document: IPublisherDocumentV2, filter: IFilterBaseOptions): boolean {
    const id = documentId(document);
    const tags = document.tags ?? [];
    const search = filter.search?.toLowerCase();
    if (filter.isHidden || filter.certification) {
        return false;
    }
    if (filter.id && (id === undefined || !filter.id.includes(id))) {
        return false;
    }
    if (filter.excludeId && id !== undefined && filter.excludeId.includes(id)) {
        return false;
    }
    if (filter.tags?.length && !filter.tags.some((tag) => tags.includes(tag))) {
        return false;
    }
    if (filter.excludeTags?.some((tag) => tags.includes(tag))) {
        return false;
    }
    return !search || document.title.toLowerCase().includes(search);
}

function toSummary(document: IPublisherDocumentV2): IPublisherDocumentSummaryV2 {
    const { ref, title, description, tags, version, isLocked, created, updated, createdBy, updatedBy } =
        document;
    return { ref, title, description, tags, version, isLocked, created, updated, createdBy, updatedBy };
}

/**
 * Pages over the documents of {@link InMemoryWorkspacePublisherServiceV2}. Filters by id, tags and the
 * title; ignores the user filters, the origin and the sorting.
 *
 * @internal
 */
export class InMemoryPublisherDocumentsQueryV2 implements IPublisherDocumentsQueryV2 {
    private size = 50;
    private page = 0;
    private filter: IFilterBaseOptions = {};

    constructor(private readonly documents: () => IPublisherDocumentV2[]) {}

    public withSize(size: number): IPublisherDocumentsQueryV2 {
        this.size = size;
        return this;
    }

    public withPage(page: number): IPublisherDocumentsQueryV2 {
        this.page = page;
        return this;
    }

    public withFilter(filter: IFilterBaseOptions): IPublisherDocumentsQueryV2 {
        this.filter = filter;
        return this;
    }

    public withSorting(_sort: string[]): IPublisherDocumentsQueryV2 {
        return this;
    }

    public withOrigin(_origin: string): IPublisherDocumentsQueryV2 {
        return this;
    }

    public async query(): Promise<IPublisherDocumentsQueryResultV2> {
        const summaries = this.documents()
            .filter((document) => matches(document, this.filter))
            .map(toSummary);
        return new InMemoryPaging(summaries, this.size, this.page * this.size);
    }
}
