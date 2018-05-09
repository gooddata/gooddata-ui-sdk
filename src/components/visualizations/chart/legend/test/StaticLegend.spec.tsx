// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { shallow } from 'enzyme';
import noop = require('lodash/noop');

import { VisualizationTypes } from '../../../../../constants/visualizationTypes';
import StaticLegend from '../StaticLegend';
import LegendItem from '../LegendItem';

describe('StaticLegend', () => {
    function render(customProps: any = {}) {
        const props = {
            chartType: VisualizationTypes.BAR,
            series: [],
            onItemClick: noop,
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
