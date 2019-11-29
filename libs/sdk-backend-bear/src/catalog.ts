// (C) 2019 GoodData Corporation
import uniq from "lodash/fp/uniq";
import map from "lodash/fp/map";
import filter from "lodash/fp/filter";
import flow from "lodash/flow";
import {
    IWorkspaceCatalog,
    ILoadCatalogItemsOptions,
    ILoadCatalogGroupsOptions,
    ILoadAvailableCatalogItemsOptions,
} from "@gooddata/sdk-backend-spi";
import { CatalogItem, ICatalogAttribute, ICatalogGroup, isCatalogAttribute } from "@gooddata/sdk-model";

import { AuthenticatedCallGuard } from "./commonTypes";
import {
    convertCatalogItemTypeToBearItemType,
    convertBearCatalogItemToCatalogItem,
} from "./toSdkModel/CatalogConverter";

export class BearWorkspaceCatalog implements IWorkspaceCatalog {
    constructor(private readonly authCall: AuthenticatedCallGuard, private readonly workspace: string) {}

    public async loadItems(options: ILoadCatalogItemsOptions = {}): Promise<CatalogItem[]> {
        const { types = [], includeWithTags, excludeWithTags, production, csvDataSets } = options;
        const bearItemTypes = types.map(convertCatalogItemTypeToBearItemType);
        const bearCatalogItems = await this.authCall(sdk =>
            sdk.catalogue.loadAllItems(this.workspace, {
                types: bearItemTypes,
                includeWithTags,
                excludeWithTags,
                production,
                csvDataSets,
            }),
        );
        const catalogItems = bearCatalogItems.map(convertBearCatalogItemToCatalogItem);

        // gd-bear-client catalog returns attribute displayForms as uris, so let's transform them to identifiers
        const displayFormUris = flow(
            filter(isCatalogAttribute),
            map(attr => attr.defaultDisplayForm),
            uniq,
        )(catalogItems);
        const displayFormUriIdentifierPairs = await this.authCall(sdk =>
            sdk.md.getIdentifiersFromUris(this.workspace, displayFormUris),
        );
        const displayFormIdentifierByUri = displayFormUriIdentifierPairs.reduce(
            (acc: { [key: string]: string }, pair) => {
                return {
                    ...acc,
                    [pair.uri]: pair.identifier,
                };
            },
            {},
        );
        const catalogItemsWithDisplayFormIdentifiers = catalogItems.map(item => {
            if (isCatalogAttribute(item)) {
                const updatedAttribute: ICatalogAttribute = {
                    ...item,
                    defaultDisplayForm: displayFormIdentifierByUri[item.defaultDisplayForm],
                };

                return updatedAttribute;
            }

            return item;
        });

        return catalogItemsWithDisplayFormIdentifiers;
    }

    public async loadGroups(options: ILoadCatalogGroupsOptions = {}): Promise<ICatalogGroup[]> {
        const { includeWithTags, excludeWithTags, production, csvDataSets } = options;
        const catalogGroups: ICatalogGroup[] = await this.authCall(sdk =>
            sdk.catalogue.loadGroups(this.workspace, {
                includeWithTags,
                excludeWithTags,
                production,
                csvDataSets,
            }),
        );

        return catalogGroups;
    }

    // TODO: Are identifiers in options enough to cover all the functionality? (without uris and expressions)
    // Is result different, when we provide only identifiers of the expression and not the expression itself?
    // If so, add to inteface possibility to provide uris/expressions
    // https://jira.intgdc.com/browse/RAIL-1944
    public async loadAvailableItemsIdentifiers(
        options: ILoadAvailableCatalogItemsOptions,
    ): Promise<string[]> {
        const { types = [], identifiers = [] } = options;
        const bearTypes = types.map(convertCatalogItemTypeToBearItemType);
        const uriIdentifierPairs = await this.authCall(sdk =>
            sdk.md.getUrisFromIdentifiers(this.workspace, identifiers),
        );
        const bucketItems = uriIdentifierPairs.map(pair => ({ uri: pair.uri }));
        const availableItemUris = await this.authCall(sdk =>
            sdk.catalogue.loadAvailableItemUris(this.workspace, {
                catalogQueryRequest: {
                    bucketItems,
                    types: bearTypes,
                },
            }),
        );
        const availableItemUriIdentifierPairs = await this.authCall(sdk =>
            sdk.md.getIdentifiersFromUris(this.workspace, availableItemUris),
        );

        const availableItemsIdentifiers = availableItemUriIdentifierPairs.map(item => item.identifier);

        return availableItemsIdentifiers;
    }
}
