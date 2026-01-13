// (C) 2021-2026 GoodData Corporation

import { ActionsApi_ResolveAllEntitlements } from "@gooddata/api-client-tiger/endpoints/actions";
import { ProfileApi_GetCurrent } from "@gooddata/api-client-tiger/endpoints/profile";
import { type IEntitlements } from "@gooddata/sdk-backend-spi";
import { type IEntitlementDescriptor } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

export class TigerEntitlements implements IEntitlements {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async resolveEntitlements(): Promise<IEntitlementDescriptor[]> {
        const profile = await this.authCall((client) => ProfileApi_GetCurrent(client.axios));
        return (
            profile.entitlements ??
            (
                await this.authCall((client) =>
                    ActionsApi_ResolveAllEntitlements(client.axios, client.basePath),
                )
            ).data
        );
    }
}
