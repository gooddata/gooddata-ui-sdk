// (C) 2019-2021 GoodData Corporation
import {
    JsonApiAttribute,
    JsonApiAttributeDocument,
    JsonApiAttributeList,
    JsonApiAttributeWithLinks,
    JsonApiDatasetWithLinks,
    JsonApiFactWithLinks,
    JsonApiLabel,
    JsonApiLabelDocument,
    JsonApiLabelWithLinks,
    JsonApiLinkage,
    JsonApiMetricWithLinks,
} from "@gooddata/api-client-tiger";
import keyBy from "lodash/keyBy";
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IDataSetMetadataObject,
} from "@gooddata/sdk-backend-spi";
import {
    IMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
    newAttributeMetadataObject,
    newDataSetMetadataObject,
} from "@gooddata/sdk-backend-base";
import { idRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

export type MetadataObjectFromApi =
    | JsonApiAttributeWithLinks
    | JsonApiFactWithLinks
    | JsonApiMetricWithLinks
    | JsonApiLabelWithLinks
    | JsonApiDatasetWithLinks;

export const commonMetadataObjectModifications = <
    TItem extends MetadataObjectFromApi,
    T extends IMetadataObjectBuilder
>(
    item: TItem,
) => (builder: T): T =>
    builder
        .id(item.id)
        .uri(item.links!.self)
        .title(item.attributes?.title || "")
        .description(item.attributes?.description || "");

function createLabelMap(included: any[] | undefined): Record<string, JsonApiLabelWithLinks> {
    if (!included) {
        return {};
    }

    const labels: JsonApiLabel[] = included
        .map((include) => {
            if ((include as JsonApiLinkage).type !== "label") {
                return null;
            }

            return include as JsonApiLabelWithLinks;
        })
        .filter((include): include is JsonApiLabelWithLinks => include !== null);

    return keyBy(labels, (t) => t.id);
}

/**
 * Converts all labels of this attribute. The map contains sideloaded label information
 */
function convertAttributeLabels(
    attribute: JsonApiAttribute,
    labelsMap: Record<string, JsonApiLabelWithLinks>,
): IAttributeDisplayFormMetadataObject[] {
    const labelsRefs = attribute.relationships?.labels?.data as JsonApiLinkage[];

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
    attribute: JsonApiAttributeWithLinks,
    labels: Record<string, JsonApiLabel>,
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
    attributeDoc: JsonApiAttributeDocument,
    labels: Record<string, JsonApiLabel>,
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
    label: JsonApiLabelWithLinks,
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
function convertLabelDocument(labelDoc: JsonApiLabelDocument): IAttributeDisplayFormMetadataObject {
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
    labelDoc: JsonApiLabelDocument,
): IAttributeDisplayFormMetadataObject {
    return convertLabelDocument(labelDoc);
}

/**
 * Converts result of a single attribute query with included labels into a {@link IAttributeMetadataObject}.
 *
 * @param attribute - response from backend
 */
export function convertAttributeWithSideloadedLabels(
    attribute: JsonApiAttributeDocument,
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
    attributes: JsonApiAttributeList,
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
export function convertDatasetWithLinks(dataset: JsonApiDatasetWithLinks): IDataSetMetadataObject {
    return newDataSetMetadataObject(idRef(dataset.id, "dataSet"), (m) =>
        m.modify(commonMetadataObjectModifications(dataset)),
    );
}
