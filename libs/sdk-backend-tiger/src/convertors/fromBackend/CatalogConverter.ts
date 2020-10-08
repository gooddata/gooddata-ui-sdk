// (C) 2019-2020 GoodData Corporation
import {
    ICatalogAttribute,
    ICatalogDateAttribute,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogGroup,
    ICatalogMeasure,
    IdentifierRef,
    idRef,
    IGroupableCatalogItemBase,
    IGroupableCatalogItemBuilder,
    IMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
    newCatalogAttribute,
    newCatalogDateAttribute,
    newCatalogDateDataset,
    newCatalogFact,
    newCatalogMeasure,
} from "@gooddata/sdk-model";
import {
    AttributeResourceSchema,
    DatasetResourceSchema,
    FactResourceSchema,
    LabelResourceSchema,
    MetricResourceSchema,
    TagResourceReference,
    TagResourceSchema,
} from "@gooddata/api-client-tiger";
import { toSdkGranularity } from "./dateGranularityConversions";

type MetadataObjectResourceSchema =
    | AttributeResourceSchema
    | FactResourceSchema
    | MetricResourceSchema
    | LabelResourceSchema;

const commonMetadataObjectModifications = <
    TItem extends MetadataObjectResourceSchema,
    T extends IMetadataObjectBuilder
>(
    item: TItem,
) => (builder: T) =>
    builder
        .id(item.id)
        .uri((item.links as any).self)
        .title(item.attributes.title || "")
        .description(item.attributes.description || "");

const commonGroupableCatalogItemModifications = <
    TItem extends IGroupableCatalogItemBase,
    T extends IGroupableCatalogItemBuilder<TItem>
>(
    item: MetadataObjectResourceSchema,
) => (builder: T) => {
    const tagRefs = (((item.relationships as any)?.tags?.data ||
        []) as TagResourceReference[]).map((tagRef) => idRef(tagRef.id, "tag"));

    return builder.groups(tagRefs);
};

export const convertAttribute = (
    attribute: AttributeResourceSchema,
    defaultLabel: LabelResourceSchema,
    geoLabels: LabelResourceSchema[],
    allLabels: LabelResourceSchema[],
): ICatalogAttribute => {
    const geoPinDisplayForms = geoLabels.map((label) => {
        return newAttributeDisplayFormMetadataObject(
            idRef(label.id, "displayForm"),
            commonMetadataObjectModifications(label),
        );
    });
    const displayForms = allLabels.map((label) => {
        return newAttributeDisplayFormMetadataObject(
            idRef(label.id, "displayForm"),
            commonMetadataObjectModifications(label),
        );
    });

    return newCatalogAttribute((catalogA) =>
        catalogA
            .attribute(idRef(attribute.id, "attribute"), (a) =>
                a.modify(commonMetadataObjectModifications(attribute)),
            )
            .defaultDisplayForm(idRef(defaultLabel.id, "displayForm"), (df) =>
                df.modify(commonMetadataObjectModifications(defaultLabel)),
            )
            .geoPinDisplayForms(geoPinDisplayForms)
            .displayForms(displayForms)
            .modify(commonGroupableCatalogItemModifications(attribute)),
    );
};

export const convertMeasure = (measure: MetricResourceSchema): ICatalogMeasure => {
    const {
        attributes: { maql },
    } = measure;

    return newCatalogMeasure((catalogM) =>
        catalogM
            .measure(idRef(measure.id, "measure"), (m) =>
                m.modify(commonMetadataObjectModifications(measure)).expression(maql || ""),
            )
            .modify(commonGroupableCatalogItemModifications(measure)),
    );
};

export const convertFact = (fact: FactResourceSchema): ICatalogFact => {
    return newCatalogFact((catalogF) =>
        catalogF
            .fact(idRef(fact.id, "fact"), (f) => f.modify(commonMetadataObjectModifications(fact)))
            .modify(commonGroupableCatalogItemModifications(fact)),
    );
};

export const convertDateAttribute = (
    attribute: AttributeResourceSchema,
    label: LabelResourceSchema,
): ICatalogDateAttribute => {
    return newCatalogDateAttribute((dateAttribute) => {
        return dateAttribute
            .granularity(toSdkGranularity(attribute.attributes.granularity!))
            .attribute(idRef(attribute.id, "attribute"), (a) =>
                a.modify(commonMetadataObjectModifications(attribute)),
            )
            .defaultDisplayForm(idRef(label.id, "displayForm"), (df) =>
                df.modify(commonMetadataObjectModifications(label)),
            );
    });
};

export const convertDateDataset = (
    dataset: DatasetResourceSchema,
    attributes: ICatalogDateAttribute[],
): ICatalogDateDataset => {
    return newCatalogDateDataset((dateDataset) => {
        return dateDataset
            .relevance(0)
            .dataSet(idRef(dataset.id, "dataSet"), (m) => {
                return m
                    .id(dataset.id)
                    .uri((dataset.links as any)?.self)
                    .title(dataset.attributes.title || "")
                    .description(dataset.attributes.description || "")
                    .production(true)
                    .unlisted(false);
            })
            .dateAttributes(attributes);
    });
};

export const convertGroup = (tag: TagResourceSchema): ICatalogGroup => {
    const tagRef: IdentifierRef = {
        identifier: tag.id,
        type: "tag",
    };

    const group: ICatalogGroup = {
        title: tag.attributes.title || "",
        tag: tagRef,
    };

    return group;
};
