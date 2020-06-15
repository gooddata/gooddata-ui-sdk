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
