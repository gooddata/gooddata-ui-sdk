// (C) 2007-2019 GoodData Corporation
import React from "react";
import { BackstopConfig, IBackstopScenarioConfig } from "./backstopScenario";

const SCREENSHOT_WRAPPER_CLASS = "screenshot-wrapper";

/**
 * Short post interaction wait timeout - use when component renders fast, almost instantly in your browser.
 */
export const ShortPostInteractionTimeout = 1000;

/**
 * Long post interaction wait timeout - use when component renders slow - up to one second before it renders
 * in your browser.
 */
export const LongPostInteractionTimeout = 5000;

/**
 * Wraps component in a BackstopJS screenshot wrapper. This will result in creation of BackstopJS test scenario
 * for the story.
 *
 * @param component - react component displayed in the story
 * @param config - backstop JS configuration
 */
export function withScreenshot(component: any, config?: IBackstopScenarioConfig) {
    return React.createElement("div", { className: SCREENSHOT_WRAPPER_CLASS, config }, component);
}

/**
 * Wraps component in a BackstopJS screenshot wrapper that is capable of creating multiple BackstopJS test scenarios
 * from a single story. Each scenario can be configured separately. Optionally, a common configuration for all
 * scenarios can also be provided.
 *
 * @param component - react component displayed in the story
 * @param scenarios - test scenarios, a mapping of scenario name to BackstopJS config for this scenario
 * @param config - common config for all scenarios, this will be merged with scenario-specific config; most concrete wins
 */
export function withMultipleScreenshots(
    component: any,
    scenarios: BackstopConfig,
    config?: IBackstopScenarioConfig,
) {
    return React.createElement("div", { className: SCREENSHOT_WRAPPER_CLASS, scenarios, config }, component);
}
