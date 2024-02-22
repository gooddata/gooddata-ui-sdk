// (C) 2021-2024 GoodData Corporation
import { IDataSourceIdentifierDescriptor } from "@gooddata/sdk-model";
/**
 * Service to work with data sources
 *
 * @alpha
 */
export interface IDataSourcesService {
    /**
     * Returns data source identifiers
     */
    getDataSourceIdentifiers(): Promise<IDataSourceIdentifierDescriptor[]>;
}
