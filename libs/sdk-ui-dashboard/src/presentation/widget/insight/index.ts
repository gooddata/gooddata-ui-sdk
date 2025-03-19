// (C) 2020-2024 GoodData Corporation

export * from "./DefaultInsightBody/index.js";
export { DashboardInsight } from "./DashboardInsight.js";
export { DefaultDashboardInsight } from "./DefaultDashboardInsight.js";
export { DefaultDashboardInsightComponentSetFactory } from "./DefaultDashboardInsightComponentSetFactory.js";
export { useSaveAlertToBackend } from "./configuration/InsightAlertConfig/hooks/useSaveAlertToBackend.js";
export type {
    IDashboardInsightProps,
    CustomDashboardInsightComponent,
    IInsightBodyProps,
    CustomInsightBodyComponent,
} from "./types.js";
