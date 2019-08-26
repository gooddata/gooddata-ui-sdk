// (C) 2007-2019 GoodData Corporation
import React from "react";
import { Link } from "react-router-dom";

import ExampleWithSource from "../components/utils/ExampleWithSource";

import ArithmeticMeasureSumExample from "../components/ArithmeticMeasureSumExample";
import ArithmeticMeasureMultiplicationExample from "../components/ArithmeticMeasureMultiplicationExample";
import ArithmeticMeasureRatioExample from "../components/ArithmeticMeasureRatioExample";
import ArithmeticMeasureChangeExample from "../components/ArithmeticMeasureChangeExample";
import ArithmeticMeasureDrillingExample from "../components/ArithmeticMeasureDrillingExample";

import ArithmeticMeasureSumExampleSrc from "!raw-loader!../components/ArithmeticMeasureSumExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import ArithmeticMeasureMultiplicationExampleSrc from "!raw-loader!../components/ArithmeticMeasureMultiplicationExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import ArithmeticMeasureRatioExampleSrc from "!raw-loader!../components/ArithmeticMeasureRatioExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import ArithmeticMeasureChangeExampleSrc from "!raw-loader!../components/ArithmeticMeasureChangeExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import ArithmeticMeasureDrillingExampleSrc from "!raw-loader!../components/ArithmeticMeasureDrillingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const ArithmeticMeasure = () => (
    <div>
        <h1>Arithmetic Measures</h1>
        <p>
            These examples show how to configure visual components like column charts or headlines to show
            data calculated on demand with defined arithmetical operations.
        </p>
        <p>
            Any arithmetic measure is built on top of two measures and given arithmetic operation between
            them. The base measures can be of any type (including the complex measures, such as{" "}
            <Link to="/time-over-time-comparison">Time Over Time Comparison</Link> or even another Arithmetic
            Measure).
        </p>

        <hr className="separator" />

        <h2>Ratio</h2>
        <p>Take two measures and divide them (e.g. gross margin = gross profit / net sales).</p>
        <ExampleWithSource for={ArithmeticMeasureRatioExample} source={ArithmeticMeasureRatioExampleSrc} />

        <h2>Change</h2>
        <p>Calculate percentual change between two measures.</p>

        <p>
            Note: This example shows how it is possible to use{" "}
            <Link to="/time-over-time-comparison">Time Over Time Comparison</Link> with Arithmetic Measures to
            display trend of the given metric.
        </p>
        <ExampleWithSource for={ArithmeticMeasureChangeExample} source={ArithmeticMeasureChangeExampleSrc} />

        <h2>Sum and difference</h2>
        <p>Add or subtract two measures (e.g. revenue in 2017 - revenue in 2016).</p>
        <ExampleWithSource for={ArithmeticMeasureSumExample} source={ArithmeticMeasureSumExampleSrc} />

        <h2>Multiplication</h2>
        <p>Multiply two measures (e.g. price per unit x volume = revenue).</p>
        <ExampleWithSource
            for={ArithmeticMeasureMultiplicationExample}
            source={ArithmeticMeasureMultiplicationExampleSrc}
        />

        <h2>Arithmetic Measures with Drilling</h2>
        <ExampleWithSource
            for={ArithmeticMeasureDrillingExample}
            source={ArithmeticMeasureDrillingExampleSrc}
        />
    </div>
);

export default ArithmeticMeasure;
