// (C) 2019 GoodData Corporation
import { CatalogItemType, CatalogItem, ICatalogGroup } from "@gooddata/sdk-model";

/**
 * @public
 */
export interface ILoadCatalogItemsOptions {
    readonly types?: CatalogItemType[];
    readonly includeWithTags?: string[];
    readonly excludeWithTags?: string[];
    readonly production?: 1 | 0;
    readonly csvDataSets?: string[];
}

/**
 * @public
 */
export interface ILoadCatalogGroupsOptions {
    readonly includeWithTags?: string[];
    readonly excludeWithTags?: string[];
    readonly production?: 1 | 0;
    readonly csvDataSets?: string[];
}

/**
 * @public
 */
export interface ILoadAvailableCatalogItemsOptions {
    readonly identifiers: string[];
    readonly types?: CatalogItemType[];
}

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceCatalog {
    loadItems(options?: ILoadCatalogItemsOptions): Promise<CatalogItem[]>;
    loadGroups(options?: ILoadCatalogGroupsOptions): Promise<ICatalogGroup[]>;
    loadAvailableItemsIdentifiers(options: ILoadAvailableCatalogItemsOptions): Promise<string[]>;
}
