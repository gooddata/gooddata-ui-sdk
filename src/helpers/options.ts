import every = require('lodash/every');
import some = require('lodash/some');
import isEmpty = require('lodash/isEmpty');
import { AFM } from '@gooddata/typings';
import { AfmUtils } from '@gooddata/data-layer';

export interface IVisualizationOptions {
    dateOptionsDisabled: boolean;
}

function isDateFilteredMeasure(measure: AFM.IMeasure) {
    if (AfmUtils.isPoP(measure)) {
        return true;
        // ignore PoP measure in AFM (relevant is its "base measure")
    }
    const filters = AfmUtils.unwrapSimpleMeasure(measure).filters;
    return some<AFM.FilterItem>(filters, filter => AfmUtils.isDateFilter(filter));
}

export function getVisualizationOptions(afm: AFM.IAfm): IVisualizationOptions {
    const dateOptionsDisabled = isEmpty(afm.measures)
        ? false
        : every<AFM.IMeasure>(afm.measures, isDateFilteredMeasure);

    return {
        dateOptionsDisabled
    };
}
