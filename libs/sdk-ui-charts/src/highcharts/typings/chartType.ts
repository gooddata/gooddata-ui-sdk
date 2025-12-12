// (C) 2024-2025 GoodData Corporation

import { type VisualizationTypes } from "@gooddata/sdk-ui";

export type ChartType = (typeof VisualizationTypes)[keyof typeof VisualizationTypes];
