// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import { SamePeriodColumnChartExample } from "./SamePeriodColumnChartExample";
import PreviousPeriodHeadlineExample from "./PreviousPeriodHeadlineExample";

// eslint-disable-next-line import/no-unresolved
import SamePeriodColumnChartExampleSrc from "./SamePeriodColumnChartExample?raw";
// eslint-disable-next-line import/no-unresolved
import PreviousPeriodHeadlineExampleSrc from "./PreviousPeriodHeadlineExample?raw";

// eslint-disable-next-line import/no-unresolved
import SamePeriodColumnChartExampleSrcJS from "./SamePeriodColumnChartExample?rawJS";
// eslint-disable-next-line import/no-unresolved
import PreviousPeriodHeadlineExampleSrcJS from "./PreviousPeriodHeadlineExample?rawJS";

export const TimeOverTimeComparison: React.FC = () => (
    <div>
        <h1>Time Over Time Comparison</h1>
        <p>
            These examples show how to configure visual components like column charts or headlines to show
            data compared to the previous period or to the same period of the previous year.
        </p>

        <hr className="separator" />

        <h2>Comparing to the same period previous year</h2>
        <ExampleWithSource
            for={SamePeriodColumnChartExample}
            source={SamePeriodColumnChartExampleSrc}
            sourceJS={SamePeriodColumnChartExampleSrcJS}
        />

        <hr className="separator" />

        <h2>Comparing to the previous period</h2>
        <ExampleWithSource
            for={PreviousPeriodHeadlineExample}
            source={PreviousPeriodHeadlineExampleSrc}
            sourceJS={PreviousPeriodHeadlineExampleSrcJS}
        />
    </div>
);
