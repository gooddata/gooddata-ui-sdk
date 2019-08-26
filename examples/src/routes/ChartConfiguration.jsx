// (C) 2007-2019 GoodData Corporation
import React from "react";
import ExampleWithSource from "../components/utils/ExampleWithSource";

import BarChartDynamicExample from "../components/BarChartDynamicExample";
import BarChartDynamicExampleSRC from "!raw-loader!../components/BarChartDynamicExample"; // eslint-disable-line
import ConfigurationColumnChartExample from "../components/ConfigurationColumnChartExample";
import ConfigurationColumnChartExampleSRC from "!raw-loader!../components/ConfigurationColumnChartExample"; // eslint-disable-line
import PieChartColorMappingExample from "../components/PieChartColorMappingExample";
import PieChartColorMappingExampleSRC from "!raw-loader!../components/PieChartColorMappingExample"; // eslint-disable-line
import DualAxisColumnChartExample from "../components/DualAxisColumnChartExample";
import DualAxisColumnChartExampleSRC from "!raw-loader!../components/DualAxisColumnChartExample"; // eslint-disable-line
import VisualizationDualAxisBarChartExample from "../components/VisualizationDualAxisBarChartExample";
import VisualizationDualAxisBarChartExampleSRC from "!raw-loader!../components/VisualizationDualAxisBarChartExample"; // eslint-disable-line

export const BarChartDynamic = () => (
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
            <h1>Customize chart visualization</h1>

            <h2>Dual Axis Bar chart</h2>

            <hr className="separator" />

            <ExampleWithSource
                for={VisualizationDualAxisBarChartExample}
                source={VisualizationDualAxisBarChartExampleSRC}
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

export default BarChartDynamic;
