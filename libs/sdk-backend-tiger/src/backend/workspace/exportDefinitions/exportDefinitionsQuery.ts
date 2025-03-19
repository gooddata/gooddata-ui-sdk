// (C) 2024 GoodData Corporation

import {
    EntitiesApiGetAllEntitiesExportDefinitionsRequest,
    MetadataUtilities,
} from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    ExportDefinitionQuerySort,
    ExportDefinitionQuerySortDirection,
    ExportDefinitionQuerySortProperty,
    IExportDefinitionsQuery,
    IExportDefinitionsQueryResult,
} from "@gooddata/sdk-backend-spi";
import isNil from "lodash/isNil.js";
import { convertExportDefinitionMdObject } from "../../../convertors/fromBackend/ExportDefinitionsConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { invariant } from "ts-invariant";

export class ExportDefinitionsQuery implements IExportDefinitionsQuery {
    private size = 50;
    private page = 0;
    private filter: { title?: string } = {};
    private sort = {};
    private allowedSortProperties: ExportDefinitionQuerySortProperty[] = ["title", "id"];
    private allowedSortDirections: ExportDefinitionQuerySortDirection[] = ["asc", "desc"];
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesExportDefinitionsRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    private isValidSortItem = (sortItem = ""): sortItem is ExportDefinitionQuerySort => {
        const [sortProp, optionalSortDirection, ...rest] = sortItem.split(",");

        if (rest.length > 0) {
            return false; // valid sort is either just the property or property,direction
        }
        if (!this.allowedSortProperties.includes(sortProp as ExportDefinitionQuerySortProperty)) {
            return false; // invalid sort property check
        }
        return !(
            optionalSortDirection &&
            !this.allowedSortDirections.includes(optionalSortDirection as ExportDefinitionQuerySortDirection)
        ); // invalid sort direction check
    };

    private validateQuerySort = (sort: ExportDefinitionQuerySort[]) => {
        const isValidSort = sort.every(this.isValidSortItem);

        invariant(
            isValidSort,
            `Invalid sort format. Use 'property' or 'property,direction' format. Allowed properties: ${this.allowedSortProperties.join(
                ", ",
            )}. Allowed directions: ${this.allowedSortDirections.join(", ")}.`,
        );
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

    withSorting(sort: ExportDefinitionQuerySort[]): IExportDefinitionsQuery {
        this.validateQuerySort(sort);
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
                        return data.data.map((ed) => convertExportDefinitionMdObject(ed, data.included));
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
