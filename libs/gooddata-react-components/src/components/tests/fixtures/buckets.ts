// (C) 2007-2019 GoodData Corporation
import { VisualizationObject } from "@gooddata/typings";
import { measure } from "../../../helpers/model";

export const M1: VisualizationObject.IMeasure = measure("m1").localIdentifier("m1");
export const M1WithRatio: VisualizationObject.IMeasure = measure("m1")
    .localIdentifier("m1")
    .ratio();

export const M2: VisualizationObject.IMeasure = measure("m2").localIdentifier("m2");

export const M3: VisualizationObject.IMeasure = measure("m3").localIdentifier("m3");

export const M4: VisualizationObject.IMeasure = measure("m4").localIdentifier("m4");
