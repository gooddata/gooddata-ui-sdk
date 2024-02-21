// (C) 2024 GoodData Corporation

import { ServerPaging } from "@gooddata/sdk-backend-base";
import { IInsightsQuery, IInsightsQueryResult } from "@gooddata/sdk-backend-spi";
import {
    EntitiesApiGetAllEntitiesVisualizationObjectsRequest,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { convertVisualizationObjectsToInsights } from "../../../convertors/fromBackend/InsightConverter.js";
import isNil from "lodash/isNil.js";

export class InsightsQuery implements IInsightsQuery {
    private size = 50;
    private page = 0;
    private filter: { title?: string } = {};
    private sort = {};
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

    withFilter(filter: { title?: string }): IInsightsQuery {
        this.filter = { ...filter };
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IInsightsQuery {
        this.sort = { sort };
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

                const filterObj = this.filter.title
                    ? { filter: `title=containsic=${this.filter.title}` } // contains + ignore case
                    : {};

                const items = await this.authCall((client) =>
                    client.entities.getAllEntitiesVisualizationObjects({
                        ...this.requestParameters,
                        ...metaIncludeObj,
                        ...filterObj,
                        ...this.sort,
                        size: limit,
                        page: offset / limit,
                    }),
                )
                    .then((res) => MetadataUtilities.filterValidEntities(res.data))
                    .then((data) => {
                        const totalCount = data.meta?.page?.totalElements;
                        !isNil(totalCount) && this.setTotalCount(totalCount);
                        return convertVisualizationObjectsToInsights(data);
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
