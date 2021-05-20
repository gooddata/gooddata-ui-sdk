// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";
import { Link } from "react-router-dom";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import { ArithmeticMeasureSumExample } from "./ArithmeticMeasureSumExample";
import { ArithmeticMeasureMultiplicationExample } from "./ArithmeticMeasureMultiplicationExample";
import { ArithmeticMeasureRatioExample } from "./ArithmeticMeasureRatioExample";
import { ArithmeticMeasureChangeExample } from "./ArithmeticMeasureChangeExample";
import { ArithmeticMeasureDrillingExample } from "./ArithmeticMeasureDrillingExample";

import ArithmeticMeasureSumExampleSrc from "./ArithmeticMeasureSumExample?raw";
import ArithmeticMeasureMultiplicationExampleSrc from "./ArithmeticMeasureMultiplicationExample?raw";
import ArithmeticMeasureRatioExampleSrc from "./ArithmeticMeasureRatioExample?raw";
import ArithmeticMeasureChangeExampleSrc from "./ArithmeticMeasureChangeExample?raw";
import ArithmeticMeasureDrillingExampleSrc from "./ArithmeticMeasureDrillingExample?raw";

import ArithmeticMeasureSumExampleSrcJS from "./ArithmeticMeasureSumExample?rawJS";
import ArithmeticMeasureMultiplicationExampleSrcJS from "./ArithmeticMeasureMultiplicationExample?rawJS";
import ArithmeticMeasureRatioExampleSrcJS from "./ArithmeticMeasureRatioExample?rawJS";
import ArithmeticMeasureChangeExampleSrcJS from "./ArithmeticMeasureChangeExample?rawJS";
import ArithmeticMeasureDrillingExampleSrcJS from "./ArithmeticMeasureDrillingExample?rawJS";

export const ArithmeticMeasures: React.FC = () => (
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
        <ExampleWithSource
            for={ArithmeticMeasureRatioExample}
            source={ArithmeticMeasureRatioExampleSrc}
            sourceJS={ArithmeticMeasureRatioExampleSrcJS}
        />

        <h2>Change</h2>
        <p>Calculate percentual change between two measures.</p>

        <p>
            Note: This example shows how it is possible to use{" "}
            <Link to="/time-over-time-comparison">Time Over Time Comparison</Link> with Arithmetic Measures to
            display trend of the given metric.
        </p>
        <ExampleWithSource
            for={ArithmeticMeasureChangeExample}
            source={ArithmeticMeasureChangeExampleSrc}
            sourceJS={ArithmeticMeasureChangeExampleSrcJS}
        />

        <h2>Sum and difference</h2>
        <p>Add or subtract two measures (e.g. revenue in 2017 - revenue in 2016).</p>
        <ExampleWithSource
            for={ArithmeticMeasureSumExample}
            source={ArithmeticMeasureSumExampleSrc}
            sourceJS={ArithmeticMeasureSumExampleSrcJS}
        />

        <h2>Multiplication</h2>
        <p>Multiply two measures (e.g. price per unit x volume = revenue).</p>
        <ExampleWithSource
            for={ArithmeticMeasureMultiplicationExample}
            source={ArithmeticMeasureMultiplicationExampleSrc}
            sourceJS={ArithmeticMeasureMultiplicationExampleSrcJS}
        />

        <h2>Arithmetic Measures with Drilling</h2>
        <ExampleWithSource
            for={ArithmeticMeasureDrillingExample}
            source={ArithmeticMeasureDrillingExampleSrc}
            sourceJS={ArithmeticMeasureDrillingExampleSrcJS}
        />
    </div>
);
