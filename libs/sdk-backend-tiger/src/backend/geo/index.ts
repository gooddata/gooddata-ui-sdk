// (C) 2025-2026 GoodData Corporation

import { LocationStyleApi_GetDefaultStyle } from "@gooddata/api-client-tiger/endpoints/locationStyle";
import {
    type IGeoService,
    type IGeoStyleParams,
    type IGeoStyleSpecification,
    type IOrganizationGeoCollectionsService,
} from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { OrganizationGeoCollectionsService } from "../organization/geoCollections.js";

export class TigerGeoService implements IGeoService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getDefaultStyle(params?: IGeoStyleParams): Promise<IGeoStyleSpecification> {
        return this.authCall(async (client) => LocationStyleApi_GetDefaultStyle(client.axios, params));
    }

    public collections(): IOrganizationGeoCollectionsService {
        return new OrganizationGeoCollectionsService(this.authCall);
    }
}
