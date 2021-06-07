// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceCatalogWithAvailableItems,
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
} from "@gooddata/sdk-backend-spi";

export class TigerWorkspaceCatalogWithAvailableItems implements IWorkspaceCatalogWithAvailableItems {
    constructor(
        private readonly catalogGroups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        private readonly availableItems: CatalogItem[],
    ) {}

    public groups(): ICatalogGroup[] {
        return this.catalogGroups;
    }

    public allItems(): CatalogItem[] {
        return this.items;
    }

    public attributes(): ICatalogAttribute[] {
        return this.items.filter(isCatalogAttribute);
    }

    public measures(): ICatalogMeasure[] {
        return this.items.filter(isCatalogMeasure);
    }

    public facts(): ICatalogFact[] {
        return this.items.filter(isCatalogFact);
    }

    public dateDatasets(): ICatalogDateDataset[] {
        return this.items.filter(isCatalogDateDataset);
    }

    public allAvailableItems(): CatalogItem[] {
        return this.availableItems;
    }

    public availableAttributes(): ICatalogAttribute[] {
        return this.availableItems.filter(isCatalogAttribute);
    }

    public availableMeasures(): ICatalogMeasure[] {
        return this.availableItems.filter(isCatalogMeasure);
    }

    public availableFacts(): ICatalogFact[] {
        return this.availableItems.filter(isCatalogFact);
    }

    public availableDateDatasets(): ICatalogDateDataset[] {
        return this.availableItems.filter(isCatalogDateDataset);
    }
}
