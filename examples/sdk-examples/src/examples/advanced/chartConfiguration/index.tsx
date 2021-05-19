// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";
import { ExampleWithSource } from "../../../components/ExampleWithSource";
import { BarChartDynamicExample } from "./BarChartDynamicExample";
import BarChartDynamicExampleSRC from "./BarChartDynamicExample?raw";
import BarChartDynamicExampleSRCJS from "./BarChartDynamicExample?rawJS";
import ConfigurationColumnChartExample from "./ConfigurationColumnChartExample";
import ConfigurationColumnChartExampleSRC from "./ConfigurationColumnChartExample?raw";
import ConfigurationColumnChartExampleSRCJS from "./ConfigurationColumnChartExample?rawJS";
import { PieChartColorMappingExample } from "./PieChartColorMappingExample";
import PieChartColorMappingExampleSRC from "./PieChartColorMappingExample?raw";
import PieChartColorMappingExampleSRCJS from "./PieChartColorMappingExample?rawJS";
import { DualAxisColumnChartExample } from "./DualAxisColumnChartExample";
import DualAxisColumnChartExampleSRC from "./DualAxisColumnChartExample?raw";
import DualAxisColumnChartExampleSRCJS from "./DualAxisColumnChartExample?rawJS";
import insightViewDualAxisBarChartExample from "./InsightViewDualAxisBarChartExample";
import insightViewDualAxisBarChartExampleSRC from "./InsightViewDualAxisBarChartExample?raw";
import insightViewDualAxisBarChartExampleSRCJS from "./InsightViewDualAxisBarChartExample?rawJS";

export const ChartConfiguration = (): JSX.Element => (
    <div>
        <div>
            <h1>Customize chart bucket component</h1>

            <h2>Bar chart</h2>

            <hr className="separator" />

            <ExampleWithSource
                for={BarChartDynamicExample}
                source={BarChartDynamicExampleSRC}
                sourceJS={BarChartDynamicExampleSRCJS}
            />

            <h2>Dual Axis Column chart</h2>

            <hr className="separator" />

            <ExampleWithSource
                for={DualAxisColumnChartExample}
                source={DualAxisColumnChartExampleSRC}
                sourceJS={DualAxisColumnChartExampleSRCJS}
            />
        </div>

        <div>
            <h1>Customize chart insightView</h1>

            <h2>Dual Axis Bar chart</h2>

            <hr className="separator" />

            <ExampleWithSource
                for={insightViewDualAxisBarChartExample}
                source={insightViewDualAxisBarChartExampleSRC}
                sourceJS={insightViewDualAxisBarChartExampleSRCJS}
            />

            <h2>Column chart</h2>

            <hr className="separator" />

            <ExampleWithSource
                for={ConfigurationColumnChartExample}
                source={ConfigurationColumnChartExampleSRC}
                sourceJS={ConfigurationColumnChartExampleSRCJS}
            />
        </div>

        <div>
            <h1>Pie Chart with color mapping</h1>

            <hr className="separator" />

            <ExampleWithSource
                for={PieChartColorMappingExample}
                source={PieChartColorMappingExampleSRC}
                sourceJS={PieChartColorMappingExampleSRCJS}
            />
        </div>
    </div>
);
