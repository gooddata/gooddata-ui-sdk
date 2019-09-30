// (C) 2007-2019 GoodData Corporation
import get = require("lodash/get");
import { AFM } from "@gooddata/gd-bear-model";

export const AVAILABLE_TOTALS: AFM.TotalType[] = ["sum", "max", "min", "avg", "med", "nat"];

export const isNativeTotal = (total: AFM.ITotalItem) => {
    return total && total.type === "nat";
};

export const getAttributeDimension = (
    attributeIdentifier: string,
    resultSpec: AFM.IResultSpec,
): AFM.IDimension => {
    return resultSpec.dimensions.find(
        dimension => !!dimension.itemIdentifiers.find(attribute => attribute === attributeIdentifier),
    );
};

const getNativeTotalAttributeIdentifiers = (total: AFM.ITotalItem, resultSpec: AFM.IResultSpec): string[] => {
    const attributeIdentifiers = getAttributeDimension(total.attributeIdentifier, resultSpec).itemIdentifiers;

    const totalAttributeIndex = attributeIdentifiers.findIndex(
        attributeIdentifier => attributeIdentifier === total.attributeIdentifier,
    );

    return attributeIdentifiers.slice(0, totalAttributeIndex);
};

export const getNativeTotals = (
    totals: AFM.ITotalItem[],
    resultSpec: AFM.IResultSpec,
): AFM.INativeTotalItem[] => {
    if (!totals) {
        return [];
    }
    const afmNativeTotals: AFM.INativeTotalItem[] = totals
        .filter(total => isNativeTotal(total))
        .map(nativeTotal => ({
            measureIdentifier: nativeTotal.measureIdentifier,
            attributeIdentifiers: getNativeTotalAttributeIdentifiers(nativeTotal, resultSpec),
        }));
    return afmNativeTotals;
};

export const getColumnTotalsFromResultSpec = (source: AFM.IResultSpec) => {
    return get(source, "dimensions[0].totals", []);
};

export default {
    getColumnTotalsFromResultSpec,
};
