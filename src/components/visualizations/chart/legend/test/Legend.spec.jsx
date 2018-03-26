// (C) 2007-2018 GoodData Corporation
import React from 'react';
import { mount } from 'enzyme';
import { BAR_CHART } from '../../../VisualizationTypes';
import Legend, { FLUID_LEGEND_THRESHOLD } from '../Legend';
import { withIntl } from '../../../test/utils';

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
            chartType: BAR_CHART,
            legendLayout: 'vertical',
            series,
            onItemClick: () => {},
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
