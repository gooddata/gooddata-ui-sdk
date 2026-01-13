// (C) 2021-2026 GoodData Corporation

import { ActionsUtilities, type JsonApiDataSourceIdentifierOutWithLinks } from "@gooddata/api-client-tiger";
import { EntitiesApi_GetAllEntitiesDataSourceIdentifiers } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { type IDataSourcesService } from "@gooddata/sdk-backend-spi";
import { type IDataSourceIdentifierDescriptor } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

function convertdataSourceIdentifier(
    dataSource: JsonApiDataSourceIdentifierOutWithLinks,
): IDataSourceIdentifierDescriptor {
    return {
        id: dataSource.id,
        name: dataSource.attributes.name,
        schema: dataSource.attributes.schema,
        type: dataSource.attributes.type,
    };
}

export class TigerDataSourcesService implements IDataSourcesService {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard) {}

    public async getDataSourceIdentifiers(): Promise<IDataSourceIdentifierDescriptor[]> {
        return this.authCall(async (client) => {
            return ActionsUtilities.loadAllPages(({ page, size }) =>
                EntitiesApi_GetAllEntitiesDataSourceIdentifiers(client.axios, client.basePath, {
                    page,
                    size,
                }).then((response) => response.data.data.map(convertdataSourceIdentifier)),
            );
        });
    }
}
