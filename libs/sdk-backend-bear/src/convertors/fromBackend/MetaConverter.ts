// (C) 2019-2022 GoodData Corporation
import { GdcMetadata, GdcMetadataObject } from "@gooddata/api-model-bear";
import { uriRef, ObjectType, IMetadataObject, MetadataObject } from "@gooddata/sdk-model";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    IMetadataObjectBuilder,
    newAttributeDisplayFormMetadataObject,
    newAttributeMetadataObject,
    newDataSetMetadataObject,
    newFactMetadataObject,
    newMeasureMetadataObject,
    newVariableMetadataObject,
} from "@gooddata/sdk-backend-base";

const supportedMetadataObjectsTypeGuards = [
    GdcMetadata.isAttribute,
    GdcMetadata.isAttributeDisplayForm,
    GdcMetadata.isMetric,
    GdcMetadata.isFact,
    GdcMetadata.isDataSet,
    GdcMetadata.isPrompt,
    GdcMetadata.isTheme,
];

export type SupportedWrappedMetadataObject =
    | GdcMetadata.IWrappedAttribute
    | GdcMetadata.IWrappedAttributeDisplayForm
    | GdcMetadata.IWrappedMetric
    | GdcMetadata.IWrappedFact
    | GdcMetadata.IWrappedDataSet
    | GdcMetadata.IWrappedPrompt
    | GdcMetadata.IWrappedTheme;

export type SupportedMetadataObject =
    | GdcMetadata.IAttribute
    | GdcMetadata.IAttributeDisplayForm
    | GdcMetadata.IMetric
    | GdcMetadata.IFact
    | GdcMetadata.IDataSet
    | GdcMetadata.IPrompt
    | GdcMetadata.ITheme;

const isSupportedMetadataObject = (obj: any): obj is SupportedMetadataObject =>
    supportedMetadataObjectsTypeGuards.some((isType) => isType(obj));

export const convertMetadataObject = (obj: GdcMetadataObject.IObject): MetadataObject => {
    if (!isSupportedMetadataObject(obj)) {
        throw new UnexpectedError(
            `Cannot convert metadata object, convertor not found! (${JSON.stringify(obj, null, 4)})`,
        );
    }

    const ref = uriRef(obj.meta.uri!);

    const commonModifications = <T extends IMetadataObjectBuilder>(builder: T) =>
        builder
            .title(obj.meta.title)
            .description(obj.meta.summary!)
            .id(obj.meta.identifier!)
            .production(obj.meta.isProduction === 1)
            .uri(obj.meta.uri!);

    if (GdcMetadata.isAttribute(obj)) {
        const attributeDisplayForms = obj.content.displayForms.map((displayForm) =>
            newAttributeDisplayFormMetadataObject(uriRef(displayForm.meta.uri!), (df) =>
                df
                    .attribute(ref)
                    .title(displayForm.meta.title)
                    .description(displayForm.meta.summary!)
                    .id(displayForm.meta.identifier!)
                    .uri(displayForm.meta.uri!)
                    .displayFormType(displayForm.content.type),
            ),
        );
        return newAttributeMetadataObject(ref, (a) =>
            a.modify(commonModifications).displayForms(attributeDisplayForms),
        );
    } else if (GdcMetadata.isAttributeDisplayForm(obj)) {
        return newAttributeDisplayFormMetadataObject(ref, (a) =>
            a
                .modify(commonModifications)
                .attribute(uriRef(obj.content.formOf))
                .displayFormType(obj.content.type),
        );
    } else if (GdcMetadata.isMetric(obj)) {
        return newMeasureMetadataObject(ref, (m) =>
            m
                .modify(commonModifications)
                .expression(obj.content.expression)
                .format(obj.content.format || "##,#"),
        );
    } else if (GdcMetadata.isFact(obj)) {
        return newFactMetadataObject(ref, (f) => f.modify(commonModifications));
    } else if (GdcMetadata.isDataSet(obj)) {
        return newDataSetMetadataObject(ref, (ds) => ds.modify(commonModifications));
    } else {
        // is prompt
        return newVariableMetadataObject(ref, (v) => v.modify(commonModifications));
    }
};

/**
 * Converts xref entry (result of using/usedBy) into IMetadataObject. There's one gotcha: the production indicator
 * is not available in xref entry. Instead of calling out to the backend, this function will hammer in 'true' - which
 * will be right guess in vast majority of cases (hunt me down when this starts causing bugs :)).
 *
 * @param type - specify object type of the xref entry (code ignores the xref category)
 * @param entry - xref entry
 */
export const convertMetadataObjectXrefEntry = (
    type: ObjectType,
    entry: GdcMetadata.IObjectXrefEntry,
): IMetadataObject => {
    const ref = uriRef(entry.link);

    return {
        type,
        uri: entry.link,
        id: entry.identifier,
        ref,
        title: entry.title,
        description: entry.summary,
        production: true,
        unlisted: entry.unlisted === 1,
        deprecated: entry.deprecated === "1",
    };
};
