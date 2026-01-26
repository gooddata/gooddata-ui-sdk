// (C) 2007-2026 GoodData Corporation

/* eslint-disable no-barrel-files/no-barrel-files */

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
