// (C) 2019-2025 GoodData Corporation
import { invariant } from "ts-invariant";

import { ActionsApi_WorkspaceResolveSettings } from "@gooddata/api-client-tiger/actions";
import { InMemoryPaging } from "@gooddata/sdk-backend-base";
import { type IDateFilterConfigsQuery, type IDateFilterConfigsQueryResult } from "@gooddata/sdk-backend-spi";

import {
    DefaultDateFilterConfig,
    type IWrappedDateFilterConfig,
    convertDateFilterConfig,
} from "../../../convertors/fromBackend/DateFilterConfigurationConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class TigerWorkspaceDateFilterConfigsQuery implements IDateFilterConfigsQuery {
    private limit: number | undefined;
    private offset: number | undefined;

    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
    ) {}

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
            ActionsApi_WorkspaceResolveSettings(sdk.axios, sdk.basePath, {
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
