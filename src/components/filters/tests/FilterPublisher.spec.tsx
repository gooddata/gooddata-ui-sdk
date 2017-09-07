import * as React from 'react';
import { mount } from 'enzyme';
import {
    PureFilterPublisher,
    IFilterPublisherProps,
    mapDispatchToProps
} from '../FilterPublisher';
import { CHANGE_FILTER } from '../redux/actionCreators'; 

const DummyFilterComponent = (props) => {
    return (
        <button onClick={props.onApply}>Click me</button>
    );
};

describe('FilterPublisher', () => {
    describe('PureFilterPublisher', () => {
        function createComponent(props: IFilterPublisherProps, children) {
            return mount(
                <PureFilterPublisher {...props}>
                    {children}
                </PureFilterPublisher>
            );
        }

        it('should pass onApply prop to its children', () => {
            const props = {
                onApply: jest.fn()
            };
    
            const children = [
                <DummyFilterComponent key="filter-component" />,
                <div key="fill">Simple HTML element that doesn't have props</div>
            ];
    
            const wrapper = createComponent(props, children);
            expect(wrapper.find(DummyFilterComponent).props()).toMatchObject(props);
            wrapper.find('button').simulate('click');
            expect(props.onApply).toHaveBeenCalledTimes(1);
        });
    });

    describe('mapDispatchToProps', () => {
        it('should create onApply fn that dispatches change filter action', () => {
            const dispatch = jest.fn();
            const ownProps = {
                id: 'foo'
            };
            const props = mapDispatchToProps(dispatch, ownProps);
            props.onApply({ foo: 'bar' });
            expect(dispatch).toHaveBeenCalledWith({
                type: CHANGE_FILTER,
                payload: {
                    filterId: 'foo',
                    changes: {
                        foo: 'bar'
                    }
                }
            });
        });
    });    
});
