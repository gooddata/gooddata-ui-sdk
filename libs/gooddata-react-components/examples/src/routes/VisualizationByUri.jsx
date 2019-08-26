// (C) 2007-2018 GoodData Corporation
import React from "react";

import ExampleWithSource from "../components/utils/ExampleWithSource";

import VisualizationColumnChartExample from "../components/VisualizationColumnChartByUriExample";
import VisualizationTableExample from "../components/VisualizationTableByUriExample";
import VisualizationBarExample from "../components/VisualizationBarByUriExample";
import VisualizationLineExample from "../components/VisualizationLineByUriExample";
import VisualizationAreaExample from "../components/VisualizationAreaByUriExample";
import VisualizationHeadlineExample from "../components/VisualizationHeadlineByUriExample";
import VisualizationScatterExample from "../components/VisualizationScatterByUriExample";
import VisualizationBubbleExample from "../components/VisualizationBubbleByUriExample";
import VisualizationPieExample from "../components/VisualizationPieByUriExample";
import VisualizationDonutExample from "../components/VisualizationDonutByUriExample";
import VisualizationTreemapExample from "../components/VisualizationTreemapByUriExample";
import VisualizationHeatmapExample from "../components/VisualizationHeatmapByUriExample";

import VisualizationColumnChartByUriExampleSRC from "!raw-loader!../components/VisualizationColumnChartByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationTableExampleSRC from "!raw-loader!../components/VisualizationTableByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationBarExampleSRC from "!raw-loader!../components/VisualizationBarByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationLineExampleSRC from "!raw-loader!../components/VisualizationLineByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationAreaExampleSRC from "!raw-loader!../components/VisualizationAreaByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationHeadlineExampleSRC from "!raw-loader!../components/VisualizationHeadlineByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationScatterExampleSRC from "!raw-loader!../components/VisualizationScatterByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationBubbleExampleSRC from "!raw-loader!../components/VisualizationBubbleByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationPieExampleSRC from "!raw-loader!../components/VisualizationPieByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationDonutExampleSRC from "!raw-loader!../components/VisualizationDonutByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationTreemapExampleSRC from "!raw-loader!../components/VisualizationTreemapByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationHeatmapExampleSRC from "!raw-loader!../components/VisualizationHeatmapByUriExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const VisualizationByUri = () => (
    <div>
        <h1>Visualization by URI</h1>

        <p>
            These are the examples of the generic Visualization component that uses URI to identify insights.
        </p>

        <hr className="separator" />

        <h2 id="column-chart">Column Chart</h2>
        <ExampleWithSource
            for={VisualizationColumnChartExample}
            source={VisualizationColumnChartByUriExampleSRC}
        />

        <hr className="separator" />

        <h2 id="table">Table</h2>
        <ExampleWithSource for={VisualizationTableExample} source={VisualizationTableExampleSRC} />

        <hr className="separator" />

        <h2 id="bar">Bar Chart</h2>
        <ExampleWithSource for={VisualizationBarExample} source={VisualizationBarExampleSRC} />

        <hr className="separator" />

        <h2 id="line">Line Chart</h2>
        <ExampleWithSource for={VisualizationLineExample} source={VisualizationLineExampleSRC} />

        <hr className="separator" />

        <h2 id="area">Stacked Area Chart</h2>
        <ExampleWithSource for={VisualizationAreaExample} source={VisualizationAreaExampleSRC} />

        <hr className="separator" />

        <h2 id="headline">Headline</h2>
        <ExampleWithSource for={VisualizationHeadlineExample} source={VisualizationHeadlineExampleSRC} />

        <hr className="separator" />

        <h2 id="scatter">Scatter Plot</h2>
        <ExampleWithSource for={VisualizationScatterExample} source={VisualizationScatterExampleSRC} />

        <hr className="separator" />

        <h2 id="bubble">Bubble Chart</h2>
        <ExampleWithSource for={VisualizationBubbleExample} source={VisualizationBubbleExampleSRC} />

        <hr className="separator" />

        <h2 id="pie">Pie Chart</h2>
        <ExampleWithSource for={VisualizationPieExample} source={VisualizationPieExampleSRC} />

        <hr className="separator" />

        <h2 id="donut">Donut Chart</h2>
        <ExampleWithSource for={VisualizationDonutExample} source={VisualizationDonutExampleSRC} />

        <hr className="separator" />

        <h2 id="treemap">Treemap</h2>
        <ExampleWithSource for={VisualizationTreemapExample} source={VisualizationTreemapExampleSRC} />

        <hr className="separator" />

        <h2 id="heatmap">Heatmap</h2>
        <ExampleWithSource for={VisualizationHeatmapExample} source={VisualizationHeatmapExampleSRC} />
    </div>
);

export default VisualizationByUri;
