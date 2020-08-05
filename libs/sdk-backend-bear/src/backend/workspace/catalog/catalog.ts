// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceCatalog,
} from "@gooddata/sdk-backend-spi";
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
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { IUriMappings } from "../../../types/catalog";
import { BearWorkspaceCatalogAvailableItemsFactory } from "./availableItemsFactory";

export class BearWorkspaceCatalog implements IWorkspaceCatalog {
    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        private readonly workspace: string,
        private readonly groups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        private readonly options: IWorkspaceCatalogFactoryOptions,
        private readonly mappings: IUriMappings,
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

    public availableItems(): IWorkspaceCatalogAvailableItemsFactory {
        return new BearWorkspaceCatalogAvailableItemsFactory(
            this.authCall,
            this.workspace,
            this.groups,
            this.items,
            this.options,
            this.mappings,
        );
    }
}
