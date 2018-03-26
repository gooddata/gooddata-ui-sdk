// (C) 2007-2018 GoodData Corporation
import React from 'react';
import { mount } from 'enzyme';
import LegendItem from '../LegendItem';

describe('LegendItem', () => {
    it('should render item', () => {
        const props = {
            item: {
                name: 'Foo',
                color: 'red',
                isVisible: true
            },
            chartType: 'bar',
            onItemClick: jest.fn()
        };
        const wrapper = mount(<LegendItem {...props} />);
        expect(wrapper.find('.series-item').text()).toEqual('Foo');

        wrapper.find('.series-item').simulate('click');
        expect(props.onItemClick).toHaveBeenCalled();
    });
});
