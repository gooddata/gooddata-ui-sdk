// (C) 2019-2020 GoodData Corporation
import { GdcDataSetsCsv } from "@gooddata/api-model-bear";
import { IDataset } from "@gooddata/sdk-backend-spi";

export const convertDataSet = (dataset: GdcDataSetsCsv.IDataset): IDataset => {
    return {
        ...dataset,
    };
};
