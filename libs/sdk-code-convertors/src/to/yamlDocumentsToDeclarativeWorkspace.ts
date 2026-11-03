// (C) 2023-2026 GoodData Corporation

import { type DeclarativeFilterContext, type DeclarativeWorkspaceModel } from "@gooddata/api-client-tiger";
import type { Dashboard, Dataset, Visualisation } from "@gooddata/sdk-code-schemas/v1";

import {
    AttributeHierarchyTypes,
    ComputedAttributeTypes,
    DashboardTypes,
    DatasetTypes,
    DateDatasetTypes,
    MetricTypes,
    ParameterTypes,
    PluginTypes,
    VisualisationsTypes,
} from "../conts.js";
import { type DeclarativeEntityData, type EntityData, type ExportEntities } from "../types.js";

import { yamlAttributeHierarchyToDeclarative } from "./yamlAttributeHierarchyToDeclarative.js";
import { yamlComputedAttributeToDeclarative } from "./yamlComputedAttributeToDeclarative.js";
import { yamlDashboardToDeclarative } from "./yamlDashboardToDeclarative.js";
import { yamlDatasetToDeclarative } from "./yamlDatasetToDeclarative.js";
import { yamlDateDatesetToDeclarative } from "./yamlDateDatasetToDeclarative.js";
import { yamlMetricToDeclarative } from "./yamlMetricToDeclarative.js";
import { yamlParameterToDeclarative } from "./yamlParameterToDeclarative.js";
import { yamlPluginToDeclarative } from "./yamlPluginToDeclarative.js";
import { yamlVisualisationToDeclarative } from "./yamlVisualisationToDeclarative.js";

/**
 * Options of {@link yamlDocumentsToDeclarativeWorkspace}.
 *
 * @public
 */
export type YamlDocumentsToDeclarativeWorkspaceOptions = {
    /**
     * Data source of the datasets that do not name their own `data_source`.
     *
     * @remarks
     * A dataset with no `data_source` gets an empty data source id when this is not set.
     */
    dataSourceId?: string;
};

/**
 * Converts the AaC documents of one workspace to its declarative model.
 *
 * @remarks
 * The documents must be valid against the AaC schema. The ids must be unique in each collection of
 * the declarative model. For example, all chart types share the `visualizationObjects` collection.
 * The function does not report duplicate ids.
 *
 * The function generates the filter context ids. Two calls give different ids.
 *
 * @param documents - the AaC documents of the workspace
 * @param options - the conversion options
 * @returns the declarative model of the workspace
 *
 * @public
 */
export function yamlDocumentsToDeclarativeWorkspace(
    documents: EntityData[],
    options: YamlDocumentsToDeclarativeWorkspaceOptions = {},
): Required<DeclarativeWorkspaceModel> {
    const entities: ExportEntities = documents.map((document) => ({
        id: document.id,
        type: document.type,
        path: "",
        data: document,
    }));
    return yamlEntitiesToDeclarativeWorkspace(entities, options);
}

/**
 * Converts the entities of one workspace to its declarative model and stores the declarative form
 * of each entity in its `declarative` property.
 *
 * @internal
 */
export function yamlEntitiesToDeclarativeWorkspace(
    entities: ExportEntities,
    { dataSourceId }: YamlDocumentsToDeclarativeWorkspaceOptions = {},
): Required<DeclarativeWorkspaceModel> {
    const convert = <T extends EntityData, R extends DeclarativeEntityData>(
        types: string[],
        toDeclarative: (data: T) => R,
    ): R[] =>
        entities
            .filter((entity) => types.includes(entity.type))
            .map((entity) => {
                const declarative = toDeclarative(entity.data as T);
                entity.declarative = declarative;
                return declarative;
            });

    const dashboards = convert(DashboardTypes, (dashboard: Dashboard) =>
        yamlDashboardToDeclarative(entities, dashboard),
    );

    return {
        ldm: {
            datasets: convert(DatasetTypes, (dataset: Dataset) =>
                yamlDatasetToDeclarative(entities, dataset, dataSourceId),
            ),
            dateInstances: convert(DateDatasetTypes, yamlDateDatesetToDeclarative),
        },
        analytics: {
            metrics: convert(MetricTypes, yamlMetricToDeclarative),
            parameters: convert(ParameterTypes, yamlParameterToDeclarative),
            computedAttributes: convert(ComputedAttributeTypes, yamlComputedAttributeToDeclarative),
            visualizationObjects: convert(VisualisationsTypes, (visualisation: Visualisation) =>
                yamlVisualisationToDeclarative(entities, visualisation),
            ),
            analyticalDashboards: dashboards.map(({ dashboard }) => dashboard),
            filterContexts: dashboards.flatMap(dashboardFilterContexts),
            dashboardPlugins: convert(PluginTypes, yamlPluginToDeclarative),
            attributeHierarchies: convert(AttributeHierarchyTypes, yamlAttributeHierarchyToDeclarative),
        },
    };
}

// A V2 dashboard repeats its root filter context as the filter context of its first tab.
// A V3 dashboard has no root filter context.
function dashboardFilterContexts({
    filterContext,
    tabFilterContexts = [],
}: ReturnType<typeof yamlDashboardToDeclarative>): DeclarativeFilterContext[] {
    const contexts = filterContext ? [filterContext, ...tabFilterContexts] : tabFilterContexts;
    return contexts.filter((context, index) => contexts.findIndex(({ id }) => id === context.id) === index);
}
