// (C) 2019-2022 GoodData Corporation
import {
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceCatalog,
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
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { IUriMappings } from "../../../types/catalog";
import { BearWorkspaceCatalogAvailableItemsFactory } from "./availableItemsFactory";

export class BearWorkspaceCatalog implements IWorkspaceCatalog {
    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        private readonly workspace: string,
        private readonly catalogGroups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        private readonly options: IWorkspaceCatalogFactoryOptions,
        private readonly mappings: IUriMappings,
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

    public availableItems(): IWorkspaceCatalogAvailableItemsFactory {
        return new BearWorkspaceCatalogAvailableItemsFactory(
            this.authCall,
            this.workspace,
            this.catalogGroups,
            this.items,
            this.options,
            this.mappings,
        );
    }
}
