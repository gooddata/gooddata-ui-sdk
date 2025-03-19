// (C) 2007-2024 GoodData Corporation

import chartScenarios from "./charts/index.js";
import pivotScenarios from "./pivotTable/index.js";
import executeScenarios from "./execute/base.js";

export default [...chartScenarios, ...pivotScenarios, executeScenarios];
