// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved */
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { MeasureValueFilterExample } from "./MeasureValueFilterExample";
import MeasureValueFilterExampleSRC from "!raw-loader!./MeasureValueFilterExample";
import { MeasureValueFilterShownInPercentageExample } from "./MeasureValueFilterShownInPercentageExample";
import MeasureValueFilterShownInPercentageExampleSRC from "!raw-loader!./MeasureValueFilterShownInPercentageExample";
import { MeasureValueFilterFormattedInPercentageExample } from "./MeasureValueFilterFormattedInPercentageExample";
import MeasureValueFilterFormattedInPercentageExampleSRC from "!raw-loader!./MeasureValueFilterFormattedInPercentageExample";
import { MeasureValueFilterStackedToHundredPercentExample } from "./MeasureValueFilterStackedToHundredPercentExample";
import MeasureValueFilterStackedToHundredPercentExampleSRC from "!raw-loader!./MeasureValueFilterStackedToHundredPercentExample";

export const MeasureValueFilter: React.FC = () => (
    <div>
        <h1>Filter by Measure Value</h1>
        <p>
            Here is how you can filter the entire insight by the value of a measure. The granularity is
            defined by the attributes in the insight.
        </p>
        <hr className="separator" />
        <h2>Comparison and range filters</h2>
        <p>Example of filtering of insightView by either one or two measure values.</p>
        <div className="s-measure-value-filter-example-1">
            <ExampleWithSource for={MeasureValueFilterExample} source={MeasureValueFilterExampleSRC} />
        </div>
        <h2>Filter by measure value shown in %</h2>
        <p>
            When insightView is filtered by a measure that is shown in %, the filter value is in{" "}
            <b>the original measure scale</b> and not in the percentage scale that is displayed in the
            insightView.
        </p>
        <div className="s-measure-value-filter-example-2">
            <ExampleWithSource
                for={MeasureValueFilterShownInPercentageExample}
                source={MeasureValueFilterShownInPercentageExampleSRC}
            />
        </div>
        <h2>Filter by measure value stacked to 100%</h2>
        <p>
            When insightView is filtered by a measure that is stacked to 100%, the filter value is in{" "}
            <b>the original measure scale</b> and not in the percentage scale that is displayed in the
            insightView.
        </p>
        <div className="s-measure-value-filter-example-3">
            <ExampleWithSource
                for={MeasureValueFilterStackedToHundredPercentExample}
                source={MeasureValueFilterStackedToHundredPercentExampleSRC}
            />
        </div>
        <h2>Filter by measure value formatted in %</h2>
        <p>
            When the insightView is filtered by a measure that is formatted in %, the filter value is in{" "}
            <b>the form of a ratio</b> (for instance 0.5 which is 50%) and not in the percentage scale. This
            applies to measures that have percentage format set by measure <em>format</em> property,
            calculated measures with percentage format set in metadata catalog, and arithmetic measures with{" "}
            <em>change</em> operator.
        </p>
        <div className="s-measure-value-filter-example-4">
            <ExampleWithSource
                for={MeasureValueFilterFormattedInPercentageExample}
                source={MeasureValueFilterFormattedInPercentageExampleSRC}
            />
        </div>
    </div>
);
