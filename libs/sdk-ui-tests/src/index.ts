// (C) 2007-2020 GoodData Corporation

export * from "./scenarioGroup.js";
export * from "./scenario.js";

const MapboxTokenEnvVariable = "STORYBOOK_MAPBOX_ACCESS_TOKEN";
export const MapboxToken = process.env[MapboxTokenEnvVariable] ?? "this-is-not-real-token";
