// (C) 2019-2022 GoodData Corporation
import { IDataset as IBearDataset } from "@gooddata/api-model-bear";
import { IDataset } from "@gooddata/sdk-model";

export const convertDataSet = (dataset: IBearDataset): IDataset => {
    return {
        ...dataset,
    };
};
