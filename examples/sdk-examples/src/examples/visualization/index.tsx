// (C) 2007-2019 GoodData Corporation
import React from "react";

import ExampleWithSource from "../../components/ExampleWithSource";

import { VisualizationColumnChartByIdentifierExample } from "./VisualizationColumnChartByIdentifierExample";
// import VisualizationTableExample from "../components/VisualizationTableByIdentifierExample";
// import CustomVisualizationExample from "../components/CustomVisualizationExample";
import { VisualizationBarByIdentifierExample } from "./VisualizationBarByIdentifierExample";
import { VisualizationLineByIdentifierExample } from "./VisualizationLineByIdentifierExample";
import { VisualizationAreaByIdentifierExample } from "./VisualizationAreaByIdentifierExample";
import { VisualizationHeadlineByIdentifierExample } from "./VisualizationHeadlineByIdentifierExample";
import { VisualizationScatterByIdentifierExample } from "./VisualizationScatterByIdentifierExample";
import { VisualizationBubbleByIdentifierExample } from "./VisualizationBubbleByIdentifierExample";
import { VisualizationPieByIdentifierExample } from "./VisualizationPieByIdentifierExample";
import { VisualizationDonutByIdentifierExample } from "./VisualizationDonutByIdentifierExample";
import { VisualizationTreemapByIdentifierExample } from "./VisualizationTreemapByIdentifierExample";
import { VisualizationHeatmapByIdentifierExample } from "./VisualizationHeatmapByIdentifierExample";

import VisualizationColumnChartByIdentifierExampleSRC from "!raw-loader!./VisualizationColumnChartByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
// import VisualizationTableExampleSRC from "!raw-loader!./VisualizationTableByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
// import CustomVisualizationExampleSRC from "!raw-loader!./CustomVisualizationExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationBarByIdentifierExampleSrc from "!raw-loader!./VisualizationBarByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationLineByIdentifierExampleSRC from "!raw-loader!./VisualizationLineByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationAreaByIdentifierExampleSRC from "!raw-loader!./VisualizationAreaByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationHeadlineByIdentifierExampleSRC from "!raw-loader!./VisualizationHeadlineByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationScatterByIdentifierExampleSRC from "!raw-loader!./VisualizationScatterByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationBubbleByIdentifierExampleSRC from "!raw-loader!./VisualizationBubbleByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationPieByIdentifierExampleSRC from "!raw-loader!./VisualizationPieByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationDonutByIdentifierExampleSRC from "!raw-loader!./VisualizationDonutByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationTreemapByIdentifierExampleSRC from "!raw-loader!./VisualizationTreemapByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import VisualizationHeatmapByIdentifierExampleSRC from "!raw-loader!./VisualizationHeatmapByIdentifierExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const Visualization = () => (
    <div>
        <h1>Visualization by identifier</h1>

        <p>
            These are the examples of the generic Visualization component that uses identifier to identify
            insights.
        </p>

        <hr className="separator" />

        <h2 id="column-chart">Column Chart</h2>
        <ExampleWithSource
            for={VisualizationColumnChartByIdentifierExample}
            source={VisualizationColumnChartByIdentifierExampleSRC}
        />

        <hr className="separator" />
        {/*         
        <h2 id="table">Table</h2>
        <ExampleWithSource for={VisualizationTableExample} source={VisualizationTableExampleSRC} />
        
        <hr className="separator" /> 
        <h2 id="custom">Custom Visualization</h2>
        <p>
            Using <a href="https://github.com/recharts/recharts">Recharts library</a>
        </p>
        <ExampleWithSource for={CustomVisualizationExample} source={CustomVisualizationExampleSRC} />

       
        <hr className="separator" />
        */}

        <h2 id="bar">Bar Chart</h2>
        <ExampleWithSource
            for={VisualizationBarByIdentifierExample}
            source={VisualizationBarByIdentifierExampleSrc}
        />

        <hr className="separator" />

        <h2 id="line">Line Chart</h2>
        <ExampleWithSource
            for={VisualizationLineByIdentifierExample}
            source={VisualizationLineByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="area">Stacked Area Chart</h2>
        <ExampleWithSource
            for={VisualizationAreaByIdentifierExample}
            source={VisualizationAreaByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="headline">Headline</h2>
        <ExampleWithSource
            for={VisualizationHeadlineByIdentifierExample}
            source={VisualizationHeadlineByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="scatter">Scatter Plot</h2>
        <ExampleWithSource
            for={VisualizationScatterByIdentifierExample}
            source={VisualizationScatterByIdentifierExampleSRC}
        />

        <hr className="separator" />
        <h2 id="bubble">Bubble Chart</h2>
        <ExampleWithSource
            for={VisualizationBubbleByIdentifierExample}
            source={VisualizationBubbleByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="pie">Pie Chart</h2>
        <ExampleWithSource
            for={VisualizationPieByIdentifierExample}
            source={VisualizationPieByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="donut">Donut Chart</h2>
        <ExampleWithSource
            for={VisualizationDonutByIdentifierExample}
            source={VisualizationDonutByIdentifierExampleSRC}
        />

        <hr className="separator" />
        <h2 id="treemap">Treemap</h2>
        <ExampleWithSource
            for={VisualizationTreemapByIdentifierExample}
            source={VisualizationTreemapByIdentifierExampleSRC}
        />

        <hr className="separator" />

        <h2 id="heatmap">Heatmap</h2>
        <ExampleWithSource
            for={VisualizationHeatmapByIdentifierExample}
            source={VisualizationHeatmapByIdentifierExampleSRC}
        />
    </div>
);
