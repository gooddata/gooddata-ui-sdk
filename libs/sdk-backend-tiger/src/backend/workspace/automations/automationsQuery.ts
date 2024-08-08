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
    private all = false;
    private author: string | null = null;
    private dashboard: string | null = null;
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

    withAll(): IAutomationsQuery {
        this.all = true;
        return this;
    }

    withSize(size: number): IAutomationsQuery {
        this.all = false;
        this.size = size;
        return this;
    }

    withPage(page: number): IAutomationsQuery {
        this.all = false;
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

    withAuthor(author: string): IAutomationsQuery {
        this.author = author;
        return this;
    }

    withDashboard(dashboard: string): IAutomationsQuery {
        this.dashboard = dashboard;
        return this;
    }

    query(): Promise<IAutomationsQueryResult> {
        const all = this.all;
        const size = all ? Number.MAX_SAFE_INTEGER : this.size;
        const offset = all ? 0 : this.page * this.size;

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
                        include: [
                            "createdBy",
                            "modifiedBy",
                            "notificationChannel",
                            "recipients",
                            "exportDefinitions",
                            "analyticalDashboard",
                        ],
                        origin: "NATIVE", // ensures that no inherited automations are returned
                        // size and page are not needed when we want to get all automations
                        ...(all ? {} : { size: limit, page: offset / limit }),
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
            size,
            offset,
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

        if (this.author) {
            allFilters.push(`createdBy.id=='${this.author}'`);
        }

        if (this.dashboard) {
            allFilters.push(`analyticalDashboard.id=='${this.dashboard}'`);
        }

        return allFilters.length > 0 ? { filter: allFilters.join(";") } : {};
    };
}
