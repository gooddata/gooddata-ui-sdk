import * as PropTypes from 'prop-types';

import { Requireable } from 'prop-types'; // tslint:disable-line:no-duplicate-imports
export {
    Requireable
};

export const MetadataSourcePropType = PropTypes.shape({
    getVisualizationMetadata: PropTypes.func.isRequired,
    getFingerprint: PropTypes.func.isRequired
});
