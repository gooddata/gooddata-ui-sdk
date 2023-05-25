// (C) 2019-2021 GoodData Corporation
import { IDateFilterConfigsQuery, IDateFilterConfigsQueryResult } from "@gooddata/sdk-backend-spi";
import { invariant } from "ts-invariant";
import { GdcExtendedDateFilters } from "@gooddata/api-model-bear";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { convertDateFilterConfig } from "../../../convertors/fromBackend/DateFilterConfigConverter.js";
import { ServerPaging } from "@gooddata/sdk-backend-base";

export class BearWorkspaceDateFilterConfigsQuery implements IDateFilterConfigsQuery {
    private limit: number | undefined;
    private offset: number | undefined;

    constructor(private readonly authCall: BearAuthenticatedCallGuard, private readonly workspace: string) {}

    public withLimit(limit: number): IDateFilterConfigsQuery {
        invariant(limit > 0, `limit must be a positive number, got: ${limit}`);

        this.limit = limit;

        return this;
    }

    public withOffset(offset: number): IDateFilterConfigsQuery {
        this.offset = offset;
        return this;
    }

    public async query(): Promise<IDateFilterConfigsQueryResult> {
        return this.queryWorker();
    }

    private async queryWorker(): Promise<IDateFilterConfigsQueryResult> {
        return ServerPaging.for(
            async ({ limit, offset }) => {
                const data = await this.authCall((sdk) =>
                    sdk.md.getObjectsByQueryWithPaging<GdcExtendedDateFilters.IWrappedDateFilterConfig>(
                        this.workspace,
                        {
                            offset,
                            limit,
                            category: "dateFilterConfig",
                            getTotalCount: true,
                        },
                    ),
                );

                const {
                    items,
                    paging: { totalCount },
                } = data;

                return {
                    items: items.map(convertDateFilterConfig),
                    totalCount: totalCount!,
                };
            },
            this.limit,
            this.offset,
        );
    }
}
