// (C) 2007-2020 GoodData Corporation
import React from "react";
import { VisProps, ScenarioTag, PropsFactory } from "./scenario";

/**
 * View on test scenario that can be used as input to parameterized tests.
 *
 * First element: name of the test scenario
 * Second element: react component type
 * Third element: factory to create props for the react component
 * Fourth element: scenario tags
 *
 * Having this as array is essential for parameterized jest tests in order for jest to correctly name the
 * test suite / test case.
 */
export type ScenarioTestInput<T extends VisProps> = [
    string,
    React.ComponentType<T>,
    PropsFactory<T>,
    ScenarioTag[],
    string,
];

/**
 * Enum with indexes into scenario test input array.
 */
export enum ScenarioTestMembers {
    ScenarioName = 0,
    Component = 1,
    PropsFactory = 2,
    Tags = 3,
    InsightId = 4,
}
