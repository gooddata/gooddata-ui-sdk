// (C) 2007-2019 GoodData Corporation

import chartScenarios from "./charts/index.js";
import geoScenarios, { latitudeLongitudeScenarios } from "./geo/index.js";
import pivotScenarios from "./pivotTable/index.js";
import executeScenarios from "./execute/base.js";

export default [
    ...chartScenarios,
    ...geoScenarios,
    ...latitudeLongitudeScenarios,
    ...pivotScenarios,
    executeScenarios,
];
