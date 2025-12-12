// (C) 2019-2025 GoodData Corporation

import {
    type IWorkspaceCatalog,
    type IWorkspaceCatalogAvailableItemsFactory,
    type IWorkspaceCatalogFactory,
    type IWorkspaceCatalogFactoryOptions,
    type IWorkspaceCatalogWithAvailableItems,
    type IWorkspaceCatalogWithAvailableItemsFactoryOptions,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import {
    type CatalogItem,
    type CatalogItemType,
    type IAttributeOrMeasure,
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogDateDataset,
    type ICatalogFact,
    type ICatalogGroup,
    type ICatalogMeasure,
    type IInsightDefinition,
    type ObjRef,
    isCatalogAttribute,
    isCatalogAttributeHierarchy,
    isCatalogDateDataset,
    isCatalogFact,
    isCatalogMeasure,
} from "@gooddata/sdk-model";

import { type RecordedBackendConfig, type RecordingIndex } from "./types.js";

/**
 * @internal
 */
export class RecordedCatalogFactory implements IWorkspaceCatalogFactory {
    constructor(
        public readonly workspace: string,
        private readonly recordings: RecordingIndex = {},
        private readonly config: RecordedBackendConfig = {},
        public readonly options: IWorkspaceCatalogFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset", "attributeHierarchy"],
            excludeTags: [],
            includeTags: [],
            loadGroups: true,
        },
        private readonly signal?: AbortSignal,
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
        return new RecordedCatalogFactory(
            this.workspace,
            this.recordings,
            this.config,
            newOptions,
            this.signal,
        );
    };

    public withGroups(loadGroups: boolean): IWorkspaceCatalogFactory {
        return this.withOptions({
            loadGroups,
        });
    }

    public withSignal(signal: AbortSignal): IWorkspaceCatalogFactory {
        return new RecordedCatalogFactory(this.workspace, this.recordings, this.config, this.options, signal);
    }

    public load = async (): Promise<IWorkspaceCatalog> => {
        const catalog = this.recordings.metadata?.catalog;
        if (!(catalog?.items && catalog?.groups)) {
            throw new UnexpectedResponseError("No catalog recording", 404, {});
        }

        const typeFilteredItems = catalog.items.filter((item) => this.options.types.includes(item.type));
        const catalogItems = typeFilteredItems.map(this.convertToCatalogItem.bind(this));

        return new RecordedCatalog(this.workspace, this.config, catalog.groups, catalogItems);
    };

    private convertToCatalogItem(catalogItem: CatalogItem) {
        if (isCatalogAttribute(catalogItem)) {
            return {
                ...catalogItem,
                attribute: {
                    ...catalogItem.attribute,
                    displayForms: catalogItem.displayForms,
                },
            };
        }

        return catalogItem;
    }
}

class RecordedCatalogBase {
    constructor(
        protected readonly catalogGroups: ICatalogGroup[],
        protected readonly items: CatalogItem[],
    ) {}

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

    public attributeHierarchies(): ICatalogAttributeHierarchy[] {
        return this.items.filter(isCatalogAttributeHierarchy);
    }
}

class RecordedCatalog extends RecordedCatalogBase implements IWorkspaceCatalog {
    constructor(
        private readonly workspace: string,
        private readonly config: RecordedBackendConfig,
        catalogGroups: ICatalogGroup[],
        items: CatalogItem[],
    ) {
        super(catalogGroups, items);
    }

    public availableItems(): IWorkspaceCatalogAvailableItemsFactory {
        return new RecordedAvailableCatalogFactory(
            this.workspace,
            this.config,
            this.catalogGroups,
            this.items,
        );
    }
}

class RecordedAvailableCatalogFactory implements IWorkspaceCatalogAvailableItemsFactory {
    constructor(
        public readonly workspace: string,
        private readonly config: RecordedBackendConfig,
        private readonly groups: ICatalogGroup[],
        private readonly items: CatalogItem[],
        public readonly options: IWorkspaceCatalogWithAvailableItemsFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset", "attributeHierarchy"],
            excludeTags: [],
            includeTags: [],
            loadGroups: true,
        },
        public signal?: AbortSignal,
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
        return new RecordedAvailableCatalogFactory(
            this.workspace,
            this.config,
            this.groups,
            this.items,
            newOptions,
            this.signal,
        );
    };

    public withSignal = (signal: AbortSignal): IWorkspaceCatalogAvailableItemsFactory => {
        return new RecordedAvailableCatalogFactory(
            this.workspace,
            this.config,
            this.groups,
            this.items,
            this.options,
            signal,
        );
    };

    public forItems = (_items: IAttributeOrMeasure[]): IWorkspaceCatalogAvailableItemsFactory => {
        // availability not implemented yet
        return this;
    };

    public forInsight = (_insight: IInsightDefinition): IWorkspaceCatalogAvailableItemsFactory => {
        // availability not implemented yet
        return this;
    };

    // eslint-disable-next-line sonarjs/no-identical-functions
    public withGroups(loadGroups: boolean): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            loadGroups,
        });
    }

    public load = async (): Promise<IWorkspaceCatalogWithAvailableItems> => {
        return new RecordedAvailableCatalog(this.workspace, this.config, this.groups, this.items);
    };
}

class RecordedAvailableCatalog extends RecordedCatalogBase implements IWorkspaceCatalogWithAvailableItems {
    private readonly filteredAttributes: ICatalogAttribute[];
    private readonly filteredMeasures: ICatalogMeasure[];
    private readonly filteredFacts: ICatalogFact[];
    private readonly filteredDateDatasets: ICatalogDateDataset[];
    private readonly filteredAttributeHierarchies: ICatalogAttributeHierarchy[];

    constructor(
        public readonly workspace: string,
        private readonly config: RecordedBackendConfig,
        groups: ICatalogGroup[],
        items: CatalogItem[],
    ) {
        super(groups, items);

        // without this inference starts thinking the identity may return undefined :/
        const typedIdentity: <T>(obj: T) => T = (v) => v;
        const {
            availableAttributes = typedIdentity,
            availableMeasures = typedIdentity,
            availableFacts = typedIdentity,
            availableDateDatasets = typedIdentity,
            availableAttributeHierarchies = typedIdentity,
        } = this.config.catalogAvailability ?? {};

        this.filteredAttributes = availableAttributes(this.attributes());
        this.filteredMeasures = availableMeasures(this.measures());
        this.filteredFacts = availableFacts(this.facts());
        this.filteredDateDatasets = availableDateDatasets(this.dateDatasets());
        this.filteredAttributeHierarchies = availableAttributeHierarchies(this.attributeHierarchies());
    }

    public allAvailableItems = (): CatalogItem[] => {
        return [
            ...this.filteredAttributes,
            ...this.filteredMeasures,
            ...this.filteredFacts,
            ...this.filteredDateDatasets,
            ...this.filteredAttributeHierarchies,
        ];
    };
    public availableAttributes = (): ICatalogAttribute[] => {
        return this.filteredAttributes;
    };
    public availableMeasures = (): ICatalogMeasure[] => {
        return this.filteredMeasures;
    };
    public availableFacts(): ICatalogFact[] {
        return this.filteredFacts;
    }
    public availableDateDatasets(): ICatalogDateDataset[] {
        return this.filteredDateDatasets;
    }
    public availableAttributeHierarchies(): ICatalogAttributeHierarchy[] {
        return this.filteredAttributeHierarchies;
    }
}
