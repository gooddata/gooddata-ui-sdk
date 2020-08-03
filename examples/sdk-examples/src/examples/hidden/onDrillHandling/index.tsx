// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved */
import React from "react";

import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { BarChartOnDrillExample } from "./BarChartOnDrillExample";
import BarChartOnDrillExampleSRC from "!raw-loader!./BarChartOnDrillExample";
import { HeadlineOnDrillExample } from "./HeadlineOnDrillExample";
import HeadlineOnDrillExampleSRC from "!raw-loader!./HeadlineOnDrillExample";
import { InsightOnDrillExample } from "./InsightOnDrillExample";
import InsightOnDrillExampleSRC from "!raw-loader!./InsightOnDrillExample";

export const OnDrillHandling: React.FC = () => (
    <div>
        <h1>New drill handling by onDrill</h1>

        <p>Examples how onDrill handler is used on components and what is structure of event</p>

        <hr className="separator" />

        <h2 id="bar-chart">Bar chart</h2>
        <ExampleWithSource for={BarChartOnDrillExample} source={BarChartOnDrillExampleSRC} />

        <hr className="separator" />

        <h2 id="headline">Headline</h2>
        <ExampleWithSource for={HeadlineOnDrillExample} source={HeadlineOnDrillExampleSRC} />

        <hr className="separator" />

        <h2 id="insightView">Insight</h2>
        <ExampleWithSource for={InsightOnDrillExample} source={InsightOnDrillExampleSRC} />
    </div>
);
