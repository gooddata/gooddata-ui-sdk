// (C) 2007-2019 GoodData Corporation
import * as React from "react";

const SCREENSHOT_WRAPPER_CLASS = "screenshot-wrapper";

export function screenshotWrap(component: any) {
    return React.createElement("div", { className: SCREENSHOT_WRAPPER_CLASS }, component);
}
