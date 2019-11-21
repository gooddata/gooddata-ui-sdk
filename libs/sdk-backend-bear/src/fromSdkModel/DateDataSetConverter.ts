// (C) 2019 GoodData Corporation
import { GdcDataSets } from "@gooddata/gd-bear-model";
import { IDateDataSet, IDateDataSetAttribute } from "@gooddata/sdk-model";

const convertDateDataSetAttribute = (attribute: GdcDataSets.IDateDataSetAttribute): IDateDataSetAttribute => {
    return {
        attributeId: attribute.attributeMeta.identifier!,
        defaultDisplayFormId: attribute.defaultDisplayFormMeta.identifier!,
        defaultDisplayFormTitle: attribute.defaultDisplayFormMeta.title,
        granularity: attribute.type,
    };
};

export const convertDateDataSet = (dateDataSet: GdcDataSets.IDateDataSet): IDateDataSet => {
    return {
        availableDateAttributes: dateDataSet.availableDateAttributes
            ? dateDataSet.availableDateAttributes.map(convertDateDataSetAttribute)
            : [],
        relevance: dateDataSet.relevance,
    };
};
