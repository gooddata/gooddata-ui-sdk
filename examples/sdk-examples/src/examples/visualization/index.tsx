// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import { VisualizationColumnChartByIdentifierExample } from "./VisualizationColumnChartByIdentifierExample";
import { VisualizationComboChartByIdentifierExample } from "./VisualizationComboChartByIdentifierExample";
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

import VisualizationColumnChartByIdentifierExampleSRC from "!raw-loader!./VisualizationColumnChartByIdentifierExample";
import VisualizationComboChartByIdentifierExampleSRC from "!raw-loader!./VisualizationComboChartByIdentifierExample";
// import VisualizationTableExampleSRC from "!raw-loader!./VisualizationTableByIdentifierExample";
// import CustomVisualizationExampleSRC from "!raw-loader!./CustomVisualizationExample";
import VisualizationBarByIdentifierExampleSrc from "!raw-loader!./VisualizationBarByIdentifierExample";
import VisualizationLineByIdentifierExampleSRC from "!raw-loader!./VisualizationLineByIdentifierExample";
import VisualizationAreaByIdentifierExampleSRC from "!raw-loader!./VisualizationAreaByIdentifierExample";
import VisualizationHeadlineByIdentifierExampleSRC from "!raw-loader!./VisualizationHeadlineByIdentifierExample";
import VisualizationScatterByIdentifierExampleSRC from "!raw-loader!./VisualizationScatterByIdentifierExample";
import VisualizationBubbleByIdentifierExampleSRC from "!raw-loader!./VisualizationBubbleByIdentifierExample";
import VisualizationPieByIdentifierExampleSRC from "!raw-loader!./VisualizationPieByIdentifierExample";
import VisualizationDonutByIdentifierExampleSRC from "!raw-loader!./VisualizationDonutByIdentifierExample";
import VisualizationTreemapByIdentifierExampleSRC from "!raw-loader!./VisualizationTreemapByIdentifierExample";
import VisualizationHeatmapByIdentifierExampleSRC from "!raw-loader!./VisualizationHeatmapByIdentifierExample";

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

        <hr className="separator" />

        <h2 id="heatmap">Combo Chart</h2>
        <ExampleWithSource
            for={VisualizationComboChartByIdentifierExample}
            source={VisualizationComboChartByIdentifierExampleSRC}
        />
    </div>
);
