// (C) 2019-2025 GoodData Corporation

import { keyBy } from "lodash-es";

import {
    JsonApiAnalyticalDashboardOutWithLinks,
    JsonApiAttributeOut,
    JsonApiAttributeOutDocument,
    JsonApiAttributeOutList,
    JsonApiAttributeOutWithLinks,
    JsonApiDatasetOutWithLinks,
    JsonApiFactOut,
    JsonApiFactOutDocument,
    JsonApiFactOutList,
    JsonApiFactOutWithLinks,
    JsonApiLabelLinkage,
    JsonApiLabelOutWithLinks,
    JsonApiMetricOutList,
    JsonApiMetricOutWithLinks,
    isDataSetItem,
    isLabelItem,
} from "@gooddata/api-client-tiger";
import {
    IMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
    newAttributeMetadataObject,
    newDashboardMetadataObject,
    newDataSetMetadataObject,
    newFactMetadataObject,
} from "@gooddata/sdk-backend-base";
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IDashboardMetadataObject,
    IDataSetMetadataObject,
    IFactMetadataObject,
    IMeasureMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import { convertLabelType } from "./LabelTypeConverter.js";
import { convertMetricFromBackend } from "./MetricConverter.js";
import { isInheritedObject } from "./ObjectInheritance.js";

export type MetadataObjectFromApi =
    | JsonApiAttributeOutWithLinks
    | JsonApiFactOutWithLinks
    | JsonApiMetricOutWithLinks
    | JsonApiLabelOutWithLinks
    | JsonApiDatasetOutWithLinks
    | JsonApiAnalyticalDashboardOutWithLinks;

export const commonMetadataObjectModifications =
    <TItem extends MetadataObjectFromApi, T extends IMetadataObjectBuilder>(item: TItem) =>
    (builder: T): T => {
        const { attributes } = item;
        return builder
            .id(item.id)
            .uri(item.links?.self ?? "")
            .title(attributes?.title || "")
            .description(attributes?.description || "")
            .tags(attributes?.tags || [])
            .isHidden(attributes && "isHidden" in attributes ? attributes.isHidden : undefined);
    };

export function createLabelMap(
    included: JsonApiAttributeOutDocument["included"] | undefined,
): Record<string, JsonApiLabelOutWithLinks> {
    if (!included) {
        return {};
    }

    const labels = included.filter(isLabelItem);

    return keyBy(labels, (t) => t.id);
}

export function createDataSetMap(
    included: JsonApiAttributeOutDocument["included"] | undefined,
): Record<string, JsonApiDatasetOutWithLinks> {
    if (!included) {
        return {};
    }

    const dataSets = included.filter(isDataSetItem);

    return keyBy(dataSets, (t) => t.id);
}

/**
 * Converts all labels of this attribute. The map contains sideloaded label information
 */
export function convertAttributeLabels(
    attribute: JsonApiAttributeOut | JsonApiAttributeOutWithLinks,
    labelsMap: Record<string, JsonApiLabelOutWithLinks>,
): IAttributeDisplayFormMetadataObject[] {
    const labelsRefs = (attribute.relationships?.labels?.data ?? []) as JsonApiLabelLinkage[];
    const defaultView = attribute.relationships?.defaultView?.data;

    return labelsRefs
        .map((ref) => {
            const label = labelsMap[ref.id];

            if (!label) {
                return undefined;
            }

            const isPrimary = !!label.attributes?.primary;

            const isDefault = defaultView ? defaultView.id === label.id : isPrimary;

            return convertLabelWithLinks(label, attribute.id, isDefault, isPrimary);
        })
        .filter((df): df is IAttributeDisplayFormMetadataObject => df !== undefined);
}

/**
 * Converts attribute when its sideloaded
 */
function convertAttributeWithLinks(
    attribute: JsonApiAttributeOutWithLinks,
    labelMap: Record<string, JsonApiLabelOutWithLinks>,
    dataSetMap: Record<string, JsonApiDatasetOutWithLinks>,
): IAttributeMetadataObject {
    return newAttributeMetadataObject(idRef(attribute.id, "attribute"), (m) =>
        m
            .modify(commonMetadataObjectModifications(attribute))
            .displayForms(convertAttributeLabels(attribute, labelMap))
            .isLocked(isInheritedObject(attribute))
            .dataSet(convertDatasetRelationship(attribute.relationships, dataSetMap)),
    );
}

/**
 * Converts attribute when its top-level
 */
function convertAttributeDocument(
    attributeDoc: JsonApiAttributeOutDocument,
    labelMap: Record<string, JsonApiLabelOutWithLinks>,
    dataSetMap: Record<string, JsonApiDatasetOutWithLinks>,
): IAttributeMetadataObject {
    const attribute = attributeDoc.data;

    return newAttributeMetadataObject(idRef(attribute.id, "attribute"), (m) =>
        m
            .id(attribute.id)
            .title(attribute.attributes?.title || "")
            .description(attribute.attributes?.description || "")
            .uri(attributeDoc.links?.self ?? "")
            .displayForms(convertAttributeLabels(attribute, labelMap))
            .isLocked(isInheritedObject(attribute))
            .isHidden(attribute.attributes?.isHidden)
            .dataSet(convertDatasetRelationship(attribute.relationships, dataSetMap)),
    );
}

/**
 * Converts label when its side-loaded. attributeId and isDefault must be passed by context because sideloaded
 * label does not contain relationships
 */
function convertLabelWithLinks(
    label: JsonApiLabelOutWithLinks,
    attributeId: string,
    isDefault: boolean,
    isPrimary: boolean,
): IAttributeDisplayFormMetadataObject {
    const geoCollectionId = label.attributes?.geoAreaConfig?.collection.id;
    return newAttributeDisplayFormMetadataObject(idRef(label.id, "displayForm"), (m) =>
        m
            .id(label.id)
            .title(label.attributes?.title || "")
            .description(label.attributes?.description || "")
            .uri(label.links?.self ?? "")
            .attribute(idRef(attributeId, "attribute"))
            .isDefault(isDefault)
            .isPrimary(isPrimary)
            .displayFormType(convertLabelType(label.attributes?.valueType))
            .geoAreaConfig(
                geoCollectionId
                    ? {
                          collectionId: geoCollectionId,
                      }
                    : undefined,
            ),
    );
}

//
//
//

/**
 * Converts result of a single attribute query with included labels into a {@link IAttributeMetadataObject}.
 *
 * @param attribute - response from backend
 */
export function convertAttributeWithSideloadedLabels(
    attribute: JsonApiAttributeOutDocument,
): IAttributeMetadataObject {
    const labelMap = createLabelMap(attribute.included);
    const dataSetMap = createDataSetMap(attribute.included);

    return convertAttributeDocument(attribute, labelMap, dataSetMap);
}

/**
 * Converts result of attributes query with included labels into list of {@link IAttributeMetadataObject}s
 *
 * @param attributes - response from backend
 */
export function convertAttributesWithSideloadedLabels(
    attributes: JsonApiAttributeOutList,
): IAttributeMetadataObject[] {
    const labelMap = createLabelMap(attributes.included);
    const dataSetMap = createDataSetMap(attributes.included);

    /*
     * Filter out date data set attributes. Purely because there is special processing for them
     * in catalog & code generators. Want to stick to that.
     *
     */

    return attributes.data.map((attribute) => convertAttributeWithLinks(attribute, labelMap, dataSetMap));
}

/**
 * Converts sideloaded facts list into list of {@link IFactMetadataObject}
 *
 * @param facts - sideloaded facts
 */
export function convertFactsWithLinks(facts: JsonApiFactOutList): IFactMetadataObject[] {
    const datasetMap = createDataSetMap(facts.included);

    return facts.data.map((fact) =>
        newFactMetadataObject(idRef(fact.id, "fact"), (m) =>
            m
                .modify(commonMetadataObjectModifications(fact))
                .isLocked(isInheritedObject(fact))
                .dataSet(convertDatasetRelationship(fact.relationships, datasetMap)),
        ),
    );
}

/**
 * Converts sideloaded fact into {@link IFactMetadataObject}
 *
 * @param factDoc - sideloaded fact
 */
export function convertFact(factDoc: JsonApiFactOutDocument): IFactMetadataObject {
    const fact = factDoc.data;
    const datasetMap = createDataSetMap(factDoc.included);

    return newFactMetadataObject(idRef(fact.id, "fact"), (m) =>
        m
            .id(fact.id)
            .title(fact.attributes?.title || "")
            .description(fact.attributes?.description || "")
            .tags(fact.attributes?.tags || [])
            .uri(factDoc.links?.self ?? "")
            .isLocked(isInheritedObject(fact))
            .isHidden(fact.attributes?.isHidden)
            .dataSet(convertDatasetRelationship(fact.relationships, datasetMap)),
    );
}

/**
 * Converts sideloaded metrics list into list of {@link IMeasureMetadataObject}
 *
 * @param metrics - sideloaded facts
 */
export function convertMetricsWithLinks(metrics: JsonApiMetricOutList): IMeasureMetadataObject[] {
    return metrics.data.map((metric) => convertMetricFromBackend(metric, metrics.included));
}

/**
 * Converts sideloaded dataset into {@link IDataSetMetadataObject}
 *
 * @param dataset - sideloaded dataset
 */
export function convertDatasetWithLinks(dataset: JsonApiDatasetOutWithLinks): IDataSetMetadataObject {
    return newDataSetMetadataObject(idRef(dataset.id, "dataSet"), (m) =>
        m.modify(commonMetadataObjectModifications(dataset)),
    );
}

type DatasetRelationships =
    | JsonApiAttributeOut["relationships"]
    | JsonApiAttributeOutWithLinks["relationships"]
    | JsonApiFactOut["relationships"]
    | JsonApiFactOutWithLinks["relationships"]
    | undefined;

/**
 * Converts side loaded dataset relationship into {@link IDataSetMetadataObject}
 */
function convertDatasetRelationship(
    relationships: DatasetRelationships,
    dataSetMap: Record<string, JsonApiDatasetOutWithLinks>,
): IDataSetMetadataObject | undefined {
    const datasetId = relationships?.dataset?.data?.id;
    if (!datasetId) {
        return undefined;
    }
    const dataset = dataSetMap[datasetId];
    if (!dataset) {
        return undefined;
    }
    return convertDatasetWithLinks(dataset);
}

/**
 * Converts sideloaded dashboard into {@link IDashboardMetadataObject}
 *
 * @param dashboard - sideloaded dashboard
 */
export function convertAnalyticalDashboardWithLinks(
    dashboard: JsonApiAnalyticalDashboardOutWithLinks,
): IDashboardMetadataObject {
    return newDashboardMetadataObject(idRef(dashboard.id, "analyticalDashboard"), (m) =>
        m.modify(commonMetadataObjectModifications(dashboard)),
    );
}
