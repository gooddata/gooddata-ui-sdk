// (C) 2007-2020 GoodData Corporation
import { BasicComponents } from "../examples/basic";
import { PivotTable } from "../examples/pivotTable";
import { InsightView } from "../examples/insightView";
import { Sorting } from "../examples/sorting";
import { TimeOverTimeComparison } from "../examples/timeOverTimeComparison";
import { ArithmeticMeasures } from "../examples/arithmeticMeasures";
import { Execute } from "../examples/execution";
import { PivotTableDrilling, DrillWithExternalData } from "../examples/drill";
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

import { MeasureValueFilter } from "../examples/measureValueFilter/measureValueFilterByValue";
import { MeasureValueFilterComponent } from "../examples/measureValueFilter/measureValueFilterComponent";

import { GeoPushpin } from "../examples/geoPushpin";

// import { MeasureValueFilter } from "../examples/hidden/measureValueFilter";
// import { MeasureValueFilterComponent } from "../examples/hidden/measureValueFilterComponent";
import { OnDrillHandling } from "../examples/hidden/onDrillHandling";
import { PivotTableDynamic } from "../examples/hidden/pivotTableDynamic";
import { PivotTableSizing } from "../examples/hidden/pivotTableSizing";

import { Login } from "../components/login";
import { Registration } from "../components/registration";
import { WithSubRoutes } from "../components/WithSubRoutes";
import { AboutThisProject } from "../components/AboutThisProject";
import GeoPushpinChartDrillExample from "../examples/drill/GeoPushpinChartDrillExample";

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

export const insightViewUseCasesRoutes = [
    {
        path: "/insightView/insightView-by-identifier",
        title: "InsightView by identifier",
        Component: InsightView,
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
        Component: GeoPushpinChartDrillExample,
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

const InsightViewUseCasesRoutes = (props: any) =>
    WithSubRoutes({ ...props, subRoutes: insightViewUseCasesRoutes });
const AdvancedUseCasesRoutes = (props: any) => WithSubRoutes({ ...props, subRoutes: advancedUseCasesRoutes });
const DrillingUseCasesRoutes = (props: any) => WithSubRoutes({ ...props, subRoutes: drillingUseCasesRoutes });
const MeasureValueFilterUseCasesRoutes = (props: any) =>
    WithSubRoutes({ ...props, subRoutes: measureValueFilterUseCasesRoutes });

export const sideNavigationRoutes = [
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
    // TODO BB-1694 - Add Measure Value Filter example to the menu
    // { path: "/hidden/measure-value-filter", title: "Measure Value Filter", Component: MeasureValueFilter },
    // {
    //     path: "/hidden/measure-value-filter-component",
    //     title: "Measure Value Filter Component",
    //     Component: MeasureValueFilterComponent,
    // },
    { path: "/hidden/on-drill-drilling", title: "New drill handling by onDrill", Component: OnDrillHandling },
];

export const backendInfoRoutes = [
    { path: "/about-this-project", title: "About This Project", Component: AboutThisProject },
];

export const userRoutes = [
    { path: "/login", title: "Login", Component: Login },
    { path: "/registration", title: "Registration", Component: Registration },
];

export const topNavigationRoutes = [{ path: "/", title: "Live Examples", Component: BasicComponents }];

export const routes = [
    ...sideNavigationRoutes,
    ...insightViewUseCasesRoutes,
    ...advancedUseCasesRoutes,
    ...drillingUseCasesRoutes,
    ...measureValueFilterUseCasesRoutes,
    ...hiddenPaths,
    ...backendInfoRoutes,
];

export const navigation = sideNavigationRoutes.map(({ path, title }) => ({
    href: path,
    title,
}));
