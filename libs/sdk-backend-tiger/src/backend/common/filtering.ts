// (C) 2025 GoodData Corporation
import { IFilterBaseOptions } from "@gooddata/sdk-backend-spi";

export function buildFilterQuery(filter: IFilterBaseOptions) {
    const filters: string[] = [];

    if (filter.title) {
        // containsic === contains + ignore case
        filters.push(`title=containsic="${filter.title}"`);
    }
    if (filter.createdBy) {
        filters.push(`createdBy.id=="${filter.createdBy}"`);
    }
    if (filter.tags && filter.tags.length > 0) {
        const tags = filter.tags.map((tag) => `"${tag}"`);
        filters.push(`tags=in=(${tags.join(",")})`);
    }

    //Join all filters if any
    if (filters.length > 0) {
        return filters.join(";");
    }
    return undefined;
}
