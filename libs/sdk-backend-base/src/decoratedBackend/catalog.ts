// (C) 2019-2020 GoodData Corporation
import {
    IWorkspaceCatalog,
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogFactoryOptions,
} from "@gooddata/sdk-backend-spi";
import {
    CatalogItem,
    CatalogItemType,
    ICatalogAttribute,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogGroup,
    ICatalogMeasure,
    ObjRef,
} from "@gooddata/sdk-model";
import identity from "lodash/identity";

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

    public getAttributes(): ICatalogAttribute[] {
        return this.decorated.getAttributes();
    }

    public getDateDatasets(): ICatalogDateDataset[] {
        return this.decorated.getDateDatasets();
    }

    public getFacts(): ICatalogFact[] {
        return this.decorated.getFacts();
    }

    public getGroups(): ICatalogGroup[] {
        return this.decorated.getGroups();
    }

    public getItems(): CatalogItem[] {
        return this.decorated.getItems();
    }

    public getMeasures(): ICatalogMeasure[] {
        return this.decorated.getMeasures();
    }
}
