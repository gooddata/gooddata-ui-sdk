// (C) 2022 GoodData Corporation
import React from "react";
import { AreaChart, BulletChart, Headline, Heatmap, ScatterPlot } from "@gooddata/sdk-ui-charts";
import { IMeasure, newMeasure } from "@gooddata/sdk-model";

const measure: IMeasure = newMeasure("foo");

export const heatmap = <Heatmap measure={measure} />;
export const area = <AreaChart measures={[measure]} />;
export const headline = <Headline primaryMeasure={measure} secondaryMeasure={measure} />;
export const bullet = (
    <BulletChart primaryMeasure={measure} comparativeMeasure={measure} targetMeasure={measure} />
);
export const scatter = <ScatterPlot xAxisMeasure={measure} yAxisMeasure={measure} />;
