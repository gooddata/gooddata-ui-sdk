export const CHANGE_FILTER = 'gooddata-react-components/CHANGE_FILTER';
export const REMOVE_FILTER = 'gooddata-react-components/REMOVE_FILTER';

export function removeFilter(filterId) {
    return {
        type: REMOVE_FILTER,
        payload: {
            filterId
        }
    };
}

export function changeFilter(filterId, changes) {
    return {
        type: CHANGE_FILTER,
        payload: {
            filterId,
            changes
        }
    };
}
