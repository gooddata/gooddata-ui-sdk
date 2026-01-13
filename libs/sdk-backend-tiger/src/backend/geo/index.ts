// (C) 2025-2026 GoodData Corporation

import { LocationStyleApi_GetDefaultStyle } from "@gooddata/api-client-tiger/endpoints/locationStyle";
import { type IGeoService, type IGeoStyleSpecification } from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

export class TigerGeoService implements IGeoService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getDefaultStyle(): Promise<IGeoStyleSpecification> {
        return this.authCall(async (client) => LocationStyleApi_GetDefaultStyle(client.axios));
    }
}
