// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { BarChartDynamicExample } from "./BarChartDynamicExample";
import BarChartDynamicExampleSRC from "!raw-loader!./BarChartDynamicExample";
import ConfigurationColumnChartExample from "./ConfigurationColumnChartExample";
import ConfigurationColumnChartExampleSRC from "!raw-loader!./ConfigurationColumnChartExample";
import { PieChartColorMappingExample } from "./PieChartColorMappingExample";
import PieChartColorMappingExampleSRC from "!raw-loader!./PieChartColorMappingExample";
import { DualAxisColumnChartExample } from "./DualAxisColumnChartExample";
import DualAxisColumnChartExampleSRC from "!raw-loader!./DualAxisColumnChartExample";
import insightViewDualAxisBarChartExample from "./InsightViewDualAxisBarChartExample";
import insightViewDualAxisBarChartExampleSRC from "!raw-loader!./InsightViewDualAxisBarChartExample";

export const ChartConfiguration = () => (
    <div>
        <div>
            <h1>Customize chart bucket component</h1>

            <h2>Bar chart</h2>

            <hr className="separator" />

            <ExampleWithSource for={BarChartDynamicExample} source={BarChartDynamicExampleSRC} />

            <h2>Dual Axis Column chart</h2>

            <hr className="separator" />

            <ExampleWithSource for={DualAxisColumnChartExample} source={DualAxisColumnChartExampleSRC} />
        </div>

        <div>
            <h1>Customize chart insightView</h1>

            <h2>Dual Axis Bar chart</h2>

            <hr className="separator" />

            <ExampleWithSource
                for={insightViewDualAxisBarChartExample}
                source={insightViewDualAxisBarChartExampleSRC}
            />

            <h2>Column chart</h2>

            <hr className="separator" />

            <ExampleWithSource
                for={ConfigurationColumnChartExample}
                source={ConfigurationColumnChartExampleSRC}
            />
        </div>

        <div>
            <h1>Pie Chart with color mapping</h1>

            <hr className="separator" />

            <ExampleWithSource for={PieChartColorMappingExample} source={PieChartColorMappingExampleSRC} />
        </div>
    </div>
);
