import * as PropTypes from 'prop-types';

import { Requireable } from 'prop-types'; // tslint:disable-line:no-duplicate-imports
export {
    Requireable
};

export const EventsPropTypes = {
    onError: PropTypes.func,
    onLoadingChanged: PropTypes.func,
    afterRender: PropTypes.func,
    pushData: PropTypes.func
};
