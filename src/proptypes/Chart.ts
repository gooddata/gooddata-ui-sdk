import * as PropTypes from 'prop-types';
import afm from './Afm';
import chartConfig from './ChartConfig';
import events from './Events';
import transformation from './Transformation';

export const chartPropTypes = {
    ...afm,
    ...chartConfig,
    ...events,
    ...transformation,
    projectId: PropTypes.string.isRequired
};
