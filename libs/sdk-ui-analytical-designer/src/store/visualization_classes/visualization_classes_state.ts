// (C) 2026 GoodData Corporation

import { type IVisualizationClass } from "@gooddata/sdk-model";

export type IVisualizationClassesState = ReadonlyArray<IVisualizationClass>;

export const visualizationClassesInitialState: IVisualizationClassesState = [];

export type IVisualizationClassState = IVisualizationClass | null;

export const visualizationClassInitialState: IVisualizationClassState = null;
