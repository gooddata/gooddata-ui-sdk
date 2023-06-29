// (C) 2019-2023 GoodData Corporation
import {
    JsonApiAnalyticalDashboardOutWithLinks,
    JsonApiAttributeOut,
    JsonApiAttributeOutDocument,
    JsonApiAttributeOutList,
    JsonApiAttributeOutWithLinks,
    JsonApiDatasetOutWithLinks,
    JsonApiFactOutWithLinks,
    JsonApiLabelLinkage,
    JsonApiLabelOutWithLinks,
    JsonApiLabelOutWithLinksTypeEnum,
    JsonApiMetricOutWithLinks,
} from "@gooddata/api-client-tiger";
import keyBy from "lodash/keyBy.js";
import {
    IMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
    newAttributeMetadataObject,
    newDashboardMetadataObject,
    newDataSetMetadataObject,
} from "@gooddata/sdk-backend-base";
import {
    idRef,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IDataSetMetadataObject,
    IDashboardMetadataObject,
} from "@gooddata/sdk-model";
import { convertLabelType } from "./LabelTypeConverter.js";

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
        return include.type === JsonApiLabelOutWithLinksTypeEnum.LABEL;
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
    const defaultView = attribute.relationships?.defaultView?.data;

    return labelsRefs
        .map((ref) => {
            const label = labelsMap[ref.id];

            if (!label) {
                return undefined;
            }

            const isDefault = defaultView ? defaultView.id === label.id : !!label.attributes?.primary;

            return convertLabelWithLinks(label, attribute.id, isDefault);
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
 * Converts label when its side-loaded. attributeId and isDefault must be passed by context because sideloaded
 * label does not contain relationships
 */
function convertLabelWithLinks(
    label: JsonApiLabelOutWithLinks,
    attributeId: string,
    isDefault: boolean,
): IAttributeDisplayFormMetadataObject {
    return newAttributeDisplayFormMetadataObject(idRef(label.id, "displayForm"), (m) =>
        m
            .id(label.id)
            .title(label.attributes?.title || "")
            .description(label.attributes?.description || "")
            .uri(label.links!.self)
            .attribute(idRef(attributeId, "attribute"))
            .isDefault(isDefault)
            .displayFormType(convertLabelType(label.attributes?.valueType)),
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
