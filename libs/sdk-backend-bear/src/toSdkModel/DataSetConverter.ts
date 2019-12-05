// (C) 2019 GoodData Corporation
import { GdcDatasets } from "@gooddata/gd-bear-model";
import { IDataset } from "@gooddata/sdk-model";

export const convertDataSet = (dataSet: GdcDatasets.IDataset): IDataset => {
    return {
        ...dataSet,
    };
};
