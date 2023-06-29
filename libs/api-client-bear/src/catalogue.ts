// (C) 2007-2022 GoodData Corporation
import find from "lodash/find.js";
import omit from "lodash/omit.js";
import omitBy from "lodash/omitBy.js";
import isEmpty from "lodash/isEmpty.js";
import cloneDeep from "lodash/cloneDeep.js";
import { XhrModule } from "./xhr.js";
import { ExecutionModule } from "./execution.js";
import { IAdHocItemDescription, IStoredItemDescription, ItemDescription } from "./interfaces.js";
import {
    GdcCatalog,
    GdcDataSetsCsv,
    GdcDateDataSets,
    GdcVisualizationObject,
} from "@gooddata/api-model-bear";
import { omitEmpty } from "./util.js";

const REQUEST_DEFAULTS = {
    types: ["attribute", "metric", "fact"],
    paging: {
        offset: 0,
    },
};

const LOAD_DATE_DATASET_DEFAULTS = {
    includeUnavailableDateDataSetsCount: true,
    includeAvailableDateAttributes: true,
};

/**
 * Convert specific params in options to "requiredDataSets" structure. For more details look into
 * res file https://github.com/gooddata/gdc-bear/blob/develop/resources/specification/internal/catalog.res
 *
 * @param options - Supported keys in options are:
 * <ul>
 * <li>dataSetIdentifier - in value is string identifier of dataSet - this leads to CUSTOM type
 * <li>returnAllDateDataSets - true value means to return ALL values without dataSet differentiation
 * <li>returnAllRelatedDateDataSets - only related date dataSets are loaded across all dataSets
 * <li>by default we get PRODUCTION dataSets
 * </ul>
 * @returns "requiredDataSets" object hash.
 */
const getRequiredDataSets = (options: GdcCatalog.ILoadDateDataSetsParams = {}) => {
    if (options.returnAllRelatedDateDataSets) {
        return {};
    }

    if (options.returnAllDateDataSets) {
        return { requiredDataSets: { type: "ALL" } };
    }

    if (options.dataSetIdentifier) {
        return {
            requiredDataSets: {
                type: "CUSTOM",
                customIdentifiers: [options.dataSetIdentifier],
            },
        };
    }

    return { requiredDataSets: { type: "PRODUCTION" } };
};

interface IColumnsAndDefinitions {
    columns: string[];
    definitions: any[];
}

const buildItemDescriptionObjects = ({ columns, definitions }: IColumnsAndDefinitions): ItemDescription[] => {
    if (!columns) {
        return [];
    }

    return columns.map((column: string) => {
        const definition = find(
            definitions,
            ({ metricDefinition }) => metricDefinition.identifier === column,
        );
        const maql = definition?.metricDefinition?.expression;
        if (maql) {
            return { expression: maql };
        }
        return { uri: column };
    });
};

const isStoredItemDescription = (
    itemDescription: ItemDescription,
): itemDescription is IStoredItemDescription => {
    return !!(itemDescription as IStoredItemDescription).uri;
};

const isAdHocItemDescription = (
    itemDescription: ItemDescription,
): itemDescription is IAdHocItemDescription => {
    return !!(itemDescription as IAdHocItemDescription).expression;
};

/**
 * @internal
 */
export const unwrapItemDescriptionObject = (itemDescription: ItemDescription): string => {
    if (isStoredItemDescription(itemDescription)) {
        return itemDescription.uri;
    }
    if (isAdHocItemDescription(itemDescription)) {
        return itemDescription.expression;
    }
    throw new Error("Item description can only have expression or uri");
};

// When the limit is more than 2000,
// catalog items endpoint returns status of 500
const CATALOG_ITEMS_LIMIT = 1000;

export class CatalogueModule {
    constructor(private xhr: XhrModule, private execution: ExecutionModule) {}

    /**
     * Load all catalog items
     * @param projectId - string
     * @param options - GdcCatalog.ILoadCatalogItemsParams
     */
    public async loadAllItems(
        projectId: string,
        options: GdcCatalog.ILoadCatalogItemsParams = {},
    ): Promise<GdcCatalog.CatalogItem[]> {
        const sanitizedOptions = omitEmpty(options);

        const loadAll = async (
            requestOptions: GdcCatalog.ILoadCatalogItemsParams,
            items: GdcCatalog.CatalogItem[] = [],
        ): Promise<GdcCatalog.CatalogItem[]> => {
            const result = await this.xhr.getParsed<GdcCatalog.ILoadCatalogItemsResponse>(
                `/gdc/internal/projects/${projectId}/catalog/items`,
                {
                    data: requestOptions,
                },
            );

            const resultItems = result.catalogItems.items;
            const updatedItems = [...items, ...resultItems];
            if (resultItems.length === requestOptions.limit) {
                const updatedRequestOptions: GdcCatalog.ILoadCatalogItemsParams = {
                    ...requestOptions,
                    offset: result.catalogItems.paging.offset + requestOptions.limit,
                };

                return loadAll(updatedRequestOptions, updatedItems);
            }

            return updatedItems;
        };

        return loadAll({
            offset: 0,
            limit: CATALOG_ITEMS_LIMIT,
            ...sanitizedOptions,
        });
    }

    /**
     * Load catalog groups
     * @param projectId - string
     * @param options - GdcCatalog.ILoadCatalogGroupsParams
     */
    public async loadGroups(
        projectId: string,
        options: GdcCatalog.ILoadCatalogGroupsParams = {},
    ): Promise<GdcCatalog.ICatalogGroup[]> {
        const result = await this.xhr.getParsed<GdcCatalog.ILoadCatalogGroupsResponse>(
            `/gdc/internal/projects/${projectId}/catalog/groups`,
            {
                data: omitEmpty(options),
            },
        );

        return result.catalogGroups;
    }

    /**
     * Load available item uris by already used uris and expressions
     * @param projectId - string
     * @param options - GdcCatalog.ILoadAvailableCatalogItemsParams
     */
    public async loadAvailableItemUris(
        projectId: string,
        options: GdcCatalog.ILoadAvailableCatalogItemsParams,
    ): Promise<string[]> {
        const sanitizedCatalogQueryRequest = omitBy(options.catalogQueryRequest, isEmpty);
        const result = await this.xhr.postParsed<GdcCatalog.ILoadAvailableCatalogItemsResponse>(
            `/gdc/internal/projects/${projectId}/catalog/query`,
            {
                data: {
                    catalogQueryRequest: sanitizedCatalogQueryRequest,
                },
            },
        );
        return result.catalogAvailableItems.items;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public loadItems(projectId: string, options: any = {}) {
        const request = omit(
            {
                ...REQUEST_DEFAULTS,
                ...options,
                ...getRequiredDataSets(options),
            },
            ["dataSetIdentifier", "returnAllDateDataSets", "attributesMap"],
        );

        const mdObj = cloneDeep(options)?.bucketItems;
        const attributesMap = options?.attributesMap;
        const hasBuckets = mdObj?.buckets !== undefined;
        if (hasBuckets) {
            return this.loadItemDescriptionObjects(projectId, mdObj, attributesMap).then(
                (descriptionObjects) =>
                    this.loadCatalog(projectId, {
                        ...request,
                        bucketItems: descriptionObjects.map(unwrapItemDescriptionObject),
                    }),
            );
        }

        return this.loadCatalog(projectId, request);
    }

    public async loadDateDataSets(
        projectId: string,
        options: GdcCatalog.ILoadDateDataSetsParams,
    ): Promise<{
        dateDataSets: GdcDateDataSets.IDateDataSet[];
        unavailableDateDataSetsCount?: number | undefined;
    }> {
        const mdObj = cloneDeep(options).bucketItems;
        const descriptionObjects = mdObj
            ? await this.loadItemDescriptionObjects(projectId, mdObj, options.attributesMap!)
            : undefined;

        const bucketItems = descriptionObjects?.map(unwrapItemDescriptionObject);

        const omittedOptions = [
            "filter",
            "types",
            "paging",
            "dataSetIdentifier",
            "returnAllDateDataSets",
            "returnAllRelatedDateDataSets",
            "attributesMap",
        ];
        // includeObjectsWithTags has higher priority than excludeObjectsWithTags,
        // so when present omit excludeObjectsWithTags
        if (options.includeObjectsWithTags) {
            omittedOptions.push("excludeObjectsWithTags");
        }

        const request = omit(
            {
                ...LOAD_DATE_DATASET_DEFAULTS,
                ...REQUEST_DEFAULTS,
                ...options,
                ...getRequiredDataSets(options),
                bucketItems,
            },
            omittedOptions,
        );

        return this.requestDateDataSets(projectId, request);
    }

    /**
     * Loads item description objects and returns them
     *
     * @internal
     *
     * @param projectId - id of the project to load from
     * @param mdObj - metadata object containing buckets, visualization class, properties etc.
     * @param attributesMap - contains map of attributes where the keys are the attributes display forms URIs
     * @param removeDateItems - whether to skip date items
     * @returns ItemDescription which is either `{ uri: string }` or `{ expression: string }`
     */
    public async loadItemDescriptionObjects(
        projectId: string,
        mdObj: GdcVisualizationObject.IVisualizationObjectContent,
        attributesMap: any = {},
        removeDateItems = false,
    ): Promise<GdcCatalog.ItemDescription[]> {
        const definitionsAndColumns = await this.execution.mdToExecutionDefinitionsAndColumns(
            projectId,
            mdObj,
            { attributesMap, removeDateItems },
        );

        return buildItemDescriptionObjects(definitionsAndColumns);
    }

    /**
     * Loads all available data sets.
     * @param projectId - id of the project to load from
     */
    public async loadDataSets(projectId: string): Promise<GdcDataSetsCsv.IDataset[]> {
        const uri = `/gdc/dataload/internal/projects/${projectId}/csv/datasets`;
        const response = await this.xhr.getParsed<GdcDataSetsCsv.IDatasetsResponse>(uri);
        return response.datasets.items;
    }

    private requestDateDataSets(projectId: string, dateDataSetsRequest: any) {
        const uri = `/gdc/internal/projects/${projectId}/loadDateDataSets`;

        return this.xhr
            .postParsed<GdcDateDataSets.IDateDataSetResponse>(uri, { data: { dateDataSetsRequest } })
            .then((data) => data.dateDataSetsResponse);
    }

    private loadCatalog(projectId: string, catalogRequest: any) {
        const uri = `/gdc/internal/projects/${projectId}/loadCatalog`;

        return this.xhr
            .post(uri, { data: { catalogRequest } })
            .then((r) => r.getData())
            .then((data) => data.catalogResponse);
    }
}
