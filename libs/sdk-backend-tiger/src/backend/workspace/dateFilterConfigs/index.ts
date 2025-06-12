// (C) 2019-2024 GoodData Corporation
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import { IDateFilterConfigsQuery, IDateFilterConfigsQueryResult } from "@gooddata/sdk-backend-spi";
import { invariant } from "ts-invariant";

import { TigerAuthenticatedCallGuard } from "../../../types/index.js";
import {
    DefaultDateFilterConfig,
    convertDateFilterConfig,
    IWrappedDateFilterConfig,
} from "../../../convertors/fromBackend/DateFilterConfigurationConverter.js";

export class TigerWorkspaceDateFilterConfigsQuery implements IDateFilterConfigsQuery {
    private limit: number | undefined;
    private offset: number | undefined;

    constructor(private readonly authCall: TigerAuthenticatedCallGuard, private readonly workspace: string) {}

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
        return new InMemoryPaging([DefaultDateFilterConfig], this.limit, this.offset);
    }

    public async queryCustomDateFilterConfig(): Promise<IDateFilterConfigsQueryResult> {
        const { data } = await this.authCall((sdk) =>
            sdk.actions.workspaceResolveSettings({
                workspaceId: this.workspace,
                resolveSettingsRequest: { settings: ["DATE_FILTER_CONFIG"] },
            }),
        );

        const customDateFilterConfig = data[0].content as any;

        const dateFilterConfig = convertDateFilterConfig(
            customDateFilterConfig.config as IWrappedDateFilterConfig,
        );

        return new InMemoryPaging([dateFilterConfig], this.limit, this.offset);
    }
}
