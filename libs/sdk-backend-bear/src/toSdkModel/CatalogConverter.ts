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
} from "@gooddata/sdk-model";
import { GdcCatalog, GdcMetadata, GdcDateDataSets } from "@gooddata/gd-bear-model";

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

export const bearMetadataObjectToBearRef = (obj: { links: { self: string } }) => uriRef(obj.links.self);

export const bearGroupableCatalogItemToTagRefs = (item: { groups?: string[] }) => {
    const { groups = [] } = item;
    return groups.map(tagId => idRef(tagId));
};

const commonCatalogItemModifications = <
    TItem extends {
        identifier: string;
        title: string;
        summary: string;
        links?: {
            self: string;
        };
    },
    T extends IMetadataObjectBuilder
>(
    item: TItem,
) => (builder: T) =>
    builder
        .id(item.identifier)
        .uri(item.links!.self)
        .title(item.title || "")
        .description(item.summary || "");

export const convertAttribute = (
    attribute: GdcCatalog.ICatalogAttribute,
    defaultDisplayForm: GdcMetadata.IAttributeDisplayForm,
): ICatalogAttribute => {
    const attrRef = bearMetadataObjectToBearRef(attribute);
    const displayFormRef = bearMetadataObjectToBearRef(defaultDisplayForm);
    const groups = bearGroupableCatalogItemToTagRefs(attribute);

    return newCatalogAttribute(catalogA =>
        catalogA
            .attribute(attrRef, a => a.modify(commonCatalogItemModifications(attribute)))
            .defaultDisplayForm(displayFormRef, df =>
                df
                    .id(defaultDisplayForm.meta.identifier)
                    .uri(defaultDisplayForm.meta.uri)
                    .title(defaultDisplayForm.meta.title)
                    .description(defaultDisplayForm.meta.summary)
                    .attribute(attrRef),
            )
            .groups(groups),
    );
};

export const convertMeasure = (metric: GdcCatalog.ICatalogMetric): ICatalogMeasure => {
    const measureRef = bearMetadataObjectToBearRef(metric);
    const groups = bearGroupableCatalogItemToTagRefs(metric);

    return newCatalogMeasure(catalogM =>
        catalogM
            .measure(measureRef, m =>
                m
                    .modify(commonCatalogItemModifications(metric))
                    .expression(metric.expression)
                    .format(metric.format),
            )
            .groups(groups),
    );
};

export const convertFact = (fact: GdcCatalog.ICatalogFact): ICatalogFact => {
    const factRef = bearMetadataObjectToBearRef(fact);

    return newCatalogFact(catalogF =>
        catalogF.fact(factRef, f => f.modify(commonCatalogItemModifications(fact))),
    );
};

const convertDateDataSetAttribute = (
    dateDatasetAttribute: GdcDateDataSets.IDateDataSetAttribute,
): ICatalogDateAttribute => {
    const { attributeMeta, defaultDisplayFormMeta } = dateDatasetAttribute;
    const attributeRef = uriRef(attributeMeta.uri);
    const displayFormRef = uriRef(defaultDisplayFormMeta.uri);

    return newCatalogDateAttribute(catalogDa =>
        catalogDa
            .attribute(attributeRef, a => a.modify(commonCatalogItemModifications(attributeMeta)))
            .defaultDisplayForm(displayFormRef, df =>
                df.modify(commonCatalogItemModifications(defaultDisplayFormMeta)),
            )
            .granularity(dateDatasetAttribute.type),
    );
};

export const convertDateDataset = (dateDataset: GdcDateDataSets.IDateDataSet): ICatalogDateDataset => {
    const { availableDateAttributes = [] } = dateDataset;
    const dateDatasetRef = uriRef(dateDataset.meta.uri);
    const dateAttributes = availableDateAttributes.map(convertDateDataSetAttribute);

    return newCatalogDateDataset(catalogDs =>
        catalogDs
            .dataSet(dateDatasetRef, ds => ds.modify(commonCatalogItemModifications(dateDataset.meta)))
            .dateAttributes(dateAttributes)
            .relevance(dateDataset.relevance),
    );
};

export const convertGroup = (group: GdcCatalog.ICatalogGroup): ICatalogGroup => {
    return newCatalogGroup(catalogG => catalogG.title(group.title).tag(idRef(group.identifier)));
};
