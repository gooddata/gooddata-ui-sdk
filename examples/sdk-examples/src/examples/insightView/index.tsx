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

import InsightViewColumnChartByIdentifierExampleSRC from "!raw-loader!./InsightViewColumnChartByIdentifierExample";
import InsightViewComboChartByIdentifierExampleSRC from "!raw-loader!./InsightViewComboChartByIdentifierExample";
import InsightViewTableExampleSRC from "!raw-loader!./InsightViewPivotTableByIdentifierExample";
import InsightViewBarByIdentifierExampleSRC from "!raw-loader!./InsightViewBarByIdentifierExample";
import InsightViewLineByIdentifierExampleSRC from "!raw-loader!./InsightViewLineByIdentifierExample";
import InsightViewAreaByIdentifierExampleSRC from "!raw-loader!./InsightViewAreaByIdentifierExample";
import InsightViewHeadlineByIdentifierExampleSRC from "!raw-loader!./InsightViewHeadlineByIdentifierExample";
import InsightViewScatterByIdentifierExampleSRC from "!raw-loader!./InsightViewScatterByIdentifierExample";
import InsightViewBubbleByIdentifierExampleSRC from "!raw-loader!./InsightViewBubbleByIdentifierExample";
import InsightViewPieByIdentifierExampleSRC from "!raw-loader!./InsightViewPieByIdentifierExample";
import InsightViewDonutByIdentifierExampleSRC from "!raw-loader!./InsightViewDonutByIdentifierExample";
import InsightViewTreemapByIdentifierExampleSRC from "!raw-loader!./InsightViewTreemapByIdentifierExample";
import InsightViewHeatmapByIdentifierExampleSRC from "!raw-loader!./InsightViewHeatmapByIdentifierExample";
import InsightViewGeoPushpinByIdentifierExampleSRC from "!raw-loader!./InsightViewGeoPushpinByIdentifierExample";
import InsightViewBulletByIdentifierExampleSRC from "!raw-loader!./InsightViewBulletByIdentifierExample";

import InsightViewColumnChartByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewColumnChartByIdentifierExample";
import InsightViewComboChartByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewComboChartByIdentifierExample";
import InsightViewTableExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewPivotTableByIdentifierExample";
import InsightViewBarByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewBarByIdentifierExample";
import InsightViewLineByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewLineByIdentifierExample";
import InsightViewAreaByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewAreaByIdentifierExample";
import InsightViewHeadlineByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewHeadlineByIdentifierExample";
import InsightViewScatterByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewScatterByIdentifierExample";
import InsightViewBubbleByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewBubbleByIdentifierExample";
import InsightViewPieByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewPieByIdentifierExample";
import InsightViewDonutByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewDonutByIdentifierExample";
import InsightViewTreemapByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewTreemapByIdentifierExample";
import InsightViewHeatmapByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewHeatmapByIdentifierExample";
import InsightViewGeoPushpinByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewGeoPushpinByIdentifierExample";
import InsightViewBulletByIdentifierExampleSRCJS from "!raw-loader!../../../examplesJS/insightView/InsightViewBulletByIdentifierExample";
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
    </div>
);
