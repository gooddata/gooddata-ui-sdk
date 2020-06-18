// (C) 2019-2020 GoodData Corporation
import {
    CatalogItemType,
    CatalogItem,
    ICatalogDateDataset,
    ICatalogAttribute,
    ICatalogMeasure,
    ICatalogFact,
    ICatalogDateAttribute,
    ICatalogGroup,
    newCatalogAttribute,
    uriRef,
    newCatalogGroup,
    idRef,
    newCatalogMeasure,
    newCatalogFact,
    newCatalogDateAttribute,
    newCatalogDateDataset,
    IMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
    IAttributeDisplayFormMetadataObject,
    ObjRef,
} from "@gooddata/sdk-model";
import { GdcCatalog, GdcMetadata, GdcDateDataSets } from "@gooddata/gd-bear-model";
import { IDisplayFormByKey } from "../../types/catalog";

export type CompatibleCatalogItemType = Exclude<CatalogItemType, "dateDataset">;
export type CompatibleCatalogItem = Exclude<CatalogItem, ICatalogDateDataset>;

export const isCompatibleCatalogItemType = (type: CatalogItemType): type is CompatibleCatalogItemType =>
    type !== "dateDataset";

const bearItemTypeByCatalogItemType: {
    [catalogItemType in CompatibleCatalogItemType]: GdcCatalog.CatalogItemType;
} = {
    attribute: "attribute",
    fact: "fact",
    measure: "metric",
};

export const convertItemType = (type: CompatibleCatalogItemType): GdcCatalog.CatalogItemType => {
    const bearItemType = bearItemTypeByCatalogItemType[type];
    return bearItemType;
};

export const bearObjectMetaToBearRef = (obj: GdcMetadata.IObjectMeta) => uriRef(obj.uri);
export const bearCatalogItemToBearRef = (obj: GdcCatalog.CatalogItem) => uriRef(obj.links.self);

export const bearGroupableCatalogItemToTagRefs = (item: { groups?: string[] }) => {
    const { groups = [] } = item;
    return groups.map((tagId) => idRef(tagId));
};

const commonMetadataModifications = <T extends IMetadataObjectBuilder>(item: GdcMetadata.IObjectMeta) => (
    builder: T,
) => builder.id(item.identifier).uri(item.uri).title(item.title).description(item.summary).unlisted(false);

const commonCatalogItemModifications = <T extends IMetadataObjectBuilder>(item: GdcCatalog.CatalogItem) => (
    builder: T,
) =>
    builder
        .id(item.identifier)
        .uri(item.links.self)
        .title(item.title)
        .description(item.summary)
        .unlisted(false);

const convertDisplayForm = (
    df: GdcMetadata.IAttributeDisplayForm,
    attrRef: ObjRef,
): IAttributeDisplayFormMetadataObject => {
    const ref = bearObjectMetaToBearRef(df.meta);

    return newAttributeDisplayFormMetadataObject(ref, (m) => {
        return m.modify(commonMetadataModifications(df.meta)).attribute(attrRef);
    });
};

export const convertAttribute = (
    attribute: GdcCatalog.ICatalogAttribute,
    displayForms: IDisplayFormByKey,
): ICatalogAttribute => {
    const attrRef = bearCatalogItemToBearRef(attribute);
    const defaultDisplayForm = displayForms[attribute.links.defaultDisplayForm];
    const geoPinDisplayForms = (attribute.links.geoPinDisplayForms ?? []).map((uri) => displayForms[uri]);
    const groups = bearGroupableCatalogItemToTagRefs(attribute);

    return newCatalogAttribute((catalogA) =>
        catalogA
            .attribute(attrRef, (a) => a.modify(commonCatalogItemModifications(attribute)))
            .defaultDisplayForm(convertDisplayForm(defaultDisplayForm, attrRef))
            .geoPinDisplayForms(geoPinDisplayForms.map((df) => convertDisplayForm(df, attrRef)))
            .groups(groups),
    );
};

export const convertMeasure = (metric: GdcCatalog.ICatalogMetric): ICatalogMeasure => {
    const measureRef = bearCatalogItemToBearRef(metric);
    const groups = bearGroupableCatalogItemToTagRefs(metric);

    return newCatalogMeasure((catalogM) =>
        catalogM
            .measure(measureRef, (m) =>
                m
                    .modify(commonCatalogItemModifications(metric))
                    .expression(metric.expression)
                    .format(metric.format),
            )
            .groups(groups),
    );
};

export const convertFact = (fact: GdcCatalog.ICatalogFact): ICatalogFact => {
    const factRef = bearCatalogItemToBearRef(fact);
    const groups = bearGroupableCatalogItemToTagRefs(fact);

    return newCatalogFact((catalogF) =>
        catalogF.fact(factRef, (f) => f.modify(commonCatalogItemModifications(fact))).groups(groups),
    );
};

const convertDateDataSetAttribute = (
    dateDatasetAttribute: GdcDateDataSets.IDateDataSetAttribute,
): ICatalogDateAttribute => {
    const { attributeMeta, defaultDisplayFormMeta } = dateDatasetAttribute;
    const attributeRef = bearObjectMetaToBearRef(attributeMeta);
    const displayFormRef = bearObjectMetaToBearRef(defaultDisplayFormMeta);

    return newCatalogDateAttribute((catalogDa) =>
        catalogDa
            .attribute(attributeRef, (a) => a.modify(commonMetadataModifications(attributeMeta)))
            .defaultDisplayForm(displayFormRef, (df) =>
                df.modify(commonMetadataModifications(defaultDisplayFormMeta)),
            )
            .granularity(dateDatasetAttribute.type),
    );
};

export const convertDateDataset = (dateDataset: GdcDateDataSets.IDateDataSet): ICatalogDateDataset => {
    const { availableDateAttributes = [] } = dateDataset;
    const dateDatasetRef = bearObjectMetaToBearRef(dateDataset.meta);
    const dateAttributes = availableDateAttributes.map(convertDateDataSetAttribute);

    return newCatalogDateDataset((catalogDs) =>
        catalogDs
            .dataSet(dateDatasetRef, (ds) => ds.modify(commonMetadataModifications(dateDataset.meta)))
            .dateAttributes(dateAttributes)
            .relevance(dateDataset.relevance),
    );
};

export const convertWrappedFact = (fact: GdcMetadata.IWrappedFact): ICatalogFact => {
    const { meta } = fact.fact;
    const factRef = uriRef(meta.uri);

    return newCatalogFact((catalogFact) =>
        catalogFact.fact(factRef, (f) =>
            f
                .id(meta.identifier)
                .uri(meta.uri)
                .title(meta.title)
                .description(meta.summary)
                .production(meta.isProduction === 1)
                .unlisted(meta.unlisted === 1),
        ),
    );
};

export const convertMetric = (metric: GdcMetadata.IWrappedMetric): ICatalogMeasure => {
    const { content, meta } = metric.metric;
    const measureRef = uriRef(meta.uri);

    return newCatalogMeasure((catalogMeasure) =>
        catalogMeasure.measure(measureRef, (m) =>
            m
                .expression(content.expression)
                .format(content.format ?? "#,#.##")
                .id(meta.identifier)
                .uri(meta.uri)
                .title(meta.title)
                .description(meta.summary)
                .unlisted(meta.unlisted === 1),
        ),
    );
};

export const convertGroup = (group: GdcCatalog.ICatalogGroup): ICatalogGroup => {
    return newCatalogGroup((catalogG) => catalogG.title(group.title).tag(idRef(group.identifier)));
};
