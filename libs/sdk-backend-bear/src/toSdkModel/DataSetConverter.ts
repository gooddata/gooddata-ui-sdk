// (C) 2019-2020 GoodData Corporation
import { GdcDatasets } from "@gooddata/gd-bear-model";
import { IDataset } from "@gooddata/sdk-model";

export const convertDataSet = (dataset: GdcDatasets.IDataset): IDataset => {
    return {
        ...dataset,
    };
};
