import * as PropTypes from 'prop-types';
import { ChartConfigPropType } from './ChartConfig';
import { EventsPropTypes } from './Events';
import { FiltersPropType } from './Filters';
import { DrillableItemPropType } from './DrillableItem';

import { Requireable } from 'prop-types'; // tslint:disable-line:no-duplicate-imports
export {
    Requireable
};

export const VisualizationPropType = {
    config: ChartConfigPropType,
    ...EventsPropTypes,
    filters: FiltersPropType,
    drillableItems: PropTypes.arrayOf(DrillableItemPropType),
    projectId: PropTypes.string.isRequired,
    identifier: PropTypes.string,
    uri: PropTypes.string,
    uriResolver: PropTypes.func
};
