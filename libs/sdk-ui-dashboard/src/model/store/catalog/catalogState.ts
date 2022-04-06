// (C) 2021-2022 GoodData Corporation
import { ICatalogAttribute, ICatalogFact, ICatalogMeasure, ICatalogDateDataset } from "@gooddata/sdk-model";

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
