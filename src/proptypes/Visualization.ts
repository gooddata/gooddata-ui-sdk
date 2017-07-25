import * as PropTypes from 'prop-types';
import chartConfig from './ChartConfig';
import events from './Events';

export const visualizationPropTypes = {
    ...chartConfig,
    ...events,
    uri: PropTypes.string.isRequired
};
