// (C) 2024-2025 GoodData Corporation

import isNil from "lodash/isNil.js";

import { EntitiesApiGetAllEntitiesFactsRequest, MetadataUtilities } from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import { IFactsQuery, IFactsQueryResult, IFilterBaseOptions } from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";

import { convertFactsWithLinks } from "../../../convertors/fromBackend/MetadataConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { buildFilterQuery } from "../../common/filtering.js";

export class FactsQuery implements IFactsQuery {
    private size = 50;
    private page = 0;
    private filter: string | undefined = undefined;
    private sort = {};
    private include: EntitiesApiGetAllEntitiesFactsRequest["include"] = undefined;
    private origin: ObjectOrigin | undefined = undefined;
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesFactsRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IFactsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IFactsQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: IFilterBaseOptions): IFactsQuery {
        this.filter = buildFilterQuery(filter);
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IFactsQuery {
        this.sort = { sort };
        return this;
    }

    withInclude(include: string[]): IFactsQuery {
        // NOTE: Unsupported include values handling is delegated to the backend
        this.include = include as EntitiesApiGetAllEntitiesFactsRequest["include"];
        return this;
    }

    withOrigin(origin: ObjectOrigin): IFactsQuery {
        this.origin = origin;
        return this;
    }

    query(): Promise<IFactsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaIncludeObj =
                    this.totalCount === undefined ? { metaInclude: ["page" as const] } : {};

                const items = await this.authCall((client) =>
                    client.entities.getAllEntitiesFacts({
                        ...this.requestParameters,
                        ...metaIncludeObj,
                        ...this.sort,
                        filter: this.filter,
                        include: this.include,
                        origin: this.origin,
                        size: limit,
                        page: offset / limit,
                    }),
                )
                    .then((res) => MetadataUtilities.filterValidEntities(res.data))
                    .then((data) => {
                        const totalCount = data.meta?.page?.totalElements;
                        if (!isNil(totalCount)) {
                            this.setTotalCount(totalCount);
                        }
                        return convertFactsWithLinks(data);
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
