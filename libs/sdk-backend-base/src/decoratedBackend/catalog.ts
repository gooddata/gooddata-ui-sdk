// (C) 2019-2022 GoodData Corporation
import {
    IWorkspaceCatalog,
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    ObjRef,
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
    ICatalogAttribute,
    ICatalogFact,
    ICatalogMeasure,
    ICatalogDateDataset,
} from "@gooddata/sdk-model";
import identity from "lodash/identity.js";

/**
 * @alpha
 */
export type WorkspaceCatalogWrapper = (catalog: IWorkspaceCatalog) => IWorkspaceCatalog;

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceCatalogFactory implements IWorkspaceCatalogFactory {
    public options: IWorkspaceCatalogFactoryOptions;
    public workspace: string;

    protected constructor(
        private decorated: IWorkspaceCatalogFactory,
        protected readonly wrapper: WorkspaceCatalogWrapper = identity,
    ) {
        this.workspace = this.decorated.workspace;
        this.options = this.decorated.options;
    }

    public forDataset(dataset: ObjRef): IWorkspaceCatalogFactory {
        return this.createNew(this.decorated.forDataset(dataset));
    }

    public forTypes(types: CatalogItemType[]): IWorkspaceCatalogFactory {
        return this.createNew(this.decorated.forTypes(types));
    }

    public excludeTags(tags: ObjRef[]): IWorkspaceCatalogFactory {
        return this.createNew(this.decorated.excludeTags(tags));
    }

    public includeTags(tags: ObjRef[]): IWorkspaceCatalogFactory {
        return this.createNew(this.decorated.includeTags(tags));
    }

    public withOptions(options: IWorkspaceCatalogFactoryOptions): IWorkspaceCatalogFactory {
        return this.createNew(this.decorated.withOptions(options));
    }

    public withGroups(loadGroups: boolean): IWorkspaceCatalogFactory {
        return this.createNew(this.decorated.withGroups(loadGroups));
    }

    public async load(): Promise<IWorkspaceCatalog> {
        const catalog = await this.decorated.load();

        return this.wrapper(catalog);
    }

    /**
     * Methods that create new instances of catalog loader (e.g. all except load) will
     * call out to this method to create decorated loader. This is essential to maintain the decoration
     * during immutable operations where decorated implementation creates new instances.
     *
     * @param decorated - instance to decorate
     */
    protected abstract createNew(decorated: IWorkspaceCatalogFactory): IWorkspaceCatalogFactory;
}

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceCatalog implements IWorkspaceCatalog {
    protected constructor(private readonly decorated: IWorkspaceCatalog) {}

    public availableItems(): IWorkspaceCatalogAvailableItemsFactory {
        return this.decorated.availableItems();
    }

    public attributes(): ICatalogAttribute[] {
        return this.decorated.attributes();
    }

    public dateDatasets(): ICatalogDateDataset[] {
        return this.decorated.dateDatasets();
    }

    public facts(): ICatalogFact[] {
        return this.decorated.facts();
    }

    public groups(): ICatalogGroup[] {
        return this.decorated.groups();
    }

    public allItems(): CatalogItem[] {
        return this.decorated.allItems();
    }

    public measures(): ICatalogMeasure[] {
        return this.decorated.measures();
    }
}
