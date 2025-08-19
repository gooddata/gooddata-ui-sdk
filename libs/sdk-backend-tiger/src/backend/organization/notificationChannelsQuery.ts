// (C) 2024-2025 GoodData Corporation

import isNil from "lodash/isNil.js";

import { MetadataUtilities } from "@gooddata/api-client-tiger";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import {
    INotificationChannelIdentifiersQueryResult,
    INotificationChannelsQuery,
    INotificationChannelsQueryResult,
} from "@gooddata/sdk-backend-spi";
import {
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    NotificationChannelDestinationType,
} from "@gooddata/sdk-model";

import {
    convertNotificationChannelFromBackend,
    convertNotificationChannelIdentifierFromBackend,
} from "../../convertors/fromBackend/NotificationChannelsConvertor.js";
import { convertNotificationChannelTypesToBackend } from "../../convertors/toBackend/NotificationChannelsConvertor.js";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";

export class NotificationChannelsQuery implements INotificationChannelsQuery {
    private size = 100;
    private page = 0;
    private filter: { title?: string } = {};
    private sort = {};
    private types: NotificationChannelDestinationType[] = [];
    private totalCount: number | undefined = undefined;

    constructor(public readonly authCall: TigerAuthenticatedCallGuard) {}

    private setTotalCount = (value?: number) => {
        this.totalCount = value;
    };

    withSize(size: number): INotificationChannelsQuery {
        this.size = size;
        return this;
    }

    withPage(page: number): INotificationChannelsQuery {
        this.page = page;
        return this;
    }

    withFilter(filter: { title?: string }): INotificationChannelsQuery {
        this.filter = { ...filter };
        // We need to reset total count whenever filter changes
        this.setTotalCount(undefined);
        return this;
    }

    withSorting(sort: string[]): INotificationChannelsQuery {
        this.sort = { sort };
        return this;
    }

    withTypes(types: NotificationChannelDestinationType[]): INotificationChannelsQuery {
        this.types = types;
        return this;
    }

    query(): Promise<INotificationChannelsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaIncludeObj =
                    this.totalCount === undefined ? { metaInclude: ["page" as const] } : {};

                const filterObj = this.constructFilter();

                const items = await this.authCall((client) =>
                    client.entities.getAllEntitiesNotificationChannels({
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
                        if (!isNil(totalCount)) {
                            this.setTotalCount(totalCount);
                        }
                        return data.data.flatMap((channel) => {
                            const convertedChannel = convertNotificationChannelFromBackend(channel);
                            if (convertedChannel) {
                                return [convertedChannel];
                            }
                            return [];
                        });
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }

    async queryAll(): Promise<INotificationChannelMetadataObject[]> {
        const firstQuery = await this.query();
        return firstQuery.all();
    }

    queryIdentifiers(): Promise<INotificationChannelIdentifiersQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                /**
                 * For backend performance reasons, we do not want to ask for paging info each time.
                 */
                const metaIncludeObj =
                    this.totalCount === undefined ? { metaInclude: ["page" as const] } : {};

                const filterObj = this.constructFilter();

                const items = await this.authCall((client) =>
                    client.entities.getAllEntitiesNotificationChannelIdentifiers({
                        ...metaIncludeObj,
                        ...filterObj,
                        ...this.sort,
                        size: limit,
                        page: offset / limit,
                    }),
                )
                    .then((res) => res.data)
                    .then((data) => {
                        const totalCount = data.meta?.page?.totalElements;
                        if (!isNil(totalCount)) {
                            this.setTotalCount(totalCount);
                        }
                        return data.data.flatMap((channel) => {
                            const converted = convertNotificationChannelIdentifierFromBackend(channel);
                            return converted ? [converted] : [];
                        });
                    });

                return { items, totalCount: this.totalCount! };
            },
            this.size,
            this.page * this.size,
        );
    }

    async queryAllIdentifiers(): Promise<INotificationChannelIdentifier[]> {
        const firstQuery = await this.queryIdentifiers();
        return firstQuery.all();
    }

    private constructFilter = () => {
        const andFilters: string[] = [];
        const orFilters: string[] = [];

        if (this.filter.title) {
            andFilters.push(`title=containsic=${this.filter.title}`); // contains + ignore case
        }

        if (this.types.length > 0) {
            const convertedTypes = convertNotificationChannelTypesToBackend(this.types);
            convertedTypes.forEach((type) => {
                orFilters.push(`destinationType==${type}`);
            });
        }

        const allFilters = [...andFilters, ...orFilters];
        const allFiltersString = andFilters.length > 0 ? `(${andFilters.join(" and ")})` : "";
        const orFiltersString = orFilters.length > 0 ? `(${orFilters.join(" or ")})` : "";

        return allFilters.length > 0
            ? { filter: [allFiltersString, orFiltersString].filter(Boolean).join(";") }
            : {};
    };
}
