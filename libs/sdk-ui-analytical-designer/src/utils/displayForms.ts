// (C) 2007-2026 GoodData Corporation

import { type AttributeDisplayFormType, type IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-model";

import { type ICacheItemDisplayForm } from "../typings/state_objects.js";

export function displayFormToCacheDisplayForm(
    df: IAttributeDisplayFormMetadataObject,
): ICacheItemDisplayForm {
    return {
        id: df.id,
        uri: df.uri,
        ref: df.ref,
        type: df.displayFormType as AttributeDisplayFormType,
        title: df.title,
        isDefault: df.isDefault,
        isPrimary: df.isPrimary,
    };
}

export function getPreferredLocationDisplayForm(
    dfs: IAttributeDisplayFormMetadataObject[],
): IAttributeDisplayFormMetadataObject | undefined {
    return (
        dfs.find((df) => (df.displayFormType as AttributeDisplayFormType) === "GDC.geo.pin_latitude") ??
        dfs[0]
    );
}

export function getPreferredAreaDisplayForm(
    dfs: IAttributeDisplayFormMetadataObject[],
): IAttributeDisplayFormMetadataObject | undefined {
    return dfs.find((df) => (df.displayFormType as AttributeDisplayFormType) === "GDC.geo.area");
}
