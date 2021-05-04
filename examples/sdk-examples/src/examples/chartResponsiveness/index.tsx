// (C) 2021 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";
import { HeadlineResponsiveExample } from "./HeadlineResponsiveExample";
import { BarChartResponsiveExample } from "./BarChartResponsiveExample";

import HeadlineResponsiveExampleSrc from "!raw-loader!./HeadlineResponsiveExample";
import BarChartResponsiveExampleSrc from "!raw-loader!./BarChartResponsiveExample";

import HeadlineResponsiveExampleSrcJS from "!raw-loader!../../../examplesJS/chartResponsiveness/HeadlineResponsiveExample";
import BarChartResponsiveExampleSrcJS from "!raw-loader!../../../examplesJS/chartResponsiveness/BarChartResponsiveExample";

export const ChartResponsiveness: React.FC = () => (
    <div>
        <h1>Chart Responsiveness</h1>
        <p>These examples show improved responsive behaviour of charts.</p>

        <h2 id="headline">Headline</h2>
        <ExampleWithSource
            for={HeadlineResponsiveExample}
            source={HeadlineResponsiveExampleSrc}
            sourceJS={HeadlineResponsiveExampleSrcJS}
        />
        <hr className="separator" />

        <h2 id="bar-chart">Visual Components</h2>
        <p>
            Small visual components will have parts of the chart hiden to improve user responsiveness
            experience.
        </p>
        <ExampleWithSource
            for={BarChartResponsiveExample}
            source={BarChartResponsiveExampleSrc}
            sourceJS={BarChartResponsiveExampleSrcJS}
        />
    </div>
);
