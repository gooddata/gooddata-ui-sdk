// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import noop = require('lodash/noop');
import { mount } from 'enzyme';
import { VisualizationTypes } from '../../../../../constants/visualizationTypes';
import Legend, { FLUID_LEGEND_THRESHOLD } from '../Legend';
import { withIntl } from '../../../utils/intlUtils';

describe('Legend', () => {
    const series = [
        {
            name: 'series1',
            color: '#333333'
        },
        {
            name: 'series2',
            color: '#222222'
        },
        {
            name: 'series3',
            color: '#111111'
        },
        {
            name: 'series4',
            color: '#000000'
        }
    ];

    function createComponent(userProps = {}) {
        const props = {
            chartType: VisualizationTypes.BAR,
            legendLayout: 'vertical',
            series,
            onItemClick: noop,
            position: 'top',
            ...userProps
        };

        const Wrapped = withIntl(Legend);

        return mount(<Wrapped {...props} />);
    }

    it('should render StaticLegend on desktop', () => {
        const legend = createComponent({
            documentObj: {
                documentElement: {
                    clientWidth: FLUID_LEGEND_THRESHOLD + 10
                }
            },
            position: 'right'
        });
        expect(legend.find('.viz-static-legend-wrap')).toHaveLength(1);
    });

    it('should render fluid legend on mobile', () => {
        const legend = createComponent({
            responsive: true,
            position: 'right',
            documentObj: {
                documentElement: {
                    clientWidth: FLUID_LEGEND_THRESHOLD - 10
                }
            }
        });
        expect(legend.find('.viz-fluid-legend-wrap')).toHaveLength(1);
    });
});
