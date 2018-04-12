// (C) 2007-2018 GoodData Corporation
import every = require('lodash/every');
import some = require('lodash/some');
import isEmpty = require('lodash/isEmpty');
import { AFM } from '@gooddata/typings';
import { DataLayer } from '@gooddata/gooddata-js';

export interface IVisualizationOptions {
    dateOptionsDisabled: boolean;
}

function isDateFilteredMeasure(measure: AFM.IMeasure) {
    if (DataLayer.AfmUtils.isPoP(measure)) {
        return true;
        // ignore PoP measure in AFM (relevant is its "base measure")
    }
    const filters = DataLayer.AfmUtils.unwrapSimpleMeasure(measure).filters;
    return some<AFM.FilterItem>(filters, filter => DataLayer.AfmUtils.isDateFilter(filter));
}

export function getVisualizationOptions(afm: AFM.IAfm): IVisualizationOptions {
    const dateOptionsDisabled = isEmpty(afm.measures)
        ? false
        : every<AFM.IMeasure>(afm.measures, isDateFilteredMeasure);

    return {
        dateOptionsDisabled
    };
}
