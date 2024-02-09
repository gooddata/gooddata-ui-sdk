// (C) 2021-2024 GoodData Corporation

import { IDataSourcesService } from "@gooddata/sdk-backend-spi";
import { IDataSourceIdentifierDescriptor } from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../types/index.js";
import { JsonApiDataSourceIdentifierOutWithLinks } from "@gooddata/api-client-tiger";

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
            return loadAllPages(({ page, size }) =>
                client.entities
                    .getAllEntitiesDataSourceIdentifiers({ page, size })
                    .then((response) => response.data.data.map(convertdataSourceIdentifier)),
            );
        });
    }
}

async function loadAllPages<T>(
    promiseFactory: (params: { page: number; size: number }) => Promise<T[]>,
): Promise<T[]> {
    const results: T[] = [];
    const size = 1000;
    let page = 0;
    let lastPageSize = size;
    while (lastPageSize === size) {
        const result = await promiseFactory({
            page,
            size,
        });
        results.push(...result);
        lastPageSize = result.length;
        page++;
    }

    return results;
}
