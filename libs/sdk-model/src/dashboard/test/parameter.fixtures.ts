// (C) 2026 GoodData Corporation

import { idRef } from "../../objRef/factory.js";
import { type IDashboardParameter } from "../parameter.js";

export const dashboardParameterMinimal: IDashboardParameter = {
    ref: idRef("topN", "parameter"),
    mode: "active",
    parameterType: "NUMBER",
};

export const dashboardParameterFull: IDashboardParameter = {
    ref: idRef("topN", "parameter"),
    value: 25,
    label: "Top N",
    mode: "readonly",
    parameterType: "NUMBER",
};
