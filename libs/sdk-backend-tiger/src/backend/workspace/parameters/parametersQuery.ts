// (C) 2026 GoodData Corporation

import {
    type EntitiesApiGetAllEntitiesParametersRequest,
    EntitiesApi_GetAllEntitiesParameters,
    EntitiesApi_SearchEntitiesParameters,
    type JsonApiParameterOutList,
    type JsonApiParameterOutWithLinks,
} from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    type IFilterBaseOptions,
    type IParametersQuery,
    type IParametersQueryResult,
    type QueryMethod,
} from "@gooddata/sdk-backend-spi";
import type { ObjectOrigin } from "@gooddata/sdk-model";

import { convertParameterFromBackend } from "../../../convertors/fromBackend/ParameterConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { buildFilterQuery } from "../../common/filtering.js";
import { buildSortQuery } from "../../common/sorting.js";

export class ParametersQuery implements IParametersQuery {
    private size = 50;
    private page = 0;
    private filter: IFilterBaseOptions | undefined = undefined;
    private sort: string[] | undefined = undefined;
    private include: EntitiesApiGetAllEntitiesParametersRequest["include"] = undefined;
    private origin: ObjectOrigin | undefined = undefined;
    private method: QueryMethod = "GET";
    private totalCount: number | undefined = undefined;

    constructor(
        public readonly authCall: TigerAuthenticatedCallGuard,
        private requestParameters: EntitiesApiGetAllEntitiesParametersRequest,
    ) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): IParametersQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): IParametersQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: IFilterBaseOptions): IParametersQuery {
        this.filter = filter;
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): IParametersQuery {
        this.sort = sort;
        return this;
    }

    withInclude(include: string[]): IParametersQuery {
        this.include = include as EntitiesApiGetAllEntitiesParametersRequest["include"];
        return this;
    }

    withOrigin(origin: ObjectOrigin): IParametersQuery {
        this.origin = origin;
        return this;
    }

    withMethod(method: QueryMethod): IParametersQuery {
        this.method = method;
        return this;
    }

    query(): Promise<IParametersQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const filter: IFilterBaseOptions = { ...(this.filter ?? {}) };

                // Parameters API doesn't support `isHidden` filter yet.
                // When filtering for hidden parameters, return empty results since no parameters can be hidden.
                if ("isHidden" in filter) {
                    if (filter.isHidden === true) {
                        return { items: [], totalCount: 0 };
                    }
                    delete filter.isHidden;
                }

                // Parameters API doesn't support `certification` filter yet.
                // When filtering for certified parameters, return empty results since no parameters can be certified.
                if ("certification" in filter) {
                    if (filter.certification) {
                        return { items: [], totalCount: 0 };
                    }
                    delete filter.certification;
                }

                const filterQuery = buildFilterQuery(filter);
                const metaInclude: EntitiesApiGetAllEntitiesParametersRequest["metaInclude"] =
                    this.totalCount === undefined ? (["page"] as const) : undefined;

                const items = await this.authCall((client) => {
                    if (this.method === "POST") {
                        return EntitiesApi_SearchEntitiesParameters(client.axios, client.basePath, {
                            workspaceId: this.requestParameters.workspaceId,
                            origin: this.origin,
                            entitySearchBody: {
                                sort: buildSortQuery(this.sort),
                                filter: filterQuery,
                                include: this.include,
                                metaInclude,
                                page: {
                                    index: offset / limit,
                                    size: limit,
                                },
                            },
                        });
                    }

                    return EntitiesApi_GetAllEntitiesParameters(client.axios, client.basePath, {
                        ...this.requestParameters,
                        sort: this.sort,
                        filter: filterQuery,
                        include: this.include,
                        metaInclude,
                        origin: this.origin,
                        size: limit,
                        page: offset / limit,
                    });
                })
                    .then((res) => res.data as JsonApiParameterOutList)
                    .then((data) => {
                        const totalCount = data.meta?.page?.totalElements;
                        if (!(totalCount === null || totalCount === undefined)) {
                            this.setTotalCount(totalCount);
                        }
                        return data.data.map((parameter: JsonApiParameterOutWithLinks) =>
                            convertParameterFromBackend(parameter),
                        );
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }
}
