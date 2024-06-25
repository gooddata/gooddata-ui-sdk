// (C) 2024 GoodData Corporation

import { ServerPaging } from "@gooddata/sdk-backend-base";
import { AutomationType, IAutomationsQuery, IAutomationsQueryResult } from "@gooddata/sdk-backend-spi";
import { EntitiesApiGetAllEntitiesAutomationsRequest, MetadataUtilities } from "@gooddata/api-client-tiger";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { convertAutomationListToAutomations } from "../../../convertors/fromBackend/AutomationConverter.js";
import isNil from "lodash/isNil.js";

export class AutomationsQuery implements IAutomationsQuery {
    private size = 50;
    private page = 0;
    private filter: { title?: string } = {};
    private sort = {};
    private type: AutomationType | undefined = undefined;
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesAutomationsRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IAutomationsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IAutomationsQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: { title?: string }): IAutomationsQuery {
        this.filter = { ...filter };
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IAutomationsQuery {
        this.sort = { sort };
        return this;
    }

    withType(type: AutomationType): IAutomationsQuery {
        this.type = type;
        return this;
    }

    query(): Promise<IAutomationsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaIncludeObj =
                    this.totalCount === undefined ? { metaInclude: ["page" as const] } : {};

                const filterObj = this.constructFilter();

                const items = await this.authCall((client) =>
                    client.entities.getAllEntitiesAutomations({
                        ...this.requestParameters,
                        ...metaIncludeObj,
                        ...filterObj,
                        ...this.sort,
                        include: ["createdBy", "modifiedBy"],
                        size: limit,
                        page: offset / limit,
                    }),
                )
                    .then((res) => MetadataUtilities.filterValidEntities(res.data))
                    .then((data) => {
                        const totalCount = data.meta?.page?.totalElements;
                        !isNil(totalCount) && this.setTotalCount(totalCount);
                        return convertAutomationListToAutomations(data);
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }

    private constructFilter = () => {
        const allFilters = [];

        if (this.filter.title) {
            allFilters.push(`title=containsic=${this.filter.title}`); // contains + ignore case
        }

        if (this.type) {
            allFilters.push(`${this.type}=isnull=false`);
        }

        return allFilters ? { filter: allFilters.join(";") } : {};
    };
}
