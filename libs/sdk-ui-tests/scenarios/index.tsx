// (C) 2007-2025 GoodData Corporation

import chartScenarios from "./charts/index.js";
import pivotScenarios from "./pivotTable/index.js";
import pivotTableNextScenarios from "./pivotTableNext/index.js";
import executeScenarios from "./execute/base.js";

export default [...chartScenarios, ...pivotScenarios, ...pivotTableNextScenarios, executeScenarios];
