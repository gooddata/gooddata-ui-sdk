// (C) 2021-2024 GoodData Corporation

import { IDataSourcesService } from "@gooddata/sdk-backend-spi";
import { IDataSourceIdentifierDescriptor } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { ActionsUtilities, JsonApiDataSourceIdentifierOutWithLinks } from "@gooddata/api-client-tiger";

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
                client.entities
                    .getAllEntitiesDataSourceIdentifiers({ page, size })
                    .then((response) => response.data.data.map(convertdataSourceIdentifier)),
            );
        });
    }
}
