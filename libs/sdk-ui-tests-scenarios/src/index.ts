// (C) 2007-2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

import { chartScenarios } from "./scenarios/charts/index.js";
import { executeScenarios } from "./scenarios/execute/base.js";
import { pivotScenarios } from "./scenarios/pivotTable/index.js";
import { pivotTableNextScenarios } from "./scenarios/pivotTableNext/index.js";

export {
    type IScenarioGroup,
    type Viewport,
    type VisualTestConfiguration,
    type TestConfiguration,
    type ScenarioCustomizer,
    type CustomizedScenario,
    ScenarioGroup,
    scenariosFor,
    copyCustomizer,
    copyWithModifiedProps,
} from "./scenarioGroup.js";
export {
    type VisProps,
    type UnboundVisProps,
    type PropsFactory,
    type InsightConverter,
    type TestTypes,
    type SignificantTags,
    type ScenarioTag,
    type WorkspaceType,
    type IScenario,
    type ScenarioDataCapture,
    type ScenarioModification,
    type ScenarioTestInput,
    type ScenarioAndDescription,
    ScenarioBuilder,
    ScenarioTestMembers,
} from "./scenario.js";

const MapboxTokenEnvVariable = "STORYBOOK_MAPBOX_ACCESS_TOKEN";
export const MapboxToken = process.env[MapboxTokenEnvVariable] ?? "this-is-not-real-token";

export const allScenarios = [
    ...chartScenarios,
    ...pivotScenarios,
    ...pivotTableNextScenarios,
    executeScenarios,
];

// Specific scenarios and utilities re-exported for use by sdk-ui-tests-storybook
export { AmountMeasurePredicate } from "./scenarios/_infra/predicates.js";
export {
    BarChartWithArithmeticMeasuresAndViewBy,
    BarChartWithLargeLegend,
    BarChartWithTwoMeasuresAndTwoViewBy,
} from "./scenarios/charts/barChart/base.js";
export { ColumnChartWithSingleMeasureAndTwoViewByAndStack } from "./scenarios/charts/columnChart/base.js";
export { HeadlineWithThreeMeasures } from "./scenarios/charts/headline/base.js";
export {
    HeadlinePositiveComparisonMeasures,
    comparisonEnabled,
} from "./scenarios/charts/headline/comparison.js";
export {
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndTwoRowsAndCols,
} from "./scenarios/pivotTable/base.js";
