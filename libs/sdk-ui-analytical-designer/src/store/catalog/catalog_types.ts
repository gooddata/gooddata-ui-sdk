// (C) 2020-2026 GoodData Corporation

import {
    type CatalogItem,
    type ICatalogAttributeHierarchy,
    type ICatalogDateAttributeHierarchy,
    type ICatalogGroup,
    type IParameterMetadataObject,
} from "@gooddata/sdk-model";

import { type IOrganizedCatalogTooltipDetails } from "../../typings/catalog.js";

export interface ICatalogState {
    readonly items: ReadonlyArray<CatalogItem>;
    readonly groups: ReadonlyArray<ICatalogGroup>;
    readonly availableItemsUris: ReadonlyArray<string> | null;
    readonly updatedItemsCount: number;
    readonly flags: {
        readonly loadingGroups: boolean;
        readonly loadingItems: boolean;
        readonly loadingAvailability: boolean;
        /** the caught availability error — only its truthiness is read */
        readonly availabilityError: unknown;
        readonly firstLoaded: boolean;
        readonly attributeHierarchiesChanged: boolean;
    };
    tooltipDetails: {
        [itemIdentifier: string]: IOrganizedCatalogTooltipDetails;
    };
    isWorkspaceEmpty: boolean;
    showUnavailableItems: boolean;
    readonly dateHierarchies: ReadonlyArray<ICatalogDateAttributeHierarchy>;
    readonly attributeHierarchies: ReadonlyArray<ICatalogAttributeHierarchy>;
    readonly parameters: ReadonlyArray<IParameterMetadataObject>;
}
