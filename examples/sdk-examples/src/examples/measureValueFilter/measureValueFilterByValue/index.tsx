// (C) 2007-2020 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";
import MeasureValueFilterExample from "./MeasureValueFilterExample";
import MeasureValueFilterShownInPercentageExample from "./MeasureValueFilterShownInPercentageExample";
import MeasureValueFilterStackedToHundredPercentExample from "./MeasureValueFilterStackedToHundredPercentExample";
import MeasureValueFilterFormattedInPercentageExample from "./MeasureValueFilterFormattedInPercentageExample";

import MeasureValueFilterExampleSRC from "!raw-loader!./MeasureValueFilterExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterShownInPercentageExampleSRC from "!raw-loader!./MeasureValueFilterShownInPercentageExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterStackedToHundredPercentExampleSRC from "!raw-loader!./MeasureValueFilterStackedToHundredPercentExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterFormattedInPercentageExampleSRC from "!raw-loader!./MeasureValueFilterFormattedInPercentageExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

import MeasureValueFilterExampleSRCJS from "!raw-loader!../../../../examplesJS/measureValueFilter/measureValueFilterByValue/MeasureValueFilterExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterShownInPercentageExampleSRCJS from "!raw-loader!../../../../examplesJS/measureValueFilter/measureValueFilterByValue/MeasureValueFilterShownInPercentageExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterStackedToHundredPercentExampleSRCJS from "!raw-loader!../../../../examplesJS/measureValueFilter/measureValueFilterByValue/MeasureValueFilterStackedToHundredPercentExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import MeasureValueFilterFormattedInPercentageExampleSRCJS from "!raw-loader!../../../../examplesJS/measureValueFilter/measureValueFilterByValue/MeasureValueFilterFormattedInPercentageExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const MeasureValueFilter = (): JSX.Element => (
    <div>
        <h1>Filter by Measure Value</h1>
        <p>
            Here is how you can filter the entire insight by the value of a measure. The granularity is
            defined by the attributes in the insight.
        </p>
        <hr className="separator" />
        <h2>Comparison and range filters</h2>
        <p>This is the example of filtering the visualization by either one or two measure values:</p>
        <div className="s-measure-value-filter-example-1">
            <ExampleWithSource
                for={MeasureValueFilterExample}
                source={MeasureValueFilterExampleSRC}
                sourceJS={MeasureValueFilterExampleSRCJS}
            />
        </div>
        <h2>Filter by a measure value shown in %</h2>
        <p>
            When the visualization is filtered by a measure that is shown in %, the filter value is in{" "}
            <b>the original measure scale</b> and not in the percentage scale that is displayed in the
            visualization.
        </p>
        <div className="s-measure-value-filter-example-2">
            <ExampleWithSource
                for={MeasureValueFilterShownInPercentageExample}
                source={MeasureValueFilterShownInPercentageExampleSRC}
                sourceJS={MeasureValueFilterShownInPercentageExampleSRCJS}
            />
        </div>
        <h2>Filter by a measure value stacked to 100%</h2>
        <p>
            When the visualization is filtered by a measure that is stacked to 100%, the filter value is in{" "}
            <b>the original measure scale</b> and not in the percentage scale that is displayed in the
            visualization.
        </p>
        <div className="s-measure-value-filter-example-3">
            <ExampleWithSource
                for={MeasureValueFilterStackedToHundredPercentExample}
                source={MeasureValueFilterStackedToHundredPercentExampleSRC}
                sourceJS={MeasureValueFilterStackedToHundredPercentExampleSRCJS}
            />
        </div>
        <h2>Filter by a measure value formatted in %</h2>
        <p>
            When the visualization is filtered by a measure that is formatted in %, the filter value is in{" "}
            <b>the form of a ratio</b> (for instance, 0.5, which is 50%) and not in the percentage scale. This
            applies to measures that have the percentage format set by the <em>format</em> measure property,
            calculated measures with the percentage format set in metadata catalog, and arithmetic measures
            with the <em>change</em> operator.
        </p>
        <div className="s-measure-value-filter-example-4">
            <ExampleWithSource
                for={MeasureValueFilterFormattedInPercentageExample}
                source={MeasureValueFilterFormattedInPercentageExampleSRC}
                sourceJS={MeasureValueFilterFormattedInPercentageExampleSRCJS}
            />
        </div>
    </div>
);
