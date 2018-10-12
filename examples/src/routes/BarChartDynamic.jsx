// (C) 2007-2018 GoodData Corporation
import React from 'react';
import ExampleWithSource from '../components/utils/ExampleWithSource';

import BarChartDynamicExample from '../components/BarChartDynamicExample';
import BarChartDynamicExampleSRC from '!raw-loader!../components/BarChartDynamicExample'; // eslint-disable-line


export const BarChartDynamic = () => (
    <div>
        <h1>Bar Chart with dynamic colors example</h1>

        <hr className="separator" />

        <ExampleWithSource for={BarChartDynamicExample} source={BarChartDynamicExampleSRC} />
    </div>
);

export default BarChartDynamic;
