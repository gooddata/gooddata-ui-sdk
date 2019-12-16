// (C) 2019 GoodData Corporation
import { GdcMetadata } from "@gooddata/gd-bear-model";
import { IObjectMeta } from "@gooddata/sdk-model";

export const convertObjectMeta = (meta: GdcMetadata.IObjectMeta): IObjectMeta => {
    const { identifier, title, summary, isProduction, uri } = meta;

    return {
        id: identifier,
        uri,
        title,
        description: summary,
        production: !!isProduction,
    };
};
