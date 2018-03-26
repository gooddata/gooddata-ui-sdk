// (C) 2007-2018 GoodData Corporation
import React from 'react';
import { shallow } from 'enzyme';

import { BAR_CHART } from '../../../VisualizationTypes';
import StaticLegend from '../StaticLegend';
import LegendItem from '../LegendItem';

describe('StaticLegend', () => {
    function render(customProps = {}) {
        const props = {
            chartType: BAR_CHART,
            series: [],
            onItemClick: () => {},
            position: 'top',
            containerHeight: 500,
            ...customProps
        };
        return shallow(
            <StaticLegend {...props} />
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

        const topLegend = render({ series, position: 'top' });
        expect(topLegend.find(LegendItem)).toHaveLength(3);

        const rightLegend = render({ series, position: 'right' });
        expect(rightLegend.find(LegendItem)).toHaveLength(3);
    });
});
