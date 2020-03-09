// (C) 2019-2020 GoodData Corporation
import { GdcMetadata } from "@gooddata/gd-bear-model";
import {
    uriRef,
    MetadataObject,
    newAttributeMetadataObject,
    newAttributeDisplayFormMetadataObject,
    newFactMetadataObject,
    IMetadataObjectBuilder,
    newMeasureMetadataObject,
} from "@gooddata/sdk-model";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";

export const convertMetadataObject = (obj: GdcMetadata.IObject): MetadataObject => {
    const ref = uriRef(obj.meta.uri);

    const commonModifications = <T extends IMetadataObjectBuilder>(builder: T) =>
        builder
            .title(obj.meta.title)
            .description(obj.meta.summary)
            .id(obj.meta.identifier)
            .uri(obj.meta.uri);

    if (GdcMetadata.isAttribute(obj)) {
        return newAttributeMetadataObject(ref, a => a.modify(commonModifications));
    } else if (GdcMetadata.isAttributeDisplayForm(obj)) {
        return newAttributeDisplayFormMetadataObject(ref, a =>
            a.modify(commonModifications).attribute(uriRef(obj.content.formOf)),
        );
    } else if (GdcMetadata.isMetric(obj)) {
        return newMeasureMetadataObject(ref, m =>
            m
                .modify(commonModifications)
                .expression(obj.content.expression)
                .format(obj.content.format || "##,#"),
        );
    } else if (GdcMetadata.isFact(obj)) {
        return newFactMetadataObject(ref, f => f.modify(commonModifications));
    }

    throw new UnexpectedError(
        `Cannot convert metadata object, convertor not found! (${JSON.stringify(obj, null, 4)})`,
    );
};
