// (C) 2019-2022 GoodData Corporation
import {
    IAttributeDisplayForm,
    IFact,
    IMetadataObjectAttribute,
    IMetadataObjectDataSet,
    IMetric,
    IObject,
    IObjectXrefEntry,
    IPrompt,
    ITheme,
    IWrappedAttribute,
    IWrappedAttributeDisplayForm,
    IWrappedDataSet,
    IWrappedFact,
    IWrappedMetric,
    IWrappedPrompt,
    IWrappedTheme,
    isAttributeDisplayForm,
    isFact,
    isMetadataObjectAttribute,
    isMetadataObjectDataSet,
    isMetric,
    isPrompt,
    isTheme,
} from "@gooddata/api-model-bear";

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
    isMetadataObjectAttribute,
    isAttributeDisplayForm,
    isMetric,
    isFact,
    isMetadataObjectDataSet,
    isPrompt,
    isTheme,
];

export type SupportedWrappedMetadataObject =
    | IWrappedAttribute
    | IWrappedAttributeDisplayForm
    | IWrappedMetric
    | IWrappedFact
    | IWrappedDataSet
    | IWrappedPrompt
    | IWrappedTheme;

export type SupportedMetadataObject =
    | IMetadataObjectAttribute
    | IAttributeDisplayForm
    | IMetric
    | IFact
    | IMetadataObjectDataSet
    | IPrompt
    | ITheme;

const isSupportedMetadataObject = (obj: any): obj is SupportedMetadataObject =>
    supportedMetadataObjectsTypeGuards.some((isType) => isType(obj));

export const convertMetadataObject = (obj: IObject): MetadataObject => {
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

    if (isMetadataObjectAttribute(obj)) {
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
    } else if (isAttributeDisplayForm(obj)) {
        return newAttributeDisplayFormMetadataObject(ref, (a) =>
            a
                .modify(commonModifications)
                .attribute(uriRef(obj.content.formOf))
                .displayFormType(obj.content.type),
        );
    } else if (isMetric(obj)) {
        return newMeasureMetadataObject(ref, (m) =>
            m
                .modify(commonModifications)
                .expression(obj.content.expression)
                .format(obj.content.format || "##,#"),
        );
    } else if (isFact(obj)) {
        return newFactMetadataObject(ref, (f) => f.modify(commonModifications));
    } else if (isMetadataObjectDataSet(obj)) {
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
    entry: IObjectXrefEntry,
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
