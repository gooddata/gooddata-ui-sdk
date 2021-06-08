// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import { InsightViewColumnChartByIdentifierExample } from "./InsightViewColumnChartByIdentifierExample";
import { InsightViewComboChartByIdentifierExample } from "./InsightViewComboChartByIdentifierExample";
import { InsightViewBarByIdentifierExample } from "./InsightViewBarByIdentifierExample";
import { InsightViewLineByIdentifierExample } from "./InsightViewLineByIdentifierExample";
import { InsightViewAreaByIdentifierExample } from "./InsightViewAreaByIdentifierExample";
import { InsightViewHeadlineByIdentifierExample } from "./InsightViewHeadlineByIdentifierExample";
import { InsightViewScatterByIdentifierExample } from "./InsightViewScatterByIdentifierExample";
import { InsightViewBubbleByIdentifierExample } from "./InsightViewBubbleByIdentifierExample";
import { InsightViewPieByIdentifierExample } from "./InsightViewPieByIdentifierExample";
import { InsightViewDonutByIdentifierExample } from "./InsightViewDonutByIdentifierExample";
import { InsightViewTreemapByIdentifierExample } from "./InsightViewTreemapByIdentifierExample";
import { InsightViewHeatmapByIdentifierExample } from "./InsightViewHeatmapByIdentifierExample";
import { InsightViewGeoPushpinByIdentifierExample } from "./InsightViewGeoPushpinByIdentifierExample";
import { InsightViewBulletByIdentifierExample } from "./InsightViewBulletByIdentifierExample";
import { InsightViewWithTitle } from "./InsightViewWithTitleExample";
import { InsightViewWithCustomTitle } from "./InsightViewWithCustomTitleExample";
import { InsightViewWithGeneratedTitleExample } from "./InsightViewWithGeneratedTitleExample";

import InsightViewColumnChartByIdentifierExampleSRC from "./InsightViewColumnChartByIdentifierExample?raw";
import InsightViewComboChartByIdentifierExampleSRC from "./InsightViewComboChartByIdentifierExample?raw";
import InsightViewTableExampleSRC from "./InsightViewPivotTableByIdentifierExample?raw";
import InsightViewBarByIdentifierExampleSRC from "./InsightViewBarByIdentifierExample?raw";
import InsightViewLineByIdentifierExampleSRC from "./InsightViewLineByIdentifierExample?raw";
import InsightViewAreaByIdentifierExampleSRC from "./InsightViewAreaByIdentifierExample?raw";
import InsightViewHeadlineByIdentifierExampleSRC from "./InsightViewHeadlineByIdentifierExample?raw";
import InsightViewScatterByIdentifierExampleSRC from "./InsightViewScatterByIdentifierExample?raw";
import InsightViewBubbleByIdentifierExampleSRC from "./InsightViewBubbleByIdentifierExample?raw";
import InsightViewPieByIdentifierExampleSRC from "./InsightViewPieByIdentifierExample?raw";
import InsightViewDonutByIdentifierExampleSRC from "./InsightViewDonutByIdentifierExample?raw";
import InsightViewTreemapByIdentifierExampleSRC from "./InsightViewTreemapByIdentifierExample?raw";
import InsightViewHeatmapByIdentifierExampleSRC from "./InsightViewHeatmapByIdentifierExample?raw";
import InsightViewGeoPushpinByIdentifierExampleSRC from "./InsightViewGeoPushpinByIdentifierExample?raw";
import InsightViewBulletByIdentifierExampleSRC from "./InsightViewBulletByIdentifierExample?raw";
import InsightViewWithTitleSRC from "./InsightViewWithTitleExample?raw";
import InsightViewWithCustomTitleSRC from "./InsightViewWithCustomTitleExample?raw";
import InsightViewWithGeneratedTitleExampleSRC from "./InsightViewWithGeneratedTitleExample?raw";

import InsightViewColumnChartByIdentifierExampleSRCJS from "./InsightViewColumnChartByIdentifierExample?rawJS";
import InsightViewComboChartByIdentifierExampleSRCJS from "./InsightViewComboChartByIdentifierExample?rawJS";
import InsightViewTableExampleSRCJS from "./InsightViewPivotTableByIdentifierExample?rawJS";
import InsightViewBarByIdentifierExampleSRCJS from "./InsightViewBarByIdentifierExample?rawJS";
import InsightViewLineByIdentifierExampleSRCJS from "./InsightViewLineByIdentifierExample?rawJS";
import InsightViewAreaByIdentifierExampleSRCJS from "./InsightViewAreaByIdentifierExample?rawJS";
import InsightViewHeadlineByIdentifierExampleSRCJS from "./InsightViewHeadlineByIdentifierExample?rawJS";
import InsightViewScatterByIdentifierExampleSRCJS from "./InsightViewScatterByIdentifierExample?rawJS";
import InsightViewBubbleByIdentifierExampleSRCJS from "./InsightViewBubbleByIdentifierExample?rawJS";
import InsightViewPieByIdentifierExampleSRCJS from "./InsightViewPieByIdentifierExample?rawJS";
import InsightViewDonutByIdentifierExampleSRCJS from "./InsightViewDonutByIdentifierExample?rawJS";
import InsightViewTreemapByIdentifierExampleSRCJS from "./InsightViewTreemapByIdentifierExample?rawJS";
import InsightViewHeatmapByIdentifierExampleSRCJS from "./InsightViewHeatmapByIdentifierExample?rawJS";
import InsightViewGeoPushpinByIdentifierExampleSRCJS from "./InsightViewGeoPushpinByIdentifierExample?rawJS";
import InsightViewBulletByIdentifierExampleSRCJS from "./InsightViewBulletByIdentifierExample?rawJS";
import InsightViewWithTitleSRCJS from "./InsightViewWithTitleExample?rawJS";
import InsightViewWithCustomTitleSRCJS from "./InsightViewWithCustomTitleExample?rawJS";
import InsightViewWithGeneratedTitleExampleSRCJS from "./InsightViewWithGeneratedTitleExample?rawJS";

import { InsightViewPivotTableByIdentifierExample } from "./InsightViewPivotTableByIdentifierExample";

export const InsightView = (): JSX.Element => (
    <div>
        <h1>InsightView by identifier</h1>

        <p>
            These are the examples of the generic insightView component that uses identifier to identify
            insights.
        </p>

        <hr className="separator" />

        <h2 id="column-chart">Column Chart</h2>
        <ExampleWithSource
            for={InsightViewColumnChartByIdentifierExample}
            source={InsightViewColumnChartByIdentifierExampleSRC}
            sourceJS={InsightViewColumnChartByIdentifierExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="table">Pivot Table</h2>
        <ExampleWithSource
            for={InsightViewPivotTableByIdentifierExample}
            source={InsightViewTableExampleSRC}
            sourceJS={InsightViewTableExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="bar">Bar Chart</h2>
        <ExampleWithSource
            for={InsightViewBarByIdentifierExample}
            source={InsightViewBarByIdentifierExampleSRC}
            sourceJS={InsightViewBarByIdentifierExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="line">Line Chart</h2>
        <ExampleWithSource
            for={InsightViewLineByIdentifierExample}
            source={InsightViewLineByIdentifierExampleSRC}
            sourceJS={InsightViewLineByIdentifierExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="area">Stacked Area Chart</h2>
        <ExampleWithSource
            for={InsightViewAreaByIdentifierExample}
            source={InsightViewAreaByIdentifierExampleSRC}
            sourceJS={InsightViewAreaByIdentifierExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="headline">Headline</h2>
        <ExampleWithSource
            for={InsightViewHeadlineByIdentifierExample}
            source={InsightViewHeadlineByIdentifierExampleSRC}
            sourceJS={InsightViewHeadlineByIdentifierExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="scatter">Scatter Plot</h2>
        <ExampleWithSource
            for={InsightViewScatterByIdentifierExample}
            source={InsightViewScatterByIdentifierExampleSRC}
            sourceJS={InsightViewScatterByIdentifierExampleSRCJS}
        />

        <hr className="separator" />
        <h2 id="bubble">Bubble Chart</h2>
        <ExampleWithSource
            for={InsightViewBubbleByIdentifierExample}
            source={InsightViewBubbleByIdentifierExampleSRC}
            sourceJS={InsightViewBubbleByIdentifierExampleSRCJS}
        />

        <hr className="separator" />
        <h2 id="headline">Bullet Chart</h2>
        <ExampleWithSource
            for={InsightViewBulletByIdentifierExample}
            source={InsightViewBulletByIdentifierExampleSRC}
            sourceJS={InsightViewBulletByIdentifierExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="pie">Pie Chart</h2>
        <ExampleWithSource
            for={InsightViewPieByIdentifierExample}
            source={InsightViewPieByIdentifierExampleSRC}
            sourceJS={InsightViewPieByIdentifierExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="donut">Donut Chart</h2>
        <ExampleWithSource
            for={InsightViewDonutByIdentifierExample}
            source={InsightViewDonutByIdentifierExampleSRC}
            sourceJS={InsightViewDonutByIdentifierExampleSRCJS}
        />

        <hr className="separator" />
        <h2 id="treemap">Treemap</h2>
        <ExampleWithSource
            for={InsightViewTreemapByIdentifierExample}
            source={InsightViewTreemapByIdentifierExampleSRC}
            sourceJS={InsightViewTreemapByIdentifierExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="heatmap">Heatmap</h2>
        <ExampleWithSource
            for={InsightViewHeatmapByIdentifierExample}
            source={InsightViewHeatmapByIdentifierExampleSRC}
            sourceJS={InsightViewHeatmapByIdentifierExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="combo">Combo Chart</h2>
        <ExampleWithSource
            for={InsightViewComboChartByIdentifierExample}
            source={InsightViewComboChartByIdentifierExampleSRC}
            sourceJS={InsightViewComboChartByIdentifierExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="combo">Geo Pushpin Chart</h2>
        <ExampleWithSource
            for={InsightViewGeoPushpinByIdentifierExample}
            source={InsightViewGeoPushpinByIdentifierExampleSRC}
            sourceJS={InsightViewGeoPushpinByIdentifierExampleSRCJS}
        />

        <hr className="separator" />

        <h2 id="combo">Insight view with title</h2>
        <ExampleWithSource
            for={InsightViewWithTitle}
            source={InsightViewWithTitleSRC}
            sourceJS={InsightViewWithTitleSRCJS}
        />

        <hr className="separator" />

        <h2 id="combo">Insight view with custom title</h2>
        <ExampleWithSource
            for={InsightViewWithCustomTitle}
            source={InsightViewWithCustomTitleSRC}
            sourceJS={InsightViewWithCustomTitleSRCJS}
        />

        <hr className="separator" />

        <h2 id="combo">Insight view with generated title</h2>
        <ExampleWithSource
            for={InsightViewWithGeneratedTitleExample}
            source={InsightViewWithGeneratedTitleExampleSRC}
            sourceJS={InsightViewWithGeneratedTitleExampleSRCJS}
        />
    </div>
);
