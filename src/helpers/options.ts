import every = require('lodash/every');
import some = require('lodash/some');
import isEmpty = require('lodash/isEmpty');
import { Afm } from '@gooddata/data-layer';

export interface IVisualizationOptions {
    dateOptionsDisabled: boolean;
}

export function getVisualizationOptions(afm: Afm.IAfm): IVisualizationOptions {
    if (isEmpty(afm.measures)) {
        return { dateOptionsDisabled: false };
    }

    const dateOptionsDisabled = every<Afm.IMeasure>(afm.measures,
            measure => some<Afm.IFilter>(measure.definition.filters,
                filter => filter.type === 'date'));

    return { dateOptionsDisabled };
}
