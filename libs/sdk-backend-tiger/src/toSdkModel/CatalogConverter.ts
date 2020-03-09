// (C) 2019-2020 GoodData Corporation
import {
    ICatalogAttribute,
    idRef,
    ICatalogMeasure,
    ICatalogFact,
    ICatalogGroup,
    IdentifierRef,
    newCatalogAttribute,
    IMetadataObjectBuilder,
    newCatalogMeasure,
    newCatalogFact,
    IGroupableCatalogItemBase,
    IGroupableCatalogItemBuilder,
} from "@gooddata/sdk-model";
import {
    AttributesResourceSchema,
    MetricsResourceSchema,
    FactsResourceSchema,
    TagsResourceSchema,
    LabelsResourceSchema,
    TagsResourceReference,
} from "@gooddata/gd-tiger-client";

type MetadataObjectResourceSchema =
    | AttributesResourceSchema
    | FactsResourceSchema
    | MetricsResourceSchema
    | LabelsResourceSchema;

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
    const tagRefs = (((item.relationships as any)?.tags?.data || []) as TagsResourceReference[]).map(tagRef =>
        idRef(tagRef.id, "tag"),
    );

    return builder.groups(tagRefs);
};

export const convertAttribute = (
    attribute: AttributesResourceSchema,
    defaultDisplayForm: LabelsResourceSchema,
): ICatalogAttribute => {
    return newCatalogAttribute(catalogA =>
        catalogA
            .attribute(idRef(attribute.id, "attribute"), a =>
                a.modify(commonMetadataObjectModifications(attribute)),
            )
            .defaultDisplayForm(idRef(defaultDisplayForm.id, "displayForm"), df =>
                df.modify(commonMetadataObjectModifications(defaultDisplayForm)),
            )
            .modify(commonGroupableCatalogItemModifications(attribute)),
    );
};

export const convertMeasure = (measure: MetricsResourceSchema): ICatalogMeasure => {
    const {
        attributes: { maql },
    } = measure;

    return newCatalogMeasure(catalogM =>
        catalogM
            .measure(idRef(measure.id, "measure"), m =>
                m.modify(commonMetadataObjectModifications(measure)).expression(maql || ""),
            )
            .modify(commonGroupableCatalogItemModifications(measure)),
    );
};

export const convertFact = (fact: FactsResourceSchema): ICatalogFact => {
    return newCatalogFact(catalogF =>
        catalogF
            .fact(idRef(fact.id, "fact"), f => f.modify(commonMetadataObjectModifications(fact)))
            .modify(commonGroupableCatalogItemModifications(fact)),
    );
};

export const convertGroup = (tag: TagsResourceSchema): ICatalogGroup => {
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
