// (C) 2007-2018 GoodData Corporation
import { AFM } from "@gooddata/typings";
import get = require("lodash/get");
import { AfmUtils } from "@gooddata/gooddata-js/lib/DataLayer";

export function isDerivedMeasure(measure: AFM.IMeasure): boolean {
    return (
        AFM.isPreviousPeriodMeasureDefinition(measure.definition) ||
        AFM.isPopMeasureDefinition(measure.definition)
    );
}

export function getMasterMeasureLocalIdentifier(measure: AFM.IMeasure): AFM.Identifier {
    const measureDefinition =
        get(measure, ["definition", "popMeasure"]) || get(measure, ["definition", "previousPeriodMeasure"]);
    return get(measureDefinition, ["measureIdentifier"]);
}

export function findMeasureByLocalIdentifier(afm: AFM.IAfm, localIdentifier: AFM.Identifier): AFM.IMeasure {
    return (afm.measures || []).find((m: AFM.IMeasure) => m.localIdentifier === localIdentifier);
}

export function getMasterMeasureObjQualifier(afm: AFM.IAfm, localIdentifier: AFM.Identifier) {
    let measure = findMeasureByLocalIdentifier(afm, localIdentifier);
    if (measure) {
        const masterMeasureIdentifier = getMasterMeasureLocalIdentifier(measure);
        if (masterMeasureIdentifier) {
            measure = findMeasureByLocalIdentifier(afm, masterMeasureIdentifier);
        }
        if (!measure) {
            return null;
        }
        return {
            uri: get(measure, ["definition", "measure", "item", "uri"]),
            identifier: get(measure, ["definition", "measure", "item", "identifier"]),
        };
    }
    return null;
}

const getDateFilter = (filters: AFM.FilterItem[]): AFM.DateFilterItem => {
    return filters.find(AfmUtils.isDateFilter);
};

const getAttributeFilters = (filters: AFM.FilterItem[] = []): AFM.AttributeFilterItem[] => {
    return filters.filter(AfmUtils.isAttributeFilter);
};

export const mergeFiltersToAfm = (afm: AFM.IAfm, additionalFilters: AFM.FilterItem[]): AFM.IAfm => {
    const attributeFilters = getAttributeFilters(additionalFilters);
    const dateFilter = getDateFilter(additionalFilters);
    return AfmUtils.appendFilters(afm, attributeFilters, dateFilter);
};
