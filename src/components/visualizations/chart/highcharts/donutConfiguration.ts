// (C) 2007-2018 GoodData Corporation
import merge = require('lodash/merge');
import get = require('lodash/get');
import { getPieConfiguration } from './pieConfiguration';

export function getDonutConfiguration() {
    return merge({}, getPieConfiguration(), {
        chart: {
            events: {
                load() {
                    this.series[0].update({
                        dataLabels: {
                            distance: -(get(this, 'series.0.points.0.shapeArgs.r', 40) * 0.25)
                        }
                    });
                }
            }
        },
        plotOptions: {
            pie: {
                innerSize: '50%'
            }
        }
    });
}
