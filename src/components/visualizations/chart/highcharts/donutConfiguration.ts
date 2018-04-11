// (C) 2007-2018 GoodData Corporation
import { merge } from 'lodash';
import { getPieConfiguration } from './pieConfiguration';

export function getDonutConfiguration() {
    return merge({}, getPieConfiguration(), {
        plotOptions: {
            pie: {
                innerSize: '50%'
            }
        }
    });
}
