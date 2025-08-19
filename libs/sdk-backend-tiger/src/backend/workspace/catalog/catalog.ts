// (C) 2019-2025 GoodData Corporation
import { invariant } from "ts-invariant";

import {
    IWorkspaceCatalog,
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    CatalogItem,
    ICatalogAttribute,
    ICatalogAttributeHierarchy,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogGroup,
    ICatalogMeasure,
    isCatalogAttribute,
    isCatalogAttributeHierarchy,
    isCatalogDateDataset,
    isCatalogFact,
    isCatalogMeasure,
} from "@gooddata/sdk-model";

import { TigerWorkspaceCatalogAvailableItemsFactory } from "./availableItemsFactory.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class TigerWorkspaceCatalog implements IWorkspaceCatalog {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
        private readonly catalogGroups: ICatalogGroup[],
        private readonly items: CatalogItem[],
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

    public attributeHierarchies(): ICatalogAttributeHierarchy[] {
        return this.items.filter(isCatalogAttributeHierarchy);
    }

    public availableItems(): IWorkspaceCatalogAvailableItemsFactory {
        return new TigerWorkspaceCatalogAvailableItemsFactory(
            this.authCall,
            this.workspace,
            this.catalogGroups,
            this.items,
            this.options,
        );
    }
}
