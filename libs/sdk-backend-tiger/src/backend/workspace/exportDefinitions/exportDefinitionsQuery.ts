// (C) 2024 GoodData Corporation

import {
    EntitiesApiGetAllEntitiesExportDefinitionsRequest,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import { IExportDefinitionsQuery, IExportDefinitionsQueryResult } from "@gooddata/sdk-backend-spi";
import isNil from "lodash/isNil.js";
import { exportDefinitionsOutListToExportDefinitions } from "../../../convertors/fromBackend/ExportDefinitionsConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class ExportDefinitionsQuery implements IExportDefinitionsQuery {
    private size = 50;
    private page = 0;
    private filter: { title?: string } = {};
    private sort = {};
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesExportDefinitionsRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IExportDefinitionsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IExportDefinitionsQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: { title?: string }): IExportDefinitionsQuery {
        this.filter = { ...filter };
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IExportDefinitionsQuery {
        this.sort = { sort };
        return this;
    }

    query(): Promise<IExportDefinitionsQueryResult> {
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
                    client.entities.getAllEntitiesExportDefinitions({
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
                        return exportDefinitionsOutListToExportDefinitions(data);
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
