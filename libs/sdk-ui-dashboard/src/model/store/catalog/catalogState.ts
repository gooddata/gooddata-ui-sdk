// (C) 2021-2023 GoodData Corporation
import { ICatalogAttribute, ICatalogFact, ICatalogMeasure, ICatalogDateDataset } from "@gooddata/sdk-model";

/**
 * @public
 */
export interface CatalogState {
    /** @beta */
    attributes?: ICatalogAttribute[];
    /** @beta */
    measures?: ICatalogMeasure[];
    /** @beta */
    dateDatasets?: ICatalogDateDataset[];
    /** @beta */
    facts?: ICatalogFact[];
}

export const catalogInitialState: CatalogState = {
    attributes: undefined,
    measures: undefined,
    dateDatasets: undefined,
    facts: undefined,
};
