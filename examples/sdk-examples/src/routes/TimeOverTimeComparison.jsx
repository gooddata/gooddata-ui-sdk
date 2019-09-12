// (C) 2007-2019 GoodData Corporation
import React from "react";

import ExampleWithSource from "../components/utils/ExampleWithSource";

import SamePeriodColumnChartExample from "../components/SamePeriodColumnChartExample";
import PreviousPeriodHeadlineExample from "../components/PreviousPeriodHeadlineExample";

import SamePeriodColumnChartExampleSrc from "!raw-loader!../components/SamePeriodColumnChartExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import PreviousPeriodHeadlineExampleSrc from "!raw-loader!../components/PreviousPeriodHeadlineExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const TimeOverTimeComparison = () => (
    <div>
        <h1>Time Over Time Comparison</h1>
        <p>
            These examples show how to configure visual components like column charts or headlines to show
            data compared to the previous period or to the same period of the previous year.
        </p>

        <hr className="separator" />

        <h2>Comparing to the same period previous year</h2>
        <ExampleWithSource for={SamePeriodColumnChartExample} source={SamePeriodColumnChartExampleSrc} />

        <hr className="separator" />

        <h2>Comparing to the previous period</h2>
        <ExampleWithSource for={PreviousPeriodHeadlineExample} source={PreviousPeriodHeadlineExampleSrc} />
    </div>
);

export default TimeOverTimeComparison;
