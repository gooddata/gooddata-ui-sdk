// (C) 2021-2025 GoodData Corporation

import { ActionsUtilities, JsonApiDataSourceIdentifierOutWithLinks } from "@gooddata/api-client-tiger";
import { EntitiesApi_GetAllEntitiesDataSourceIdentifiers } from "@gooddata/api-client-tiger/entitiesObjects";
import { IDataSourcesService } from "@gooddata/sdk-backend-spi";
import { IDataSourceIdentifierDescriptor } from "@gooddata/sdk-model";

import { TigerAuthenticatedCallGuard } from "../../types/index.js";

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
