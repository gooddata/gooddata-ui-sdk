import * as PropTypes from 'prop-types';
import events from './Events';
import filters from './Filters';

export const kpiPropTypes = {
    ...events,
    ...filters,
    format: PropTypes.string,
    measure: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired
};
