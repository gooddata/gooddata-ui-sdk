// (C) 2023 GoodData Corporation

import { IExportMetadata } from "../../types";
export const convertExportMetadata = (exportMetadata: any): IExportMetadata => {
    return {
        filters: exportMetadata?.filters,
    };
};
