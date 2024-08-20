// (C) 2020-2024 GoodData Corporation

export * from "./DefaultInsightBody/index.js";
export { DashboardInsight } from "./DashboardInsight.js";
export { DefaultDashboardInsight } from "./DefaultDashboardInsight.js";
export { DefaultDashboardInsightComponentSetFactory } from "./DefaultDashboardInsightComponentSetFactory.js";
export { useUpdateAlert } from "./configuration/InsightAlertConfig/useUpdateAlert.js";
export {
    IDashboardInsightProps,
    CustomDashboardInsightComponent,
    IInsightBodyProps,
    CustomInsightBodyComponent,
} from "./types.js";
