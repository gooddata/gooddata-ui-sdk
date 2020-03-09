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
import { TigerAuthenticatedCallGuard } from "../../../types";
import { TigerWorkspaceCatalogAvailableItemsFactory } from "./availableItemsFactory";

export class TigerWorkspaceCatalog implements IWorkspaceCatalog {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        private readonly workspace: string,
        private readonly groups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        private readonly options: IWorkspaceCatalogFactoryOptions,
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
        return new TigerWorkspaceCatalogAvailableItemsFactory(
            this.authCall,
            this.workspace,
            this.groups,
            this.items,
            this.options,
        );
    }
}
