// (C) 2019-2020 GoodData Corporation
import { IWorkspaceCatalogWithAvailableItems } from "@gooddata/sdk-backend-spi";
import {
    CatalogItem,
    ICatalogGroup,
    isCatalogAttribute,
    isCatalogFact,
    isCatalogMeasure,
    isCatalogDateDataset,
    ICatalogAttribute,
    ICatalogMeasure,
    ICatalogFact,
    ICatalogDateDataset,
} from "@gooddata/sdk-model";

export class TigerWorkspaceCatalogWithAvailableItems implements IWorkspaceCatalogWithAvailableItems {
    constructor(
        private readonly groups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        private readonly availableItems: CatalogItem[],
    ) {}

    public getGroups(): ICatalogGroup[] {
        return this.groups;
    }

    public getItems(): CatalogItem[] {
        return this.items;
    }

    public getAttributes(): ICatalogAttribute[] {
        return this.items.filter(isCatalogAttribute);
    }

    public getMeasures(): ICatalogMeasure[] {
        return this.items.filter(isCatalogMeasure);
    }

    public getFacts(): ICatalogFact[] {
        return this.items.filter(isCatalogFact);
    }

    public getDateDatasets(): ICatalogDateDataset[] {
        return this.items.filter(isCatalogDateDataset);
    }

    public getAvailableItems(): CatalogItem[] {
        return this.availableItems;
    }

    public getAvailableAttributes(): ICatalogAttribute[] {
        return this.availableItems.filter(isCatalogAttribute);
    }

    public getAvailableMeasures(): ICatalogMeasure[] {
        return this.availableItems.filter(isCatalogMeasure);
    }

    public getAvailableFacts(): ICatalogFact[] {
        return this.availableItems.filter(isCatalogFact);
    }

    public getAvailableDateDatasets(): ICatalogDateDataset[] {
        return this.availableItems.filter(isCatalogDateDataset);
    }
}
