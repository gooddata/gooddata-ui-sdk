// (C) 2019-2021 GoodData Corporation
import { idRef } from "@gooddata/sdk-model";
import {
    JsonApiAttributeWithLinks,
    JsonApiDatasetWithLinks,
    JsonApiFactWithLinks,
    JsonApiLabelWithLinks,
    JsonApiMetricWithLinks,
} from "@gooddata/api-client-tiger";
import { toSdkGranularity } from "./dateGranularityConversions";
import {
    IGroupableCatalogItemBuilder,
    IMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
    newCatalogAttribute,
    newCatalogDateAttribute,
    newCatalogDateDataset,
    newCatalogFact,
    newCatalogMeasure,
} from "@gooddata/sdk-backend-base";
import {
    ICatalogAttribute,
    ICatalogDateAttribute,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogMeasure,
    IGroupableCatalogItemBase,
} from "@gooddata/sdk-backend-spi";

type MetadataObject =
    | JsonApiAttributeWithLinks
    | JsonApiFactWithLinks
    | JsonApiMetricWithLinks
    | JsonApiLabelWithLinks;

const commonMetadataObjectModifications = <TItem extends MetadataObject, T extends IMetadataObjectBuilder>(
    item: TItem,
) => (builder: T) =>
    builder
        .id(item.id)
        .uri(item.links!.self)
        .title(item.attributes?.title || "")
        .description(item.attributes?.description || "");

const commonGroupableCatalogItemModifications = <
    TItem extends IGroupableCatalogItemBase,
    T extends IGroupableCatalogItemBuilder<TItem>
>(
    item: MetadataObject,
) => (builder: T) => {
    const tags = (item.attributes?.tags || []).map((tag) => idRef(tag, "tag"));
    return builder.groups(tags);
};

export const convertAttribute = (
    attribute: JsonApiAttributeWithLinks,
    defaultLabel: JsonApiLabelWithLinks,
    geoLabels: JsonApiLabelWithLinks[],
    allLabels: JsonApiLabelWithLinks[],
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

export const convertMeasure = (measure: JsonApiMetricWithLinks): ICatalogMeasure => {
    const maql = measure.attributes?.content?.maql;

    return newCatalogMeasure((catalogM) =>
        catalogM
            .measure(idRef(measure.id, "measure"), (m) =>
                m.modify(commonMetadataObjectModifications(measure)).expression(maql || ""),
            )
            .modify(commonGroupableCatalogItemModifications(measure)),
    );
};

export const convertFact = (fact: JsonApiFactWithLinks): ICatalogFact => {
    return newCatalogFact((catalogF) =>
        catalogF
            .fact(idRef(fact.id, "fact"), (f) => f.modify(commonMetadataObjectModifications(fact)))
            .modify(commonGroupableCatalogItemModifications(fact)),
    );
};

export const convertDateAttribute = (
    attribute: JsonApiAttributeWithLinks,
    label: JsonApiLabelWithLinks,
): ICatalogDateAttribute => {
    return newCatalogDateAttribute((dateAttribute) => {
        return dateAttribute
            .granularity(toSdkGranularity(attribute.attributes!.granularity!))
            .attribute(idRef(attribute.id, "attribute"), (a) =>
                a.modify(commonMetadataObjectModifications(attribute)),
            )
            .defaultDisplayForm(idRef(label.id, "displayForm"), (df) =>
                df.modify(commonMetadataObjectModifications(label)),
            );
    });
};

export const convertDateDataset = (
    dataset: JsonApiDatasetWithLinks,
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
