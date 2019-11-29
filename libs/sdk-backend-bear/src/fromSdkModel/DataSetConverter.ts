// (C) 2019 GoodData Corporation
import { GdcDataSets } from "@gooddata/gd-bear-model";
import { IDataSet } from "@gooddata/sdk-model";

export const convertDataSet = (dataSet: GdcDataSets.IDataSet): IDataSet => {
    return {
        ...dataSet,
    };
};
