// (C) 2019-2021 GoodData Corporation
import {
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceCatalog,
    UnexpectedResponseError,
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogWithAvailableItems,
    IWorkspaceCatalogWithAvailableItemsFactoryOptions,
    CatalogItemType,
    ICatalogGroup,
    CatalogItem,
    ICatalogAttribute,
    isCatalogAttribute,
    ICatalogMeasure,
    isCatalogMeasure,
    ICatalogFact,
    isCatalogFact,
    ICatalogDateDataset,
    isCatalogDateDataset,
} from "@gooddata/sdk-backend-spi";
import { ObjRef, IAttributeOrMeasure, IInsightDefinition } from "@gooddata/sdk-model";

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

    public forDataset = (dataset: ObjRef): IWorkspaceCatalogFactory => {
        return this.withOptions({
            dataset,
        });
    };

    public forTypes = (types: CatalogItemType[]): IWorkspaceCatalogFactory => {
        return this.withOptions({
            types,
        });
    };

    // include and exclude tags do not work yet
    public includeTags = (tags: ObjRef[]): IWorkspaceCatalogFactory => {
        return this.withOptions({
            includeTags: tags,
        });
    };

    public excludeTags = (tags: ObjRef[]): IWorkspaceCatalogFactory => {
        return this.withOptions({
            excludeTags: tags,
        });
    };

    public withOptions = (options: Partial<IWorkspaceCatalogFactoryOptions>): IWorkspaceCatalogFactory => {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new RecordedCatalogFactory(this.workspace, this.recordings, newOptions);
    };

    public load = (): Promise<IWorkspaceCatalog> => {
        const catalog = this.recordings.metadata?.catalog;
        if (!(catalog?.items && catalog?.groups)) {
            throw new UnexpectedResponseError("No catalog recording", 404, {});
        }

        const typeFilteredItems = catalog.items.filter((item) => this.options.types.includes(item.type));

        return Promise.resolve(new RecordedCatalog(this.workspace, catalog.groups, typeFilteredItems));
    };
}

class RecordedCatalogBase {
    constructor(protected readonly catalogGroups: ICatalogGroup[], protected readonly items: CatalogItem[]) {}

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

    public groups(): ICatalogGroup[] {
        return this.catalogGroups;
    }
}

class RecordedCatalog extends RecordedCatalogBase implements IWorkspaceCatalog {
    constructor(private readonly workspace: string, catalogGroups: ICatalogGroup[], items: CatalogItem[]) {
        super(catalogGroups, items);
    }

    public availableItems(): IWorkspaceCatalogAvailableItemsFactory {
        return new RecordedAvailableCatalogFactory(this.workspace, this.catalogGroups, this.items);
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

    public forDataset = (dataset: ObjRef): IWorkspaceCatalogAvailableItemsFactory => {
        return this.withOptions({
            dataset,
        });
    };

    public forTypes = (types: CatalogItemType[]): IWorkspaceCatalogAvailableItemsFactory => {
        return this.withOptions({
            types,
        });
    };

    // include and exclude tags do not work yet
    public includeTags = (tags: ObjRef[]): IWorkspaceCatalogAvailableItemsFactory => {
        return this.withOptions({
            includeTags: tags,
        });
    };

    public excludeTags = (tags: ObjRef[]): IWorkspaceCatalogAvailableItemsFactory => {
        return this.withOptions({
            excludeTags: tags,
        });
    };

    public withOptions = (
        options: Partial<IWorkspaceCatalogFactoryOptions>,
    ): IWorkspaceCatalogAvailableItemsFactory => {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new RecordedAvailableCatalogFactory(this.workspace, this.groups, this.items, newOptions);
    };

    public forItems = (_items: IAttributeOrMeasure[]): IWorkspaceCatalogAvailableItemsFactory => {
        // availability not implemented yet
        return this;
    };

    public forInsight = (_insight: IInsightDefinition): IWorkspaceCatalogAvailableItemsFactory => {
        // availability not implemented yet
        return this;
    };

    public load = (): Promise<IWorkspaceCatalogWithAvailableItems> => {
        return Promise.resolve(new RecordedAvailableCatalog(this.workspace, this.groups, this.items));
    };
}

class RecordedAvailableCatalog extends RecordedCatalogBase implements IWorkspaceCatalogWithAvailableItems {
    constructor(public readonly workspace: string, groups: ICatalogGroup[], items: CatalogItem[]) {
        super(groups, items);
    }

    // availability not implemented yet, just return everything
    public allAvailableItems(): CatalogItem[] {
        return this.allItems();
    }
    public availableAttributes(): ICatalogAttribute[] {
        return this.attributes();
    }
    public availableMeasures(): ICatalogMeasure[] {
        return this.measures();
    }
    public availableFacts(): ICatalogFact[] {
        return this.facts();
    }
    public availableDateDatasets(): ICatalogDateDataset[] {
        return this.dateDatasets();
    }
}
