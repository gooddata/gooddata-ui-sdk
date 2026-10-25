// (C) 2026 GoodData Corporation

import { type IAppState } from "../types.js";

export const getVisualizationClassesState = (state: IAppState) => state.data.visualizationClasses;

export const getVisualizationClassState = (state: IAppState) => state.data.visualizationClass;

export const getVisualizationClassUrl = (state: IAppState): string | undefined =>
    getVisualizationClassState(state)?.visualizationClass.url;
