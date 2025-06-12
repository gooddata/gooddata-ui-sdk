// (C) 2019-2020 GoodData Corporation
import { uriRef } from "../../objRef/factory.js";
import { IWidgetAlert, IWidgetAlertDefinition } from "../alert.js";
import { filterContextDefinition } from "./filterContext.fixtures";

export const widgetAlert: IWidgetAlert = {
    dashboard: uriRef("/dashboard"),
    widget: uriRef("/widget"),
    ref: uriRef("/alert"),
    uri: "/alert",
    identifier: "",
    title: "Alert",
    description: "",
    isTriggered: false,
    threshold: 0,
    whenTriggered: "aboveThreshold",
};

export const widgetAlertDefinitionToCreate: IWidgetAlertDefinition = {
    dashboard: uriRef("/dashboard"),
    widget: uriRef("/widget"),
    title: "Alert",
    description: "",
    isTriggered: false,
    threshold: 0,
    whenTriggered: "aboveThreshold",
};

export const widgetAlertDefinitionToUpdate: IWidgetAlertDefinition = {
    dashboard: uriRef("/dashboard"),
    widget: uriRef("/widget"),
    ref: uriRef("/alert"),
    uri: "/alert",
    identifier: "",
    title: "Alert",
    description: "",
    isTriggered: false,
    threshold: 0,
    whenTriggered: "aboveThreshold",
    filterContext: filterContextDefinition,
};
