// (C) 2021 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";
import { HeadlineResponsiveExample } from "./HeadlineResponsiveExample";
import { BarChartResponsiveExample } from "./BarChartResponsiveExample";
import { ColumnChartResponsiveLegendExample } from "./ColumnChartResponsiveLegendExample";

import HeadlineResponsiveExampleSrc from "!raw-loader!./HeadlineResponsiveExample";
import BarChartResponsiveExampleSrc from "!raw-loader!./BarChartResponsiveExample";
import ColumnChartResponsiveLegendExampleSrc from "!raw-loader!./ColumnChartResponsiveLegendExample";

import HeadlineResponsiveExampleSrcJS from "!raw-loader!../../../examplesJS/chartResponsiveness/HeadlineResponsiveExample";
import BarChartResponsiveExampleSrcJS from "!raw-loader!../../../examplesJS/chartResponsiveness/BarChartResponsiveExample";
import ColumnChartResponsiveLegendExampleSrcJS from "!raw-loader!../../../examplesJS/chartResponsiveness/ColumnChartResponsiveLegendExample";

export const ChartResponsiveness: React.FC = () => (
    <div>
        <h1>Chart Responsiveness</h1>
        <p>These examples show responsive behavior of charts.</p>

        <h2 id="headline">Headline</h2>
        <p>
            When rendered in the smallest possible size, headlines enable pagination. If there is enough
            vertical space, a headline displays additional values one under the other. If there is enough
            horizontal space, it uses the default side-by-side layout.
        </p>

        <ExampleWithSource
            for={HeadlineResponsiveExample}
            source={HeadlineResponsiveExampleSrc}
            sourceJS={HeadlineResponsiveExampleSrcJS}
        />
        <hr className="separator" />

        <h2 id="bar-chart">Visual Components</h2>
        <p>
            When rendered in a smaller size, visual components hide different sections to improve a visual
            user experience. You can see how the chart changes when you switch between different heights. With
            the smallest value, the chart has only the axis title visible. With the middle value, the chart
            has only the axis labels visible. With the largest value, the chart has both the axis title and
            labels visible.
        </p>
        <ExampleWithSource
            for={BarChartResponsiveExample}
            source={BarChartResponsiveExampleSrc}
            sourceJS={BarChartResponsiveExampleSrcJS}
        />
        <h2>Responsive legend</h2>
        <p>
            To see a responsive legend, try various combinations of the legend position/responsiveness and the
            container dimensions. When the responsiveness is set to &quot;autoPositionWithPopup&quot;, you can
            see that the legend has a forced position and appears as a popup in smaller containers.
        </p>
        <ExampleWithSource
            for={ColumnChartResponsiveLegendExample}
            source={ColumnChartResponsiveLegendExampleSrc}
            sourceJS={ColumnChartResponsiveLegendExampleSrcJS}
        />
    </div>
);
