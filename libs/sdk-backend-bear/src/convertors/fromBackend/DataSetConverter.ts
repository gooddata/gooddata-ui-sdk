// (C) 2019-2022 GoodData Corporation
import * as GdcDataSetsCsv from "@gooddata/api-model-bear/GdcDataSetsCsv";
import { IDataset } from "@gooddata/sdk-model";

export const convertDataSet = (dataset: GdcDataSetsCsv.IDataset): IDataset => {
    return {
        ...dataset,
    };
};
