// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { BackstopScenarios } from "./backstopScenario";

const SCREENSHOT_WRAPPER_CLASS = "screenshot-wrapper";

export function screenshotWrap(component: any, scenarios?: BackstopScenarios) {
    return React.createElement("div", { className: SCREENSHOT_WRAPPER_CLASS, scenarios }, component);
}
