// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceCatalog,
    UnexpectedResponseError,
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogWithAvailableItems,
    IWorkspaceCatalogWithAvailableItemsFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    ObjRef,
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
    ICatalogAttribute,
    ICatalogMeasure,
    ICatalogFact,
    ICatalogDateDataset,
    isCatalogDateDataset,
    isCatalogFact,
    isCatalogMeasure,
    isCatalogAttribute,
    IAttributeOrMeasure,
    IInsightDefinition,
} from "@gooddata/sdk-model";

import { RecordingIndex } from "./types";

/**
 * @internal
 */
export class RecordedCatalogFactory implements IWorkspaceCatalogFactory {
    constructor(
        public workspace: string,
        private recordings: RecordingIndex = {},
        public options: IWorkspaceCatalogFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset"],
            excludeTags: [],
            includeTags: [],
        },
    ) {}

    public forDataset(dataset: ObjRef): IWorkspaceCatalogFactory {
        return this.withOptions({
            dataset,
        });
    }

    public forTypes(types: CatalogItemType[]): IWorkspaceCatalogFactory {
        return this.withOptions({
            types,
        });
    }

    // include and exclude tags do not work yet
    public includeTags(tags: ObjRef[]): IWorkspaceCatalogFactory {
        return this.withOptions({
            includeTags: tags,
        });
    }

    public excludeTags(tags: ObjRef[]): IWorkspaceCatalogFactory {
        return this.withOptions({
            excludeTags: tags,
        });
    }

    public withOptions(options: Partial<IWorkspaceCatalogFactoryOptions>): IWorkspaceCatalogFactory {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new RecordedCatalogFactory(this.workspace, this.recordings, newOptions);
    }

    public async load(): Promise<IWorkspaceCatalog> {
        const catalog = this.recordings.metadata?.catalog;
        if (!(catalog?.items && catalog?.groups)) {
            throw new UnexpectedResponseError("No catalog recording", 404, {});
        }

        const typeFilteredItems = catalog.items.filter((item) => this.options.types.includes(item.type));
        return new RecordedCatalog(this.workspace, catalog.groups, typeFilteredItems);
    }
}

class RecordedCatalogBase {
    constructor(protected readonly groups: ICatalogGroup[], protected readonly items: CatalogItem[]) {}

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

    public getGroups(): ICatalogGroup[] {
        return this.groups;
    }
}

class RecordedCatalog extends RecordedCatalogBase implements IWorkspaceCatalog {
    constructor(private readonly workspace: string, groups: ICatalogGroup[], items: CatalogItem[]) {
        super(groups, items);
    }

    public availableItems(): IWorkspaceCatalogAvailableItemsFactory {
        return new RecordedAvailableCatalogFactory(this.workspace, this.groups, this.items);
    }
}

class RecordedAvailableCatalogFactory implements IWorkspaceCatalogAvailableItemsFactory {
    constructor(
        public readonly workspace: string,
        private readonly groups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        public readonly options: IWorkspaceCatalogWithAvailableItemsFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset"],
            excludeTags: [],
            includeTags: [],
        },
    ) {}

    public forDataset(dataset: ObjRef): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            dataset,
        });
    }

    public forTypes(types: CatalogItemType[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            types,
        });
    }

    // include and exclude tags do not work yet
    public includeTags(tags: ObjRef[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            includeTags: tags,
        });
    }

    public excludeTags(tags: ObjRef[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            excludeTags: tags,
        });
    }

    public withOptions(
        options: Partial<IWorkspaceCatalogFactoryOptions>,
    ): IWorkspaceCatalogAvailableItemsFactory {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new RecordedAvailableCatalogFactory(this.workspace, this.groups, this.items, newOptions);
    }

    public forItems(_items: IAttributeOrMeasure[]): IWorkspaceCatalogAvailableItemsFactory {
        // availability not implemented yet
        return this;
    }

    public forInsight(_insight: IInsightDefinition): IWorkspaceCatalogAvailableItemsFactory {
        // availability not implemented yet
        return this;
    }

    public async load(): Promise<IWorkspaceCatalogWithAvailableItems> {
        return new RecordedAvailableCatalog(this.workspace, this.groups, this.items);
    }
}

class RecordedAvailableCatalog extends RecordedCatalogBase implements IWorkspaceCatalogWithAvailableItems {
    constructor(public readonly workspace: string, groups: ICatalogGroup[], items: CatalogItem[]) {
        super(groups, items);
    }

    // availability not implemented yet, just return everything
    public getAvailableItems(): CatalogItem[] {
        return this.getItems();
    }
    public getAvailableAttributes(): ICatalogAttribute[] {
        return this.getAttributes();
    }
    public getAvailableMeasures(): ICatalogMeasure[] {
        return this.getMeasures();
    }
    public getAvailableFacts(): ICatalogFact[] {
        return this.getFacts();
    }
    public getAvailableDateDatasets(): ICatalogDateDataset[] {
        return this.getDateDatasets();
    }
}
