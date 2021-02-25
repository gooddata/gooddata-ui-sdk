// (C) 2021 GoodData Corporation
import { IAnalyticalBackend, ICatalogDateDataset } from "@gooddata/sdk-backend-spi";

import { dataLoaderAbstractFactory } from "./DataLoaderAbstractFactory";

interface IDateDatasetsDataLoader {
    /**
     * Obtains all catalog attributes with a drill down specified.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     */
    getDateDatasets(backend: IAnalyticalBackend): Promise<ICatalogDateDataset[]>;
}

class DateDatasetsDataLoader implements IDateDatasetsDataLoader {
    private cachedDateDatasets: Promise<ICatalogDateDataset[]> | undefined;

    constructor(protected readonly workspace: string) {}

    public getDateDatasets(backend: IAnalyticalBackend): Promise<ICatalogDateDataset[]> {
        if (!this.cachedDateDatasets) {
            this.cachedDateDatasets = backend
                .workspace(this.workspace)
                .catalog()
                .forTypes(["dateDataset"])
                .load()
                .then((catalog) => catalog.dateDatasets())
                .catch((error) => {
                    this.cachedDateDatasets = undefined;
                    throw error;
                });
        }

        return this.cachedDateDatasets;
    }
}

/**
 * @internal
 */
export const dateDatasetsDataLoaderFactory = dataLoaderAbstractFactory<IDateDatasetsDataLoader>(
    (workspace) => new DateDatasetsDataLoader(workspace),
);
