// (C) 2019-2021 GoodData Corporation
import {
    JsonApiAnalyticalDashboardOutWithLinks,
    JsonApiAttributeOut,
    JsonApiAttributeOutDocument,
    JsonApiAttributeOutList,
    JsonApiAttributeOutWithLinks,
    JsonApiDatasetOutWithLinks,
    JsonApiFactOutWithLinks,
    JsonApiLabelOutDocument,
    JsonApiLabelOutWithLinks,
    JsonApiLabelOutWithLinksTypeEnum,
    JsonApiLabelLinkage,
    JsonApiMetricOutWithLinks,
} from "@gooddata/api-client-tiger";
import keyBy from "lodash/keyBy";
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IDashboardMetadataObject,
    IDataSetMetadataObject,
} from "@gooddata/sdk-backend-spi";
import {
    IMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
    newAttributeMetadataObject,
    newDashboardMetadataObject,
    newDataSetMetadataObject,
} from "@gooddata/sdk-backend-base";
import { idRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

export type MetadataObjectFromApi =
    | JsonApiAttributeOutWithLinks
    | JsonApiFactOutWithLinks
    | JsonApiMetricOutWithLinks
    | JsonApiLabelOutWithLinks
    | JsonApiDatasetOutWithLinks
    | JsonApiAnalyticalDashboardOutWithLinks;

export const commonMetadataObjectModifications =
    <TItem extends MetadataObjectFromApi, T extends IMetadataObjectBuilder>(item: TItem) =>
    (builder: T): T =>
        builder
            .id(item.id)
            .uri(item.links!.self)
            .title(item.attributes?.title || "")
            .description(item.attributes?.description || "");

function createLabelMap(
    included: JsonApiAttributeOutDocument["included"] | undefined,
): Record<string, JsonApiLabelOutWithLinks> {
    if (!included) {
        return {};
    }

    const labels = included.filter((include): include is JsonApiLabelOutWithLinks => {
        return include.type === JsonApiLabelOutWithLinksTypeEnum.Label;
    });

    return keyBy(labels, (t) => t.id);
}

/**
 * Converts all labels of this attribute. The map contains sideloaded label information
 */
function convertAttributeLabels(
    attribute: JsonApiAttributeOut | JsonApiAttributeOutWithLinks,
    labelsMap: Record<string, JsonApiLabelOutWithLinks>,
): IAttributeDisplayFormMetadataObject[] {
    const labelsRefs = attribute.relationships?.labels?.data as JsonApiLabelLinkage[];

    return labelsRefs
        .map((ref) => {
            const label = labelsMap[ref.id];

            if (!label) {
                return undefined;
            }

            return convertLabelWithLinks(label, attribute.id);
        })
        .filter((df): df is IAttributeDisplayFormMetadataObject => df !== undefined);
}

/**
 * Converts attribute when its sideloaded
 */
function convertAttributeWithLinks(
    attribute: JsonApiAttributeOutWithLinks,
    labels: Record<string, JsonApiLabelOutWithLinks>,
): IAttributeMetadataObject {
    return newAttributeMetadataObject(idRef(attribute.id, "attribute"), (m) =>
        m
            .modify(commonMetadataObjectModifications(attribute))
            .displayForms(convertAttributeLabels(attribute, labels)),
    );
}

/**
 * Converts attribute when its top-level
 */
function convertAttributeDocument(
    attributeDoc: JsonApiAttributeOutDocument,
    labels: Record<string, JsonApiLabelOutWithLinks>,
): IAttributeMetadataObject {
    const attribute = attributeDoc.data;

    return newAttributeMetadataObject(idRef(attribute.id, "attribute"), (m) =>
        m
            .id(attribute.id)
            .title(attribute.attributes?.title || "")
            .description(attribute.attributes?.description || "")
            .uri(attributeDoc.links!.self)
            .displayForms(convertAttributeLabels(attribute, labels)),
    );
}

/**
 * Converts label when its side-loaded. attributeId must be passed by context because sideloaded label does not
 * contain relationships
 */
function convertLabelWithLinks(
    label: JsonApiLabelOutWithLinks,
    attributeId: string,
): IAttributeDisplayFormMetadataObject {
    return newAttributeDisplayFormMetadataObject(idRef(label.id, "displayForm"), (m) =>
        m
            .id(label.id)
            .title(label.attributes?.title || "")
            .description(label.attributes?.description || "")
            .uri(label.links!.self)
            .attribute(idRef(attributeId, "attribute"))
            .isDefault(label.attributes!.primary),
    );
}

/**
 * Converts label when its top-level
 */
function convertLabelDocument(labelDoc: JsonApiLabelOutDocument): IAttributeDisplayFormMetadataObject {
    const label = labelDoc.data;
    const attributes = label.attributes;

    invariant(attributes);

    return newAttributeDisplayFormMetadataObject(idRef(label.id, "displayForm"), (m) =>
        m
            .id(label.id)
            .title(attributes.title || "")
            .description(attributes.description || "")
            .uri(labelDoc.links!.self)
            .isDefault(attributes.primary)
            .attribute(idRef(label.relationships!.attribute!.data!.id, "attribute")),
    );
}

//
//
//

/**
 * Converts result of a single label query with included attribute into a {@link IAttributeDisplayFormMetadataObject};
 *
 * Note: the attribute must be sideloaded otherwise the label won't contain attribute relationship and it would not be possible
 * to set attribute ref on the display form.
 *
 * @param labelDoc - response from backend
 */
export function convertLabelWithSideloadedAttribute(
    labelDoc: JsonApiLabelOutDocument,
): IAttributeDisplayFormMetadataObject {
    return convertLabelDocument(labelDoc);
}

/**
 * Converts result of a single attribute query with included labels into a {@link IAttributeMetadataObject}.
 *
 * @param attribute - response from backend
 */
export function convertAttributeWithSideloadedLabels(
    attribute: JsonApiAttributeOutDocument,
): IAttributeMetadataObject {
    const labels = createLabelMap(attribute.included);

    return convertAttributeDocument(attribute, labels);
}

/**
 * Converts result of attributes query with included labels into list of {@link IAttributeMetadataObject}s
 *
 * @param attributes - response from backend
 */
export function convertAttributesWithSideloadedLabels(
    attributes: JsonApiAttributeOutList,
): IAttributeMetadataObject[] {
    const labels = createLabelMap(attributes.included);

    /*
     * Filter out date data set attributes. Purely because there is special processing for them
     * in catalog & code generators. Want to stick to that.
     *
     */

    return attributes.data.map((attribute) => convertAttributeWithLinks(attribute, labels));
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
