import { filtersReducer } from '../filtersReducer';
import { changeFilter, removeFilter } from '../actionCreators';

describe('filtersReducer', () => {
    it('should handle change filter', () => {
        const action = changeFilter('filterId', { foo: 'bar' });
        const state = filtersReducer({}, action);
        expect(state).toEqual({
            filterId: { foo: 'bar' }
        });
    });

    it('should overwrite existing filter', () => {
        const initialState = {
            filterId: {
                fuz: 'buz'
            }
        };
        const action = changeFilter('filterId', { foo: 'bar' });
        const state = filtersReducer(initialState, action);
        expect(state).toEqual({
            filterId: {
                foo: 'bar'
            }
        });
    });

    it('should handle remove filter', () => {
        const action = removeFilter('filterId');
        const initialState = {
            filterId: {
                foo: 'bar'
            }
        };
        const state = filtersReducer(initialState, action);
        expect(state).toEqual({});
    });

    it('should do nothing for non existing filter', () => {
        const action = removeFilter('xxx');
        const initialState = {
            filterId: {
                foo: 'bar'
            }
        };
        const state = filtersReducer(initialState, action);
        expect(state).toEqual(initialState);
    });

    it('should do nothing for unknown action', () => {
        const action = { type: 'foo' };
        const state = { foo: 'bar' };
        expect(filtersReducer(state, action)).toEqual(state);
    });
});
