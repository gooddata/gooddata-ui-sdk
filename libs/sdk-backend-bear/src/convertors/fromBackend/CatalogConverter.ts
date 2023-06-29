// (C) 2019-2023 GoodData Corporation
import {
    uriRef,
    idRef,
    ObjRef,
    CatalogItemType,
    CatalogItem,
    ICatalogGroup,
    ICatalogAttribute,
    ICatalogFact,
    ICatalogMeasure,
    ICatalogDateDataset,
    ICatalogDateAttribute,
    IAttributeDisplayFormMetadataObject,
} from "@gooddata/sdk-model";
import { GdcCatalog, GdcMetadata, GdcDateDataSets } from "@gooddata/api-model-bear";
import { IDisplayFormByKey, IAttributeByKey } from "../../types/catalog.js";
import {
    IMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
    newCatalogAttribute,
    newCatalogDateAttribute,
    newCatalogDateDataset,
    newCatalogFact,
    newCatalogGroup,
    newCatalogMeasure,
} from "@gooddata/sdk-backend-base";

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

export const convertItemType = (type: CompatibleCatalogItemType): GdcCatalog.CatalogItemType =>
    bearItemTypeByCatalogItemType[type];

const bearObjectMetaToBearRef = (obj: GdcMetadata.IObjectMeta): ObjRef => uriRef(obj.uri!);

const bearCatalogItemToBearRef = (obj: GdcCatalog.CatalogItem): ObjRef => uriRef(obj.links.self);

const bearGroupableCatalogItemToTagRefs = (item: { groups?: string[] }): ObjRef[] => {
    const { groups = [] } = item;
    return groups.map((tagId) => idRef(tagId));
};

const commonMetadataModifications =
    <T extends IMetadataObjectBuilder>(item: GdcMetadata.IObjectMeta) =>
    (builder: T) => {
        return builder
            .id(item.identifier!)
            .uri(item.uri!)
            .title(item.title)
            .description(item.summary ?? "")
            .production(item.isProduction === 1)
            .unlisted(item.unlisted === 1)
            .deprecated(item.deprecated === "1");
    };

const commonCatalogItemModifications =
    <T extends IMetadataObjectBuilder>(item: GdcCatalog.CatalogItem) =>
    (builder: T) =>
        builder
            .id(item.identifier)
            .uri(item.links.self)
            .title(item.title)
            .description(item.summary)
            .production(item.production)
            .unlisted(false)
            .deprecated(false);

const convertDisplayForm = (
    df: GdcMetadata.IAttributeDisplayForm,
    attrRef: ObjRef,
): IAttributeDisplayFormMetadataObject => {
    const ref = bearObjectMetaToBearRef(df.meta);

    return newAttributeDisplayFormMetadataObject(ref, (m) => {
        return m
            .modify(commonMetadataModifications(df.meta))
            .attribute(attrRef)
            .displayFormType(df.content.type);
    });
};

export const convertAttribute = (
    attribute: GdcCatalog.ICatalogAttribute,
    displayForms: IDisplayFormByKey,
    attributes: IAttributeByKey,
): ICatalogAttribute => {
    const attrRef = bearCatalogItemToBearRef(attribute);
    const defaultDisplayForm = displayForms[attribute.links.defaultDisplayForm];
    const attributeData = attributes[attribute.identifier];
    const geoPinDisplayForms = (attribute.links.geoPinDisplayForms ?? []).map((uri) => displayForms[uri]);
    const attributeDisplayForms = attributeData.attribute.content.displayForms.map((displayForm) =>
        convertDisplayForm(displayForm, attrRef),
    );
    const groups = bearGroupableCatalogItemToTagRefs(attribute);
    const drillDownStep = attributeData.attribute.content.drillDownStepAttributeDF
        ? uriRef(attributeData.attribute.content.drillDownStepAttributeDF)
        : undefined;

    const drillDownLink = attributeData.attribute.content.linkAttributeDF
        ? uriRef(attributeData.attribute.content.linkAttributeDF)
        : undefined;

    return newCatalogAttribute((catalogA) =>
        catalogA
            .attribute(attrRef, (a) => {
                return a
                    .modify(commonCatalogItemModifications(attribute))
                    .drillDownStep(drillDownStep)
                    .drillToAttributeLink(drillDownLink)
                    .displayForms(attributeDisplayForms);
            })
            .defaultDisplayForm(convertDisplayForm(defaultDisplayForm, attrRef))
            .displayForms(attributeDisplayForms)
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
    attributeById: IAttributeByKey,
): ICatalogDateAttribute => {
    const { attributeMeta, defaultDisplayFormMeta } = dateDatasetAttribute;
    const attributeRef = bearObjectMetaToBearRef(attributeMeta);
    const displayFormRef = bearObjectMetaToBearRef(defaultDisplayFormMeta);
    const attributeData = attributeById[attributeMeta.identifier!];
    const attributeDisplayForms = attributeData.attribute.content.displayForms.map((displayForm) =>
        convertDisplayForm(displayForm, attributeRef),
    );
    const drillDownStep = attributeData.attribute.content.drillDownStepAttributeDF
        ? uriRef(attributeData.attribute.content.drillDownStepAttributeDF)
        : undefined;

    return newCatalogDateAttribute((catalogDa) =>
        catalogDa
            .attribute(attributeRef, (a) =>
                a
                    .modify(commonMetadataModifications(attributeMeta))
                    .drillDownStep(drillDownStep)
                    .displayForms(attributeDisplayForms),
            )
            .defaultDisplayForm(displayFormRef, (df) =>
                df.modify(commonMetadataModifications(defaultDisplayFormMeta)),
            )
            .granularity(dateDatasetAttribute.type),
    );
};

export const convertDateDataset = (
    dateDataset: GdcDateDataSets.IDateDataSet,
    attributeById: IAttributeByKey,
): ICatalogDateDataset => {
    const { availableDateAttributes = [] } = dateDataset;
    const dateDatasetRef = bearObjectMetaToBearRef(dateDataset.meta);
    const dateAttributes = availableDateAttributes.map((attribute) =>
        convertDateDataSetAttribute(attribute, attributeById),
    );

    return newCatalogDateDataset((catalogDs) =>
        catalogDs
            .dataSet(dateDatasetRef, (ds) => ds.modify(commonMetadataModifications(dateDataset.meta)))
            .dateAttributes(dateAttributes)
            .relevance(dateDataset.relevance),
    );
};

export const convertWrappedFact = (fact: GdcMetadata.IWrappedFact): ICatalogFact => {
    const { meta } = fact.fact;
    const factRef = uriRef(meta.uri!);

    return newCatalogFact((catalogFact) =>
        catalogFact.fact(factRef, (f) => f.modify(commonMetadataModifications(meta))),
    );
};

export const convertWrappedAttribute = (attribute: GdcMetadata.IWrappedAttribute): ICatalogAttribute => {
    const { content, meta } = attribute.attribute;
    const attrRef = uriRef(meta.uri!);

    const displayForms = content.displayForms ?? [];
    const defaultDisplayForm = displayForms.find((df) => df.content.default === 1) ?? displayForms[0];
    const geoPinDisplayForms = displayForms.filter((df) => df.content.type === "GDC.geo.pin");

    return newCatalogAttribute((catalogAttr) => {
        let result = catalogAttr
            .attribute(attrRef, (a) => a.modify(commonMetadataModifications(meta)))
            .displayForms(
                displayForms.map((displayForm) =>
                    newAttributeDisplayFormMetadataObject(uriRef(displayForm.meta.uri!), (df) =>
                        df
                            .modify(commonMetadataModifications(displayForm.meta))
                            .attribute(attrRef)
                            .displayFormType(displayForm.content.type),
                    ),
                ),
            )
            .geoPinDisplayForms(
                geoPinDisplayForms.map((geoDisplayForm) => {
                    return newAttributeDisplayFormMetadataObject(uriRef(geoDisplayForm.meta.uri!), (df) =>
                        df
                            .modify(commonMetadataModifications(geoDisplayForm.meta))
                            .attribute(attrRef)
                            .displayFormType(geoDisplayForm.content.type),
                    );
                }),
            );

        if (defaultDisplayForm) {
            result = result.defaultDisplayForm(uriRef(defaultDisplayForm.meta.uri!), (df) =>
                df
                    .modify(commonMetadataModifications(defaultDisplayForm.meta))
                    .attribute(attrRef)
                    .displayFormType(defaultDisplayForm.content.type),
            );
        }

        return result;
    });
};

export const convertMetric = (metric: GdcMetadata.IWrappedMetric): ICatalogMeasure => {
    const { content, meta } = metric.metric;
    const measureRef = uriRef(meta.uri!);

    return newCatalogMeasure((catalogMeasure) =>
        catalogMeasure.measure(measureRef, (m) =>
            m
                .modify(commonMetadataModifications(meta))
                .expression(content.expression)
                .format(content.format ?? "#,#.##"),
        ),
    );
};

export const convertGroup = (group: GdcCatalog.ICatalogGroup): ICatalogGroup => {
    return newCatalogGroup((catalogG) => catalogG.title(group.title).tag(idRef(group.identifier)));
};
