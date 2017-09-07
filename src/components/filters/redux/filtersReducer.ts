import omit = require('lodash/omit');
import { CHANGE_FILTER, REMOVE_FILTER } from './actionCreators';

const REDUX_STATE_PATH = '@gooddata/react-components';

function filtersReducer(state = {}, action) {
    switch (action.type) {
        case REMOVE_FILTER: {
            const { filterId } = action.payload;
            if (!state[filterId]) {
                return state;
            }
            return omit(state, filterId);
        }

        case CHANGE_FILTER: {
            const { filterId, changes } = action.payload;
            return {
                ...state,
                [filterId]: changes
            };
        }

        default:
            return state;
    }
}

export {
    filtersReducer,
    REDUX_STATE_PATH
};
