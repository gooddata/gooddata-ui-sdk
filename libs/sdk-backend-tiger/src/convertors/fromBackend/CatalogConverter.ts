// (C) 2019-2022 GoodData Corporation
import {
    idRef,
    ICatalogAttribute,
    ICatalogFact,
    ICatalogMeasure,
    ICatalogDateDataset,
    ICatalogDateAttribute,
    IGroupableCatalogItemBase,
    IAttributeDisplayFormMetadataObject,
} from "@gooddata/sdk-model";
import {
    JsonApiAttributeOutWithLinks,
    JsonApiDatasetOutWithLinks,
    JsonApiFactOutWithLinks,
    JsonApiLabelOutWithLinks,
    JsonApiMetricOutWithLinks,
} from "@gooddata/api-client-tiger";
import { toSdkGranularity } from "./dateGranularityConversions";
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
import { commonMetadataObjectModifications, MetadataObjectFromApi } from "./MetadataConverter";
import { isInheritedObject } from "./utils";
import { convertLabelType } from "./LabelTypeConverter";

const commonGroupableCatalogItemModifications =
    <TItem extends IGroupableCatalogItemBase, T extends IGroupableCatalogItemBuilder<TItem>>(
        item: MetadataObjectFromApi,
    ) =>
    (builder: T) => {
        const tags = (item.attributes?.tags || []).map((tag) => idRef(tag, "tag"));
        return builder.groups(tags);
    };

const tigerLabelToDisplayFormMd = (label: JsonApiLabelOutWithLinks): IAttributeDisplayFormMetadataObject => {
    return newAttributeDisplayFormMetadataObject(idRef(label.id, "displayForm"), (builder) => {
        const labelBuilder = commonMetadataObjectModifications(label)(
            builder,
        ) as AttributeDisplayFormMetadataObjectBuilder;
        labelBuilder.displayFormType(convertLabelType(label.attributes?.valueType, label.id));
        return labelBuilder;
    });
};

export const convertAttribute = (
    attribute: JsonApiAttributeOutWithLinks,
    defaultLabel: JsonApiLabelOutWithLinks,
    geoLabels: JsonApiLabelOutWithLinks[],
    allLabels: JsonApiLabelOutWithLinks[],
): ICatalogAttribute => {
    const geoPinDisplayForms = geoLabels.map(tigerLabelToDisplayFormMd);
    const displayForms = allLabels.map(tigerLabelToDisplayFormMd);

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

export const convertMeasure = (measure: JsonApiMetricOutWithLinks): ICatalogMeasure => {
    const { maql = "", format = "" } = measure.attributes?.content || {};

    return newCatalogMeasure((catalogM) =>
        catalogM
            .measure(idRef(measure.id, "measure"), (m) =>
                m
                    .modify(commonMetadataObjectModifications(measure))
                    .expression(maql)
                    .format(format)
                    .isLocked(isInheritedObject(measure.id)),
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
    const displayForms = allLabels.map(tigerLabelToDisplayFormMd);

    return newCatalogDateAttribute((dateAttribute) => {
        return dateAttribute
            .granularity(toSdkGranularity(attribute.attributes!.granularity!))
            .attribute(idRef(attribute.id, "attribute"), (a) =>
                a.modify(commonMetadataObjectModifications(attribute)).displayForms(displayForms),
            )
            .defaultDisplayForm(idRef(label.id, "displayForm"), (df) =>
                df.modify(commonMetadataObjectModifications(label)),
            );
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
