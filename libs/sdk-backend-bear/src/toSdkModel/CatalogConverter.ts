// (C) 2019 GoodData Corporation
import {
    CatalogItemType,
    CatalogItem,
    ICatalogDateDataset,
    IGroupableCatalogItemBase,
    ICatalogAttribute,
    ICatalogMeasure,
    ICatalogFact,
    ICatalogDateAttribute,
    CatalogDateAttributeGranularity,
    ICatalogGroup,
} from "@gooddata/sdk-model";
import { GdcCatalog, GdcMetadata, GdcDateDataSets } from "@gooddata/gd-bear-model";
import { convertObjectMeta } from "./MetaConverter";

export type CompatibleCatalogItemType = Exclude<CatalogItemType, "dateDataset">;
export type CompatibleCatalogItem = Exclude<CatalogItem, ICatalogDateDataset>;

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

const convertGroupableItemBase = (item: GdcCatalog.CatalogItem): Omit<IGroupableCatalogItemBase, "type"> => {
    const {
        identifier,
        title,
        summary,
        production,
        groups = [],
        links: { self },
    } = item;

    return {
        id: identifier,
        uri: self,
        title,
        description: summary,
        production,
        groups,
    };
};

export const convertAttribute = (
    attribute: GdcCatalog.ICatalogAttribute,
    defaultDisplayForm: GdcMetadata.IAttributeDisplayForm,
): ICatalogAttribute => {
    const { meta: bearDefaultDisplayFormMeta } = defaultDisplayForm;
    const groupableCatalogItemBase = convertGroupableItemBase(attribute);
    const displayFormMeta = convertObjectMeta(bearDefaultDisplayFormMeta);

    return {
        ...groupableCatalogItemBase,
        type: "attribute",
        defaultDisplayForm: displayFormMeta,
    };
};

export const convertMeasure = (metric: GdcCatalog.ICatalogMetric): ICatalogMeasure => {
    const groupableCatalogItemBase = convertGroupableItemBase(metric);
    return {
        ...groupableCatalogItemBase,
        type: "measure",
        expression: metric.expression,
        format: metric.format,
    };
};

export const convertFact = (fact: GdcCatalog.ICatalogFact): ICatalogFact => {
    const groupableCatalogItemBase = convertGroupableItemBase(fact);
    return {
        ...groupableCatalogItemBase,
        type: "fact",
    };
};

const convertDateDataSetAttribute = (
    dateDatasetAttribute: GdcDateDataSets.IDateDataSetAttribute,
): ICatalogDateAttribute => {
    const { type, attributeMeta, defaultDisplayFormMeta } = dateDatasetAttribute;
    return {
        granularity: type as CatalogDateAttributeGranularity,
        attribute: convertObjectMeta(attributeMeta),
        defaultDisplayForm: convertObjectMeta(defaultDisplayFormMeta),
    };
};

export const convertDateDataset = (dateDataset: GdcDateDataSets.IDateDataSet): ICatalogDateDataset => {
    const { meta, relevance, availableDateAttributes = [] } = dateDataset;
    const catalogItemBase = convertObjectMeta(meta);
    const dateAttributes = availableDateAttributes.map(convertDateDataSetAttribute);

    return {
        ...catalogItemBase,
        type: "dateDataset",
        relevance,
        dateAttributes,
    };
};

export const convertGroup = (group: GdcCatalog.ICatalogGroup): ICatalogGroup => {
    const { identifier, title } = group;
    return {
        title,
        id: identifier,
    };
};
