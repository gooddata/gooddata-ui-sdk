import * as PropTypes from 'prop-types';
import chartConfig from './ChartConfig';
import events from './Events';
import filters from './Filters';

export const visualizationPropTypes = {
    ...chartConfig,
    ...events,
    ...filters,
    projectId: PropTypes.string.isRequired,
    identifier: PropTypes.string,
    uri: PropTypes.string,
    uriResolver: PropTypes.func
};
