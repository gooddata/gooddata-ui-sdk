// (C) 2019-2020 GoodData Corporation
import {
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
    ICatalogAttribute,
    ICatalogMeasure,
    ICatalogFact,
    AttributeOrMeasure,
    ICatalogDateDataset,
    IInsightDefinition,
    ObjRef,
} from "@gooddata/sdk-model";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceCatalogFactoryOptions {
    dataset?: ObjRef;
    types: CatalogItemType[];
    includeTags: ObjRef[];
    excludeTags: ObjRef[];
    production: boolean;
}

/**
 * TODO: SDK8: add public doc
 * @public
 */
export interface IWorkspaceCatalogWithAvailableItemsFactoryOptions extends IWorkspaceCatalogFactoryOptions {
    items?: AttributeOrMeasure[];
    insight?: IInsightDefinition;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceCatalogFactory
    extends IWorkspaceCatalogFactoryMethods<IWorkspaceCatalogFactory, IWorkspaceCatalogFactoryOptions> {
    load(): Promise<IWorkspaceCatalog>;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceCatalogAvailableItemsFactory
    extends IWorkspaceCatalogFactoryMethods<
        IWorkspaceCatalogAvailableItemsFactory,
        IWorkspaceCatalogWithAvailableItemsFactoryOptions
    > {
    forItems(items: AttributeOrMeasure[]): IWorkspaceCatalogAvailableItemsFactory;
    forInsight(insight: IInsightDefinition): IWorkspaceCatalogAvailableItemsFactory;
    load(): Promise<IWorkspaceCatalogWithAvailableItems>;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceCatalog extends IWorkspaceCatalogMethods {
    availableItems(): IWorkspaceCatalogAvailableItemsFactory;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceCatalogWithAvailableItems extends IWorkspaceCatalogMethods {
    getAvailableItems(): CatalogItem[];
    getAvailableAttributes(): ICatalogAttribute[];
    getAvailableMeasures(): ICatalogMeasure[];
    getAvailableFacts(): ICatalogFact[];
    getAvailableDateDatasets(): ICatalogDateDataset[];
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceCatalogFactoryMethods<T, TOptions> {
    forDataset(dataset: ObjRef): T;
    forTypes(types: CatalogItemType[]): T;
    includeTags(tags: ObjRef[]): T;
    excludeTags(tags: ObjRef[]): T;
    withOptions(options: TOptions): T;
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceCatalogMethods {
    getGroups(): ICatalogGroup[];
    getItems(): CatalogItem[];
    getAttributes(): ICatalogAttribute[];
    getMeasures(): ICatalogMeasure[];
    getFacts(): ICatalogFact[];
    getDateDatasets(): ICatalogDateDataset[];
}
