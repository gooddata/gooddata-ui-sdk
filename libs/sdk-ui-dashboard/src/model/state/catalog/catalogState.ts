// (C) 2021 GoodData Corporation
import {
    ICatalogMeasure,
    ICatalogAttribute,
    ICatalogDateDataset,
    ICatalogFact,
} from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export interface CatalogState {
    attributes?: ICatalogAttribute[];
    measures?: ICatalogMeasure[];
    dateDatasets?: ICatalogDateDataset[];
    facts?: ICatalogFact[];
}

export const catalogInitialState: CatalogState = {
    attributes: undefined,
    measures: undefined,
    dateDatasets: undefined,
    facts: undefined,
};
