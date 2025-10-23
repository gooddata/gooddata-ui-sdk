// (C) 2024-2025 GoodData Corporation

import { EntitiesApiGetAllEntitiesMemoryItemsRequest } from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    IMemoryItemsFilterOptions,
    type IMemoryItemsQuery,
    type IMemoryItemsQueryResult,
} from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";

import { convertMemoryItem } from "../../../convertors/fromBackend/MemoryItemConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { buildFilterQuery } from "../../common/filtering.js";

export class MemoryItemsQuery implements IMemoryItemsQuery {
    private size = 50;
    private page = 0;
    private filter: string | undefined = undefined;
    private sort = {};
    private include: EntitiesApiGetAllEntitiesMemoryItemsRequest["include"] = undefined;
    private origin: ObjectOrigin | undefined = undefined;
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesMemoryItemsRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IMemoryItemsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IMemoryItemsQuery {
        this.page = page;
        return this;
    }
    withFilter(filter: IMemoryItemsFilterOptions): IMemoryItemsQuery {
        this.filter = buildMemoryItemsFilterQuery(filter);
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IMemoryItemsQuery {
        this.sort = { sort };
        return this;
    }

    withInclude(include: string[]): IMemoryItemsQuery {
        // NOTE: Unsupported include values handling is delegated to the backend
        this.include = include as EntitiesApiGetAllEntitiesMemoryItemsRequest["include"];
        return this;
    }

    withOrigin(origin: ObjectOrigin): IMemoryItemsQuery {
        this.origin = origin;
        return this;
    }

    query(): Promise<IMemoryItemsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const metaIncludeObj =
                    this.totalCount === undefined ? { metaInclude: ["page" as const] } : {};
                const response = await this.authCall((client) =>
                    client.entities.getAllEntitiesMemoryItems({
                        ...this.requestParameters,
                        ...metaIncludeObj,
                        ...this.sort,
                        filter: this.filter,
                        include: this.include,
                        origin: this.origin,
                        size: limit,
                        page: offset / limit,
                    }),
                );

                const totalCount = response.data.meta?.page?.totalElements;
                if (!(totalCount === null || totalCount === undefined)) {
                    this.setTotalCount(totalCount);
                }

                const items = response.data.data.map((item) =>
                    convertMemoryItem(item, response.data.included ?? []),
                );
                return { items, totalCount: totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}

function buildMemoryItemsFilterQuery(filter: IMemoryItemsFilterOptions): string | undefined {
    const baseFilter = buildFilterQuery(filter);
    const filters: string[] = baseFilter ? [baseFilter] : [];
    if (filter.strategy && filter.strategy.length > 0) {
        filters.push(`strategy=in=(${formatInValues(filter.strategy)})`);
    }
    if (filter.isDisabled !== undefined) {
        filters.push(`isDisabled=in=(${filter.isDisabled})`);
    }
    if (filters.length > 0) {
        return filters.join(";");
    }
    return undefined;
}

/**
 * Formats values for RSQL "in" operator.
 *
 * Wrapping each value in double quotes allows values with spaces.
 * Joining by comma acts as an OR operator.
 */
function formatInValues(values: string[]): string {
    return values.map(formatValue).join(",");
}

/**
 * Formats value for RSQL.
 */
function formatValue(value: string): string {
    return `"${escapeValue(value)}"`;
}

/**
 * Escapes characters (backslashes and double quotes) that would break quoted filter values.
 */
function escapeValue(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
