// (C) 2007-2018 GoodData Corporation
import { MAX_POINT_WIDTH } from './commonConfiguration';
import { LINE_WIDTH } from './lineConfiguration';

export function getComboConfiguration() {
    const COMBO_TEMPLATE = {
        chart: {
            type: 'column',
            spacingTop: 20
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    crop: false,
                    overflow: 'none',
                    padding: 2
                },
                maxPointWidth: MAX_POINT_WIDTH
            },
            line: {
                marker: {
                    symbol: 'circle',
                    radius: 4.5
                },
                lineWidth: LINE_WIDTH,
                fillOpacity: 0.3,
                states: {
                    hover: {
                        lineWidth: LINE_WIDTH + 1
                    }
                },
                dataLabels: {
                    style: {
                        fontWeight: 'normal'
                    }
                }
            }
        }
    };
    return COMBO_TEMPLATE;
}
