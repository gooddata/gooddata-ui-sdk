import * as PropTypes from 'prop-types';
import afm from './Afm';
import events from './Events';
import transformation from './Transformation';

export const tablePropTypes = {
    ...afm,
    ...events,
    ...transformation,
    projectId: PropTypes.string.isRequired
};
