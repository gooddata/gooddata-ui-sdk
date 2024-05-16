// (C) 2024 GoodData Corporation

import { VisualizationTypes } from "@gooddata/sdk-ui";

export type ChartType = typeof VisualizationTypes[keyof typeof VisualizationTypes];
