// (C) 2019-2022 GoodData Corporation
import { invariant } from "ts-invariant";
import {
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceCatalogWithAvailableItems,
} from "@gooddata/sdk-backend-spi";
import {
    CatalogItem,
    ICatalogGroup,
    ICatalogAttribute,
    ICatalogFact,
    ICatalogMeasure,
    ICatalogDateDataset,
    isCatalogAttribute,
    isCatalogFact,
    isCatalogMeasure,
    isCatalogDateDataset,
} from "@gooddata/sdk-model";

export class BearWorkspaceCatalogWithAvailableItems implements IWorkspaceCatalogWithAvailableItems {
    constructor(
        private readonly catalogGroups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        private readonly availableItems: CatalogItem[],
        private readonly options: IWorkspaceCatalogFactoryOptions,
    ) {}

    public groups(): ICatalogGroup[] {
        invariant(this.options.loadGroups, "Catalog groups are not loaded.");
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
