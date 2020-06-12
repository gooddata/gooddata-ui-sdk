// (C) 2019-2020 GoodData Corporation
import { GdcDataSetsCsv } from "@gooddata/gd-bear-model";
import { IDataset } from "@gooddata/sdk-model";

export const convertDataSet = (dataset: GdcDataSetsCsv.IDataset): IDataset => {
    return {
        ...dataset,
    };
};
