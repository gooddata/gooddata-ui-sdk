// (C) 2019-2024 GoodData Corporation
import {
    idRef,
    ICatalogAttribute,
    ICatalogFact,
    ICatalogMeasure,
    ICatalogDateDataset,
    ICatalogDateAttribute,
    IGroupableCatalogItemBase,
    IAttributeDisplayFormMetadataObject,
    ObjRef,
} from "@gooddata/sdk-model";
import {
    JsonApiAttributeOutWithLinks,
    JsonApiDatasetOutWithLinks,
    JsonApiFactOutWithLinks,
    JsonApiLabelOutWithLinks,
    JsonApiMetricOutWithLinks,
    JsonApiMetricOutIncludes,
} from "@gooddata/api-client-tiger";
import { toSdkGranularity } from "./dateGranularityConversions.js";
import {
    AttributeDisplayFormMetadataObjectBuilder,
    IGroupableCatalogItemBuilder,
    newAttributeDisplayFormMetadataObject,
    newCatalogAttribute,
    newCatalogDateAttribute,
    newCatalogDateDataset,
    newCatalogFact,
    newCatalogMeasure,
} from "@gooddata/sdk-backend-base";
import { commonMetadataObjectModifications, MetadataObjectFromApi } from "./MetadataConverter.js";
import { isInheritedObject } from "./ObjectInheritance.js";
import { convertLabelType } from "./LabelTypeConverter.js";
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
): ICatalogAttribute => {
    const attributeRef = idRef(attribute.id, "attribute");

    const geoPinDisplayForms = geoLabels.map((df) => tigerLabelToDisplayFormMd(df, attributeRef));
    const displayForms = allLabels.map((df) => tigerLabelToDisplayFormMd(df, attributeRef, defaultLabel.id));
    const defaultDisplayForm = displayForms.find((df) => df.id === defaultLabel.id)!;

    return newCatalogAttribute((catalogA) =>
        catalogA
            .attribute(attributeRef, (a) =>
                a.modify(commonMetadataObjectModifications(attribute)).displayForms(displayForms),
            )
            .defaultDisplayForm(defaultDisplayForm)
            .geoPinDisplayForms(geoPinDisplayForms)
            .displayForms(displayForms)
            .modify(commonGroupableCatalogItemModifications(attribute)),
    );
};

export const convertMeasure = (
    measure: JsonApiMetricOutWithLinks,
    included: JsonApiMetricOutIncludes[] = [],
): ICatalogMeasure => {
    const { maql = "", format = "" } = measure.attributes?.content || {};

    return newCatalogMeasure((catalogM) =>
        catalogM
            .measure(idRef(measure.id, "measure"), (m) =>
                m
                    .modify(commonMetadataObjectModifications(measure))
                    .expression(maql)
                    .format(format)
                    .isLocked(isInheritedObject(measure))
                    .tags(measure.attributes?.tags ?? [])
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
