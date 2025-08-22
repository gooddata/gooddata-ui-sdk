// (C) 2024-2025 GoodData Corporation

import isNil from "lodash/isNil.js";

import {
    EntitiesApiGetAllEntitiesVisualizationObjectsRequest,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import { IInsightsQuery, IInsightsQueryResult } from "@gooddata/sdk-backend-spi";

import { convertVisualizationObjectsToInsights } from "../../../convertors/fromBackend/InsightConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class InsightsQuery implements IInsightsQuery {
    private size = 50;
    private page = 0;
    private filter: string | undefined = undefined;
    private sort = {};
    private include: EntitiesApiGetAllEntitiesVisualizationObjectsRequest["include"] = undefined;
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesVisualizationObjectsRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IInsightsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IInsightsQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: { title?: string; createdBy?: string; tags?: string[] }): IInsightsQuery {
        // containsic === contains + ignore case
        const filters: string[] = [];
        if (filter.title) {
            filters.push(`title=containsic="${filter.title}"`);
        }
        if (filter.createdBy) {
            filters.push(`createdBy.id=containsic="${filter.createdBy}"`);
        }
        if (filter.tags) {
            filters.push(`tags=containsic="${filter.tags.join(",")}"`);
        }
        if (filters.length > 0) {
            this.filter = filters.join(";");
        }
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IInsightsQuery {
        this.sort = { sort };
        return this;
    }

    withInclude(include: string[]): IInsightsQuery {
        // NOTE: Unsupported include values handling is delegated to the backend
        this.include = include as EntitiesApiGetAllEntitiesVisualizationObjectsRequest["include"];
        return this;
    }

    query(): Promise<IInsightsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaIncludeObj =
                    this.totalCount === undefined ? { metaInclude: ["page" as const] } : {};

                const items = await this.authCall((client) =>
                    client.entities.getAllEntitiesVisualizationObjects({
                        ...this.requestParameters,
                        ...metaIncludeObj,
                        ...this.sort,
                        filter: this.filter,
                        include: this.include,
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
                        return convertVisualizationObjectsToInsights(data);
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
