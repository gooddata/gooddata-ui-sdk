// (C) 2007-2018 GoodData Corporation
import React from 'react';
import { shallow } from 'enzyme';

import { BAR_CHART } from '../../../VisualizationTypes';
import FluidLegend from '../FluidLegend';
import LegendItem from '../LegendItem';

describe('FluidLegend', () => {
    function render(customProps = {}) {
        const props = {
            chartType: BAR_CHART,
            series: [],
            onItemClick: () => {},
            containerWidth: 500,
            ...customProps
        };
        return shallow(
            <FluidLegend {...props} />
        );
    }

    it('should render items', () => {
        const series = [
            {
                name: 'A',
                color: '#333',
                isVisible: true
            },
            {
                name: 'B',
                color: '#333',
                isVisible: true
            },
            {
                name: 'A',
                color: '#333',
                isVisible: true
            }
        ];

        const wrapper = render({ series });
        expect(wrapper.find(LegendItem)).toHaveLength(3);
    });
});
