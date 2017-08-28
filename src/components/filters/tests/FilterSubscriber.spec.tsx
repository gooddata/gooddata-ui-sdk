import * as React from 'react';
import { mount } from 'enzyme';
import { Afm } from '@gooddata/data-layer';
import {
    PureFilterSubscriber,
    IFilterSubscriberProps,
    mapStateToProps
} from '../FilterSubscriber';
import { REDUX_STATE_PATH } from '../redux/filtersReducer';

const DummyFilterVisualization = (props) => {
    return (
        <span>
            {props.filters.map((filter) => {
                return <div key={filter.id} className={filter.id}>{filter.in.join(',')}</div>;
            })}
        </span>
    );
};

describe('FilterSubscriber', () => {
    describe('PureFilterSubscriber', () => {
        function createComponent(props: IFilterSubscriberProps, children) {
            return mount(
                <PureFilterSubscriber {...props}>
                    {children}
                </PureFilterSubscriber>
            );
        }
        it('should filters props to its children', () => {
            const filters: Afm.IFilter[] = [
                {
                    id: 'identifier',
                    type: 'attribute',
                    in: [
                        '1', '2'
                    ]
                },
                {
                    id: 'identifier2',
                    type: 'attribute',
                    in: [
                        '3', '4'
                    ]
                }
            ];
            const props = {
                filters
            };
    
            const children = [
                <DummyFilterVisualization key="visualization" />,
                <div key="fill">Simple HTML element that doesn't have props</div>
            ];
            const wrapper = createComponent(props, children);
            expect(wrapper.find('.identifier').text()).toEqual('1,2');
            expect(wrapper.find('.identifier2').text()).toEqual('3,4');
        });
    });

    describe('mapStateToProps', () => {
        it('should select filters from state', () => {
            const ownProps = {
                ids: [
                    'foo',
                    'bar'
                ]
            };
            const initialState = {
                [REDUX_STATE_PATH]: {
                    foo: 'fuzz',
                    bar: 'buzz'
                }
            };
            const props = mapStateToProps(initialState, ownProps);
            expect(props.filters).toEqual(['fuzz', 'buzz']);
        });
    });
});
