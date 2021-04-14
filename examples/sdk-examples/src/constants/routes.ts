// (C) 2007-2021 GoodData Corporation
import { BasicComponents } from "../examples/basic";
import { PivotTable } from "../examples/pivotTable";
import { InsightView } from "../examples/insightView";
import { Sorting } from "../examples/sorting";
import { TimeOverTimeComparison } from "../examples/timeOverTimeComparison";
import { ArithmeticMeasures } from "../examples/arithmeticMeasures";
import { Execute } from "../examples/execution";
import { PivotTableDrilling, DrillWithExternalData, GeoPushpinDrilling } from "../examples/drill";
import { DateFilter } from "../examples/dateFilter";

import { GlobalFilters } from "../examples/advanced/globalFilters";
import { DatePicker } from "../examples/advanced/datePicker";
import { DynamicMeasures } from "../examples/advanced/dynamicMeasures";
import { CustomLegend } from "../examples/advanced/customLegend";
import { LoadingAndError } from "../examples/advanced/loadingAndError";
import { ParentFilter } from "../examples/advanced/parentFilter";
import { ChartConfiguration } from "../examples/advanced/chartConfiguration";
import { Responsive } from "../examples/advanced/responsive";
import { Export } from "../examples/export";
import { AttributeFilter } from "../examples/attributeFilter";
import { RankingFilter } from "../examples/rankingFilter";

import { MeasureValueFilter } from "../examples/measureValueFilter/measureValueFilterByValue";
import { MeasureValueFilterComponent } from "../examples/measureValueFilter/measureValueFilterComponent";

import { GeoPushpin } from "../examples/geoPushpin";

import { InternationalDateFilterExample } from "../examples/internationalDateFormat/dateFilter";
import { InternationalDatePickerExample } from "../examples/internationalDateFormat/datePicker";

import { ThemedComponents } from "../examples/theming";

// import { MeasureValueFilter } from "../examples/hidden/measureValueFilter";
// import { MeasureValueFilterComponent } from "../examples/hidden/measureValueFilterComponent";
import { OnDrillHandling } from "../examples/hidden/onDrillHandling";
import { PivotTableDynamic } from "../examples/hidden/pivotTableDynamic";
import { PivotTableSizing } from "../examples/hidden/pivotTableSizing";

import { Login } from "../components/login";
import { WithSubRoutes } from "../components/WithSubRoutes";
import { AboutThisProject } from "../components/AboutThisProject";

import SimpleDashboardView from "../examples/dashboardEmbedding/SimpleDashboardView";
import DashboardViewWithCustomCharts from "../examples/dashboardEmbedding/DashboardViewWithCustomCharts";
import DashboardViewWithFilters from "../examples/dashboardEmbedding/DashboardViewWithFilters";
import DashboardViewWithMergedFilters from "../examples/dashboardEmbedding/DashboardViewWithMergedFilters";
import DashboardViewWithDrilling from "../examples/dashboardEmbedding/DashboardViewWithDrilling";
import DashboardExport from "../examples/dashboardEmbedding/DashboardExport";
import DashboardViewAdvancedCustomizations from "../examples/dashboardEmbedding/DashboardViewAdvancedCustomizations";

// import PivotTableDynamic from "./PivotTableDynamic";
// import MultipleDomains from "./MultipleDomains";
// import AggregationTest from "./AggregationTest";

export const advancedUseCasesRoutes = [
    { path: "/advanced/global-filters", title: "Global Filters", Component: GlobalFilters },
    { path: "/advanced/dynamic-measures", title: "Dynamic Measures", Component: DynamicMeasures },
    { path: "/advanced/date-picker", title: "Date Picker", Component: DatePicker },
    { path: "/advanced/responsive", title: "Responsive Chart", Component: Responsive },
    { path: "/advanced/custom-legend", title: "Custom Legend", Component: CustomLegend },
    { path: "/advanced/parent-filter", title: "Parent Filter", Component: ParentFilter },
    {
        path: "/advanced/loading-and-error",
        title: "Loading and Error Components",
        Component: LoadingAndError,
    },
    { path: "/advanced/chart-configuration", title: "Chart Configuration", Component: ChartConfiguration },
];

export const internationalDateFormatUseCasesRoutes = [
    {
        path: "/international-date-format/date-filter",
        title: "Date Filter",
        Component: InternationalDateFilterExample,
    },
    {
        path: "/international-date-format/date-picker",
        title: "Date Picker",
        Component: InternationalDatePickerExample,
    },
];

export const insightViewUseCasesRoutes = [
    {
        path: "/insightView/insightView-by-identifier",
        title: "InsightView by identifier",
        Component: InsightView,
    },
];

export const dashboardViewUseCasesRoutes = [
    {
        path: "/dashboardView/simple",
        title: "Simple",
        Component: SimpleDashboardView,
    },
    {
        path: "/dashboardView/with-filters",
        title: "With filters",
        Component: DashboardViewWithFilters,
    },
    {
        path: "/dashboardView/with-merged-filters",
        title: "With merged filters",
        Component: DashboardViewWithMergedFilters,
    },
    {
        path: "/dashboardView/with-drilling",
        title: "With drilling",
        Component: DashboardViewWithDrilling,
    },
    {
        path: "/dashboardView/with-export",
        title: "With export",
        Component: DashboardExport,
    },
    {
        path: "/dashboardView/custom-chart",
        title: "With custom charts",
        Component: DashboardViewWithCustomCharts,
    },
    {
        path: "/dashboardView/advanced-customizations",
        title: "With advanced customizations",
        Component: DashboardViewAdvancedCustomizations,
    },
];

export const drillingUseCasesRoutes = [
    {
        path: "/drilling/drill-with-external-data",
        title: "Drill With External Data",
        Component: DrillWithExternalData,
    },
    { path: "/drilling/pivot-table-drilling", title: "Pivot table drilling", Component: PivotTableDrilling },
    {
        path: "/drilling/geo-pushpin-drilling",
        title: "Geo Pushpin Drilling",
        Component: GeoPushpinDrilling,
    },
];

export const measureValueFilterUseCasesRoutes = [
    {
        path: "/measure-value-filter/filter-by-measure-value",
        title: "Filter by Measure Value",
        Component: MeasureValueFilter,
    },
    {
        path: "/measure-value-filter/component",
        title: "Measure Value Filter Component",
        Component: MeasureValueFilterComponent,
    },
];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const InsightViewUseCasesRoutes = (props: any): JSX.Element =>
    WithSubRoutes({ ...props, subRoutes: insightViewUseCasesRoutes });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const DashboardViewUseCasesRoutes = (props: any): JSX.Element =>
    WithSubRoutes({ ...props, subRoutes: dashboardViewUseCasesRoutes });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const AdvancedUseCasesRoutes = (props: any): JSX.Element =>
    WithSubRoutes({ ...props, subRoutes: advancedUseCasesRoutes });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const DrillingUseCasesRoutes = (props: any): JSX.Element =>
    WithSubRoutes({ ...props, subRoutes: drillingUseCasesRoutes });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const MeasureValueFilterUseCasesRoutes = (props: any): JSX.Element =>
    WithSubRoutes({ ...props, subRoutes: measureValueFilterUseCasesRoutes });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const InternationalDateFormatUseCasesRoutes = (props: any): JSX.Element =>
    WithSubRoutes({ ...props, subRoutes: internationalDateFormatUseCasesRoutes });

export type RouteDefinition = {
    path: string;
    title: string;
    Component: any;
    pathMatch?: string;
    redirectTo?: string;
    exact?: boolean;
    inBuilds?: string[];
};

export const sideNavigationRoutes: RouteDefinition[] = [
    { path: "/", title: "Basic Components", Component: BasicComponents, exact: true },
    { path: "/pivot-table", title: "Pivot Table", Component: PivotTable },
    { path: "/geo-pushpin-chart", title: "Geo Pushpin Chart", Component: GeoPushpin },
    {
        path: "/insightView",
        pathMatch: "full",
        redirectTo: insightViewUseCasesRoutes[0].path,
        title: "InsightView Component",
        Component: InsightViewUseCasesRoutes,
    },
    {
        path: "/dashboardView",
        pathMatch: "full",
        redirectTo: dashboardViewUseCasesRoutes[0].path,
        title: "DashboardView Component",
        Component: DashboardViewUseCasesRoutes,
    },
    { path: "/sorting", title: "Sorting", Component: Sorting },
    {
        path: "/time-over-time-comparison",
        title: "Time Over Time Comparison",
        Component: TimeOverTimeComparison,
    },
    {
        path: "/attribute-filter-components",
        title: "Attribute Filter Components",
        Component: AttributeFilter,
    },
    {
        path: "/measure-value-filter",
        pathMatch: "full",
        redirectTo: measureValueFilterUseCasesRoutes[0].path,
        title: "Measure Value Filter",
        Component: MeasureValueFilterUseCasesRoutes,
    },
    {
        path: "/ranking-filter",
        pathMatch: "full",
        title: "Ranking Filter",
        Component: RankingFilter,
    },
    {
        path: "/date-filter-component",
        title: "Date Filter Component",
        Component: DateFilter,
    },
    { path: "/arithmetic-measures", title: "Arithmetic Measures", Component: ArithmeticMeasures },
    { path: "/execute", title: "Execute Components", Component: Execute },
    {
        path: "/advanced",
        pathMatch: "full",
        redirectTo: advancedUseCasesRoutes[0].path,
        title: "Advanced Use Cases",
        Component: AdvancedUseCasesRoutes,
    },
    { path: "/export", title: "Export", Component: Export },
    {
        path: "/drilling",
        pathMatch: "full",
        redirectTo: drillingUseCasesRoutes[0].path,
        title: "Drilling",
        Component: DrillingUseCasesRoutes,
    },
    {
        path: "/international-date-format",
        pathMatch: "full",
        redirectTo: internationalDateFormatUseCasesRoutes[0].path,
        title: "International Date Format",
        Component: InternationalDateFormatUseCasesRoutes,
    },
    { path: "/theming", title: "Custom Theming", Component: ThemedComponents },
];

export const hiddenPaths = [
    // { path: "/hidden/multiple-domains", title: "Multiple Domains", Component: MultipleDomains },
    // { path: "/hidden/aggregation-test", title: "Aggregation Test", Component: AggregationTest },
    { path: "/hidden/pivot-table-dynamic", title: "Pivot Table Dynamic", Component: PivotTableDynamic },
    {
        path: "/hidden/pivot-table-sizing",
        title: "Pivot Table Sizing",
        Component: PivotTableSizing,
    },
    { path: "/hidden/on-drill-drilling", title: "New drill handling by onDrill", Component: OnDrillHandling },
];

export const backendInfoRoutes = [
    { path: "/about-this-project", title: "About This Project", Component: AboutThisProject },
];

export const userRoutes = [{ path: "/login", title: "Login", Component: Login }];

export const routes = [
    ...sideNavigationRoutes,
    ...insightViewUseCasesRoutes,
    ...dashboardViewUseCasesRoutes,
    ...advancedUseCasesRoutes,
    ...drillingUseCasesRoutes,
    ...measureValueFilterUseCasesRoutes,
    ...hiddenPaths,
    ...backendInfoRoutes,
    ...internationalDateFormatUseCasesRoutes,
];

export const navigation = sideNavigationRoutes.map(({ path, title }) => ({
    href: path,
    title,
}));
