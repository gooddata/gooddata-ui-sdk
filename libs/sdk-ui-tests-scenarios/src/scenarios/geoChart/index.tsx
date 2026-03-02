// (C) 2026 GoodData Corporation

import { areaBase, pushpinBase } from "./base.js";
import { clusters } from "./clusters.js";
import { areaColoring, geoLayerColoringMatrix, pushpinColoring } from "./coloring.js";
import { areaLegends, legends } from "./legends.js";
import { multiLayer, multiLayerClusters } from "./multiLayer.js";
import { areaViewports, pushpinViewports } from "./viewport.js";

export const geoChartScenarios = [
    pushpinBase,
    areaBase,
    pushpinColoring,
    areaColoring,
    geoLayerColoringMatrix,
    legends,
    areaLegends,
    clusters,
    pushpinViewports,
    areaViewports,
    multiLayer,
    multiLayerClusters,
];
