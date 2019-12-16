// (C) 2007-2019 GoodData Corporation
import { BasicComponents } from "../examples/basic";
import { PivotTable } from "../examples/pivotTable";
import { Visualization } from "../examples/visualization";
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
import { ChartConfiguration } from "../examples/advanced/chartConfiguration";
import { Responsive } from "../examples/advanced/responsive";
import { Export } from "../examples/export";

import { MeasureValueFilter } from "../examples/hidden/measureValueFilter";
import { MeasureValueFilterComponent } from "../examples/hidden/measureValueFilterComponent";
import { OnDrillHandling } from "../examples/hidden/onDrillHandling";

import { Login } from "../components/login";
import { Registration } from "../components/registration";
import { WithSubRoutes } from "../components/WithSubRoutes";
import { AboutThisProject } from "../components/AboutThisProject";

// import AttributeFilter from "./AttributeFilter";
// import ParentFilter from "./ParentFilter";

// import PivotTableDynamic from "./PivotTableDynamic";
// import MultipleDomains from "./MultipleDomains";
// import AggregationTest from "./AggregationTest";

export const advancedUseCasesRoutes = [
    { path: "/advanced/global-filters", title: "Global Filters", Component: GlobalFilters },
    { path: "/advanced/dynamic-measures", title: "Dynamic Measures", Component: DynamicMeasures },
    { path: "/advanced/date-picker", title: "Date Picker", Component: DatePicker },
    { path: "/advanced/responsive", title: "Responsive Chart", Component: Responsive },
    { path: "/advanced/custom-legend", title: "Custom Legend", Component: CustomLegend },
    // { path: "/advanced/parent-filter", title: "Parent Filter", Component: ParentFilter },
    {
        path: "/advanced/loading-and-error",
        title: "Loading and Error Components",
        Component: LoadingAndError,
    },
    { path: "/advanced/chart-configuration", title: "Chart Configuration", Component: ChartConfiguration },
];

export const visualizationUseCasesRoutes = [
    {
        path: "/visualization/visualization-by-identifier",
        title: "Visualization by identifier",
        Component: Visualization,
    },
];

export const drillingUseCasesRoutes = [
    {
        path: "/drilling/drill-with-external-data",
        title: "Drill With External Data",
        Component: DrillWithExternalData,
    },
    { path: "/drilling/pivot-table-drilling", title: "Pivot table drilling", Component: PivotTableDrilling },
];

const VisualizationUseCasesRoutes = props =>
    WithSubRoutes({ ...props, subRoutes: visualizationUseCasesRoutes });
const AdvancedUseCasesRoutes = props => WithSubRoutes({ ...props, subRoutes: advancedUseCasesRoutes });
const DrillingUseCasesRoutes = props => WithSubRoutes({ ...props, subRoutes: drillingUseCasesRoutes });

export const sideNavigationRoutes = [
    { path: "/", title: "Basic Components", Component: BasicComponents, exact: true },
    { path: "/pivot-table", title: "Pivot Table", Component: PivotTable },
    {
        path: "/visualization",
        pathMatch: "full",
        redirectTo: visualizationUseCasesRoutes[0].path,
        title: "Visualization Component",
        Component: VisualizationUseCasesRoutes,
    },
    { path: "/sorting", title: "Sorting", Component: Sorting },
    {
        path: "/time-over-time-comparison",
        title: "Time Over Time Comparison",
        Component: TimeOverTimeComparison,
    },
    // {
    //     path: "/attribute-filter-components",
    //     title: "Attribute Filter Components",
    //     Component: AttributeFilter,
    // },
    {
        path: "/date-filter-component",
        title: "Date Filter Component",
        Component: DateFilter,
    },
    { path: "/arithmetic-measures", title: "Arithmetic Measures", Component: ArithmeticMeasures },
    { path: "/execute", title: "Execute Component", Component: Execute },
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
    // { path: "/hidden/pivot-table-dynamic", title: "Pivot Table Dynamic", Component: PivotTableDynamic },
    // TODO BB-1694 - Add Measure Value Filter example to the menu
    { path: "/hidden/measure-value-filter", title: "Measure Value Filter", Component: MeasureValueFilter },
    {
        path: "/hidden/measure-value-filter-component",
        title: "Measure Value Filter Component",
        Component: MeasureValueFilterComponent,
    },
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
    ...visualizationUseCasesRoutes,
    ...advancedUseCasesRoutes,
    ...drillingUseCasesRoutes,
    ...hiddenPaths,
    ...backendInfoRoutes,
];

export const navigation = sideNavigationRoutes.map(({ path, title }) => ({
    href: path,
    title,
}));
