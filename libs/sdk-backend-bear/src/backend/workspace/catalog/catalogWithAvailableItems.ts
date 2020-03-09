// (C) 2019 GoodData Corporation
import { IWorkspaceCatalogWithAvailableItems } from "@gooddata/sdk-backend-spi";
import {
    CatalogItem,
    ICatalogGroup,
    isCatalogAttribute,
    isCatalogFact,
    isCatalogMeasure,
    isCatalogDateDataset,
} from "@gooddata/sdk-model";

export class BearWorkspaceCatalogWithAvailableItems implements IWorkspaceCatalogWithAvailableItems {
    constructor(
        private readonly groups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        private readonly availableItems: CatalogItem[],
    ) {}

    public getGroups() {
        return this.groups;
    }

    public getItems() {
        return this.items;
    }

    public getAttributes() {
        return this.items.filter(isCatalogAttribute);
    }

    public getMeasures() {
        return this.items.filter(isCatalogMeasure);
    }

    public getFacts() {
        return this.items.filter(isCatalogFact);
    }

    public getDateDatasets() {
        return this.items.filter(isCatalogDateDataset);
    }

    public getAvailableItems() {
        return this.availableItems;
    }

    public getAvailableAttributes() {
        return this.availableItems.filter(isCatalogAttribute);
    }

    public getAvailableMeasures() {
        return this.availableItems.filter(isCatalogMeasure);
    }

    public getAvailableFacts() {
        return this.availableItems.filter(isCatalogFact);
    }

    public getAvailableDateDatasets() {
        return this.availableItems.filter(isCatalogDateDataset);
    }
}
