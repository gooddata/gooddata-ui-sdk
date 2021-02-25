// (C) 2021 GoodData Corporation
import flatMap from "lodash/flatMap";
import { IAnalyticalBackend, ICatalogAttribute, ICatalogDateAttribute } from "@gooddata/sdk-backend-spi";
import { dataLoaderAbstractFactory } from "./DataLoaderAbstractFactory";

interface IAttributesWithDrillDownDataLoader {
    /**
     * Obtains all catalog attributes with a drill down specified.
     * @param backend - the {@link IAnalyticalBackend} instance to use to communicate with the backend
     */
    getAttributesWithDrillDown(
        backend: IAnalyticalBackend,
    ): Promise<Array<ICatalogAttribute | ICatalogDateAttribute>>;
}

class AttributesWithDrillDownDataLoader implements IAttributesWithDrillDownDataLoader {
    private cachedAttributesWithDrillDown:
        | Promise<Array<ICatalogAttribute | ICatalogDateAttribute>>
        | undefined;

    constructor(protected readonly workspace: string) {}

    public getAttributesWithDrillDown(
        backend: IAnalyticalBackend,
    ): Promise<Array<ICatalogAttribute | ICatalogDateAttribute>> {
        if (!this.cachedAttributesWithDrillDown) {
            this.cachedAttributesWithDrillDown = backend
                .workspace(this.workspace)
                .catalog()
                .forTypes(["attribute", "dateDataset"])
                .load()
                .then((catalog) => {
                    const attributes = catalog.attributes();
                    const dateAttributes = flatMap(catalog.dateDatasets(), (dd) => dd.dateAttributes);
                    return [...attributes, ...dateAttributes].filter((attr) => attr.attribute.drillDownStep);
                })
                .catch((error) => {
                    this.cachedAttributesWithDrillDown = undefined;
                    throw error;
                });
        }

        return this.cachedAttributesWithDrillDown;
    }
}

/**
 * @internal
 */
export const attributesWithDrillDownDataLoaderFactory = dataLoaderAbstractFactory<
    IAttributesWithDrillDownDataLoader
>((workspace) => new AttributesWithDrillDownDataLoader(workspace));
