import {
    changeFilter,
    removeFilter,
    CHANGE_FILTER,
    REMOVE_FILTER
} from '../actionCreators';

describe('actionCreators', () => {
    it('should create changeFilter action', () => {
        expect(
            changeFilter('filterId', { foo: 'bar' })
        ).toEqual({
            type: CHANGE_FILTER,
            payload: {
                filterId: 'filterId',
                changes: {
                    foo: 'bar'
                }
            }
        });
    });

    it('should create remove filter action', () => {
        expect(
            removeFilter('filterId')
        ).toEqual({
            type: REMOVE_FILTER,
            payload: {
                filterId: 'filterId'
            }
        });
    });
});
