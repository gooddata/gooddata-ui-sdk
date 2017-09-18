import * as PropTypes from 'prop-types';
import chartConfig from './ChartConfig';
import events from './Events';
import filters from './Filters';
import drillableItem from './DrillableItem';

export const visualizationPropTypes = {
    ...chartConfig,
    ...events,
    ...filters,
    drillableItems: PropTypes.arrayOf(PropTypes.shape(drillableItem)),
    projectId: PropTypes.string.isRequired,
    identifier: PropTypes.string,
    uri: PropTypes.string,
    uriResolver: PropTypes.func
};
