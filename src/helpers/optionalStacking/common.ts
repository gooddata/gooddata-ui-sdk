// (C) 2007-2018 GoodData Corporation
import isArray = require('lodash/isArray');
import { VisualizationObject } from '@gooddata/typings';
import { VIEW_BY_ATTRIBUTES_LIMIT } from '../../components/visualizations/chart/constants';
import IVisualizationAttribute = VisualizationObject.IVisualizationAttribute;

export function getViewByTwoAttributes(
    viewBy: IVisualizationAttribute | IVisualizationAttribute[]
): IVisualizationAttribute[] {
    if (!viewBy) {
        return [];
    }
    if (viewBy && isArray(viewBy)) {
        // only get first two attributes
        return viewBy.slice(0, VIEW_BY_ATTRIBUTES_LIMIT);
    }
    return [viewBy] as VisualizationObject.IVisualizationAttribute[];
}
