// (C) 2007-2018 GoodData Corporation
import get from "lodash/get";
import find from "lodash/find";
import omit from "lodash/omit";
import cloneDeep from "lodash/cloneDeep";
import { XhrModule } from "./xhr";
import { ExecutionModule } from "./execution";

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
 * @param options Supported keys in options are:
 * <ul>
 * <li>dataSetIdentifier - in value is string identifier of dataSet - this leads to CUSTOM type
 * <li>returnAllDateDataSets - true value means to return ALL values without dataSet differentiation
 * <li>returnAllRelatedDateDataSets - only related date dataSets are loaded across all dataSets
 * <li>by default we get PRODUCTION dataSets
 * </ul>
 * @returns {Object} "requiredDataSets" object hash.
 */
const getRequiredDataSets = (options: any) => {
    if (get(options, "returnAllRelatedDateDataSets")) {
        return {};
    }

    if (get(options, "returnAllDateDataSets")) {
        return { requiredDataSets: { type: "ALL" } };
    }

    if (get(options, "dataSetIdentifier")) {
        return {
            requiredDataSets: {
                type: "CUSTOM",
                customIdentifiers: [get(options, "dataSetIdentifier")],
            },
        };
    }

    return { requiredDataSets: { type: "PRODUCTION" } };
};

export class CatalogueModule {
    constructor(private xhr: XhrModule, private execution: ExecutionModule) {}

    public loadItems(projectId: string, options = {}) {
        const request = omit(
            {
                ...REQUEST_DEFAULTS,
                ...options,
                ...getRequiredDataSets(options),
            },
            ["dataSetIdentifier", "returnAllDateDataSets", "attributesMap"],
        );

        const mdObj = get(cloneDeep(options), "bucketItems");
        const attributesMap = get(options, "attributesMap");
        const hasBuckets = get(mdObj, "buckets") !== undefined;
        if (hasBuckets) {
            return this.bucketItemsToExecConfig(projectId, mdObj, { attributesMap }).then(
                (bucketItems: any) => this.loadCatalog(projectId, { ...request, bucketItems }),
            );
        }

        return this.loadCatalog(projectId, request);
    }

    public loadDateDataSets(projectId: string, options: any) {
        const mdObj = get(cloneDeep(options), "bucketItems");
        const bucketItemsPromise = mdObj
            ? this.bucketItemsToExecConfig(projectId, mdObj, {
                  removeDateItems: true,
                  attributesMap: get(options, "attributesMap"),
              })
            : Promise.resolve();

        return bucketItemsPromise.then((bucketItems: any) => {
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
        });
    }

    private requestDateDataSets(projectId: string, dateDataSetsRequest: any) {
        const uri = `/gdc/internal/projects/${projectId}/loadDateDataSets`;

        return this.xhr
            .post(uri, { data: { dateDataSetsRequest } })
            .then(r => r.getData())
            .then(data => data.dateDataSetsResponse);
    }

    private bucketItemsToExecConfig(projectId: string, mdObj: any, options = {}) {
        return this.execution
            .mdToExecutionDefinitionsAndColumns(projectId, mdObj, options)
            .then((definitionsAndColumns: any) => {
                const definitions = get(definitionsAndColumns, "definitions");

                return get(definitionsAndColumns, "columns", []).map((column: any) => {
                    const definition = find(
                        definitions,
                        ({ metricDefinition }) => get(metricDefinition, "identifier") === column,
                    );
                    const maql = get(definition, "metricDefinition.expression");

                    if (maql) {
                        return maql;
                    }
                    return column;
                });
            });
    }

    private loadCatalog(projectId: string, catalogRequest: any) {
        const uri = `/gdc/internal/projects/${projectId}/loadCatalog`;

        return this.xhr
            .post(uri, { data: { catalogRequest } })
            .then(r => r.getData())
            .then(data => data.catalogResponse);
    }
}
