// (C) 2019-2025 GoodData Corporation

import {
    type JsonApiAttributeOutWithLinks,
    type JsonApiDatasetOutWithLinks,
    type JsonApiFactOutWithLinks,
    type JsonApiLabelOutWithLinks,
    type JsonApiMetricOutIncludes,
    type JsonApiMetricOutWithLinks,
} from "@gooddata/api-client-tiger";
import {
    type AttributeDisplayFormMetadataObjectBuilder,
    type IGroupableCatalogItemBuilder,
    newAttributeDisplayFormMetadataObject,
    newCatalogAttribute,
    newCatalogDateAttribute,
    newCatalogDateDataset,
    newCatalogFact,
    newCatalogMeasure,
} from "@gooddata/sdk-backend-base";
import {
    type IAttributeDisplayFormMetadataObject,
    type ICatalogAttribute,
    type ICatalogDateAttribute,
    type ICatalogDateDataset,
    type ICatalogFact,
    type ICatalogMeasure,
    type IGroupableCatalogItemBase,
    type MetricType,
    type ObjRef,
    idRef,
} from "@gooddata/sdk-model";

import { convertDataSetItem } from "./DataSetConverter.js";
import { toSdkGranularity } from "./dateGranularityConversions.js";
import { convertLabelType } from "./LabelTypeConverter.js";
import { type MetadataObjectFromApi, commonMetadataObjectModifications } from "./MetadataConverter.js";
import { isInheritedObject } from "./ObjectInheritance.js";
import { convertUserIdentifier } from "./UsersConverter.js";

const commonGroupableCatalogItemModifications =
    <TItem extends IGroupableCatalogItemBase, T extends IGroupableCatalogItemBuilder<TItem>>(
        item: MetadataObjectFromApi,
    ) =>
    (builder: T) => {
        const tags = (item.attributes?.tags || []).map((tag) => idRef(tag, "tag"));
        return builder.groups(tags);
    };

const tigerLabelToDisplayFormMd = (
    label: JsonApiLabelOutWithLinks,
    attributeRef: ObjRef,
    defaultLabelId?: string,
): IAttributeDisplayFormMetadataObject => {
    return newAttributeDisplayFormMetadataObject(idRef(label.id, "displayForm"), (builder) => {
        const labelBuilder = commonMetadataObjectModifications(label)(
            builder,
        ) as AttributeDisplayFormMetadataObjectBuilder;
        labelBuilder.displayFormType(convertLabelType(label.attributes?.valueType));
        labelBuilder.attribute(attributeRef);
        labelBuilder.isPrimary(!!label.attributes?.primary);
        labelBuilder.isDefault(label.id === defaultLabelId);
        return labelBuilder;
    });
};

export const convertAttribute = (
    attribute: JsonApiAttributeOutWithLinks,
    defaultLabel: JsonApiLabelOutWithLinks,
    geoLabels: JsonApiLabelOutWithLinks[],
    allLabels: JsonApiLabelOutWithLinks[],
    dataSet?: JsonApiDatasetOutWithLinks,
): ICatalogAttribute => {
    const attributeRef = idRef(attribute.id, "attribute");

    const geoPinDisplayForms = geoLabels.map((df) => tigerLabelToDisplayFormMd(df, attributeRef));
    const displayForms = allLabels.map((df) => tigerLabelToDisplayFormMd(df, attributeRef, defaultLabel.id));
    const defaultDisplayForm = displayForms.find((df) => df.id === defaultLabel.id)!;
    const convertedDataSet = dataSet ? convertDataSetItem(dataSet) : undefined;
    const drillToAttributeLink = displayForms.find((df) => df.displayFormType === "GDC.link")?.ref;
    //
    return newCatalogAttribute((catalogA) =>
        catalogA
            .attribute(attributeRef, (a) =>
                a
                    .modify(commonMetadataObjectModifications(attribute))
                    .displayForms(displayForms)
                    .drillToAttributeLink(drillToAttributeLink),
            )
            .defaultDisplayForm(defaultDisplayForm)
            .geoPinDisplayForms(geoPinDisplayForms)
            .displayForms(displayForms)
            .dataSet(convertedDataSet)
            .modify(commonGroupableCatalogItemModifications(attribute)),
    );
};

export const convertMeasure = (
    measure: JsonApiMetricOutWithLinks,
    included: JsonApiMetricOutIncludes[] = [],
): ICatalogMeasure => {
    const { maql, format, metricType } = measure.attributes?.content ?? {};

    return newCatalogMeasure((catalogM) =>
        catalogM
            .measure(idRef(measure.id, "measure"), (m) =>
                m
                    .modify(commonMetadataObjectModifications(measure))
                    .expression(maql)
                    .format(format ?? "")
                    .isLocked(isInheritedObject(measure))
                    .tags(measure.attributes?.tags ?? [])
                    .metricType(metricType as MetricType | undefined)
                    .created(measure.attributes?.createdAt)
                    .createdBy(convertUserIdentifier(measure.relationships?.createdBy, included))
                    .updated(measure.attributes?.modifiedAt)
                    .updatedBy(convertUserIdentifier(measure.relationships?.modifiedBy, included)),
            )
            .modify(commonGroupableCatalogItemModifications(measure)),
    );
};

export const convertFact = (fact: JsonApiFactOutWithLinks): ICatalogFact => {
    return newCatalogFact((catalogF) =>
        catalogF
            .fact(idRef(fact.id, "fact"), (f) => f.modify(commonMetadataObjectModifications(fact)))
            .modify(commonGroupableCatalogItemModifications(fact)),
    );
};

export const convertDateAttribute = (
    attribute: JsonApiAttributeOutWithLinks,
    label: JsonApiLabelOutWithLinks,
    allLabels: JsonApiLabelOutWithLinks[],
): ICatalogDateAttribute => {
    const attributeRef = idRef(attribute.id, "attribute");

    const displayForms = allLabels.map((df) => tigerLabelToDisplayFormMd(df, attributeRef));
    const defaultDisplayForm = displayForms.find((df) => df.id === label.id)!;

    return newCatalogDateAttribute((dateAttribute) => {
        return dateAttribute
            .granularity(toSdkGranularity(attribute.attributes!.granularity!))
            .attribute(idRef(attribute.id, "attribute"), (a) =>
                a.modify(commonMetadataObjectModifications(attribute)).displayForms(displayForms),
            )
            .defaultDisplayForm(defaultDisplayForm);
    });
};

export const convertDateDataset = (
    dataset: JsonApiDatasetOutWithLinks,
    attributes: ICatalogDateAttribute[],
): ICatalogDateDataset => {
    return newCatalogDateDataset((dateDataset) => {
        return dateDataset
            .relevance(0)
            .dataSet(idRef(dataset.id, "dataSet"), (m) => {
                return m
                    .id(dataset.id)
                    .title(dataset.attributes?.title || "")
                    .description(dataset.attributes?.description || "")
                    .uri(dataset.links!.self)
                    .production(true)
                    .unlisted(false);
            })
            .dateAttributes(attributes);
    });
};
