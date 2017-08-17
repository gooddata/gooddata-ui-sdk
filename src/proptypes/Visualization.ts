import * as PropTypes from 'prop-types';
import chartConfig from './ChartConfig';
import events from './Events';
import filters from './Filters';

export const visualizationPropTypes = {
    ...chartConfig,
    ...events,
    ...filters,
    uri: PropTypes.string.isRequired
};
