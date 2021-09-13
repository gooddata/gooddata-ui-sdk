// (C) 2019-2021 GoodData Corporation
import { IDateFilterConfigsQuery, IDateFilterConfigsQueryResult } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import { GdcExtendedDateFilters } from "@gooddata/api-model-bear";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { convertDateFilterConfig } from "../../../convertors/fromBackend/DateFilterConfigConverter";
import { enhanceWithAll } from "@gooddata/sdk-backend-base";

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
        return this.queryWorker(this.offset, this.limit);
    }

    private async queryWorker(
        offset: number | undefined = 0,
        limit: number | undefined,
    ): Promise<IDateFilterConfigsQueryResult> {
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
            paging: { totalCount, offset: serverOffset, count },
        } = data;

        const hasNextPage = serverOffset + count < totalCount!;
        const goTo = (index: number) =>
            index * count < totalCount!
                ? this.queryWorker(index * count, limit)
                : Promise.resolve(emptyResult);

        const emptyResult: IDateFilterConfigsQueryResult = enhanceWithAll({
            items: [],
            limit: count,
            offset: totalCount!,
            totalCount: totalCount!,
            next: () => Promise.resolve(emptyResult),
            goTo,
        });

        return enhanceWithAll({
            items: items.map(convertDateFilterConfig),
            limit: count,
            offset: serverOffset,
            totalCount: totalCount!,
            next: hasNextPage
                ? () => this.queryWorker(offset + count, limit)
                : () => Promise.resolve(emptyResult),
            goTo,
        });
    }
}
