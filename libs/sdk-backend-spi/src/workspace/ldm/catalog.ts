// (C) 2019-2022 GoodData Corporation
import {
    IAttributeOrMeasure,
    IInsightDefinition,
    ObjRef,
    CatalogItem,
    CatalogItemType,
    ICatalogAttribute,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogGroup,
    ICatalogMeasure,
} from "@gooddata/sdk-model";

/**
 * Configuration options for querying catalog items
 *
 * @public
 */
export interface IWorkspaceCatalogFactoryOptions {
    /**
     * Get catalog items from a specific dataset
     */
    dataset?: ObjRef;

    /**
     * Get catalog items of specific types (attribute, measure, fact or dateDataset)
     * Default: ["attribute", "measure", fact", "dateDataset]
     */
    types: CatalogItemType[];

    /**
     * Get catalog items that have reference to specific tags.
     * This is commonly used to obtain catalog items from specific group(s).
     */
    includeTags: ObjRef[];

    /**
     * Get catalog items that don't have reference to specific tags
     * Use this to obtain catalog items that are not included in specific group(s).
     */
    excludeTags: ObjRef[];

    /**
     * When true, get only production ready catalog items.
     * When false, get only non-production ready catalog items.
     * Otherwise, return both.
     * Default: undefined
     */
    production?: boolean;

    /**
     * Optional list of additional date dataset granularities that must be added by backend to the
     * ones returned by default.
     * Default: undefined
     */
    includeDateGranularities?: string[];
}

/**
 * Configuration options for querying catalog available items
 *
 * @public
 */
export interface IWorkspaceCatalogWithAvailableItemsFactoryOptions extends IWorkspaceCatalogFactoryOptions {
    /**
     * Get only catalog items that are available for the provided execution items
     */
    items?: IAttributeOrMeasure[];

    /**
     * Get only items that are available for the provided insight
     */
    insight?: IInsightDefinition;
}

/**
 * Catalog is useful for:
 * - Interactive insight/execution creation
 * - Exporting execution model for a specific workspace
 *
 * @public
 */
export interface IWorkspaceCatalogFactory
    extends IWorkspaceCatalogFactoryMethods<IWorkspaceCatalogFactory, IWorkspaceCatalogFactoryOptions> {
    /**
     * Workspace whose catalog is being loaded.
     */
    readonly workspace: string;

    /**
     * Options set for the loader so far.
     */
    readonly options: IWorkspaceCatalogFactoryOptions;

    /**
     * Get catalog items for the current configuration.
     * Returns items that are either not "unlisted" or that are created by the current user.
     *
     * @returns promise of catalog with loaded items
     */
    load(): Promise<IWorkspaceCatalog>;
}

/**
 * Service to obtain only valid items for a particular execution or insight.
 *
 * @remarks
 * This is useful for interactive insight/execution creation.
 * (catalog will offer you only valid items that you can add to your insight/execution)
 *
 * @public
 */
export interface IWorkspaceCatalogAvailableItemsFactory
    extends IWorkspaceCatalogFactoryMethods<
        IWorkspaceCatalogAvailableItemsFactory,
        IWorkspaceCatalogWithAvailableItemsFactoryOptions
    > {
    /**
     * Setup catalog to fetch only items that are valid for the provided execution items
     *
     * @param items - execution items
     * @returns catalog available items factory
     */
    forItems(items: IAttributeOrMeasure[]): IWorkspaceCatalogAvailableItemsFactory;

    /**
     * Setup catalog to fetch only items that are valid for the provided insight definition
     *
     * @param insight - insight definition
     * @returns catalog available items factory
     */
    forInsight(insight: IInsightDefinition): IWorkspaceCatalogAvailableItemsFactory;

    /**
     * Fetch available catalog items for the current setup
     *
     * @returns promise of catalog with loaded available items
     */
    load(): Promise<IWorkspaceCatalogWithAvailableItems>;
}

/**
 * Instance of workspace catalog with loaded items
 *
 * @public
 */
export interface IWorkspaceCatalog extends IWorkspaceCatalogMethods {
    /**
     * Get only items that are valid for specific insight or execution items.
     *
     * @returns catalog available items factory
     */
    availableItems(): IWorkspaceCatalogAvailableItemsFactory;
}

/**
 * Instance of workspace catalog with loaded available items.
 *
 * @public
 */
export interface IWorkspaceCatalogWithAvailableItems extends IWorkspaceCatalogMethods {
    /**
     * Get all available catalog items
     *
     * @returns array of available catalog items
     */
    allAvailableItems(): CatalogItem[];

    /**
     * Get all available catalog attributes
     *
     * @returns array of available catalog attributes
     */
    availableAttributes(): ICatalogAttribute[];

    /**
     * Get all available catalog measures
     *
     * @returns array of available catalog measures
     */
    availableMeasures(): ICatalogMeasure[];

    /**
     * Get all available catalog facts
     *
     * @returns array of available catalog facts
     */
    availableFacts(): ICatalogFact[];

    /**
     * Get all available catalog date datasets
     *
     * @returns array of available catalog date datasets
     */
    availableDateDatasets(): ICatalogDateDataset[];
}

/**
 * Common methods for catalog configuration
 *
 * @public
 */
export interface IWorkspaceCatalogFactoryMethods<TFactory, TOptions> {
    /**
     * Setup catalog to fetch only items of the provided dataset
     *
     * @param dataset - dataset reference
     * @returns catalog factory
     */
    forDataset(dataset: ObjRef): TFactory;

    /**
     * Setup catalog to fetch only items of the provided types (attribute, measure, fact or dateDataset)
     *
     * @param types - catalog item types
     * @returns catalog factory
     */
    forTypes(types: CatalogItemType[]): TFactory;

    /**
     * Setup catalog to fetch only items with provided tags
     *
     * @param tags - tags references
     * @returns catalog factory
     */
    includeTags(tags: ObjRef[]): TFactory;

    /**
     * Setup catalog to fetch only items without provided tags
     *
     * @param tags - tags references
     * @returns catalog factory
     */
    excludeTags(tags: ObjRef[]): TFactory;

    /**
     * Setup catalog to fetch only items for specific options
     *
     * @param options - catalog options
     * @returns catalog factory
     */
    withOptions(options: Partial<TOptions>): TFactory;
}

/**
 * Common methods to obtain catalog items
 *
 * @public
 */
export interface IWorkspaceCatalogMethods {
    /**
     * Get all catalog groups
     *
     * @returns array of catalog groups
     */
    groups(): ICatalogGroup[];

    /**
     * Get all catalog items
     *
     * @returns array of catalog items
     */
    allItems(): CatalogItem[];

    /**
     * Get all catalog attributes
     *
     * @returns array of catalog attribtues
     */
    attributes(): ICatalogAttribute[];

    /**
     * Get all catalog measures
     *
     * @returns array of catalog measures
     */
    measures(): ICatalogMeasure[];

    /**
     * Get all catalog facts
     *
     * @returns array of catalog facts
     */
    facts(): ICatalogFact[];

    /**
     * Get all catalog date datasets
     *
     * @returns array of catalog date datasets
     */
    dateDatasets(): ICatalogDateDataset[];
}
