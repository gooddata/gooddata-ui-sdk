// (C) 2007-2019 GoodData Corporation
import AboutThisProject from "./AboutThisProject";
import AttributeFilter from "./AttributeFilter";
import Sorting from "./Sorting";
import TimeOverTimeComparison from "./TimeOverTimeComparison";
import BasicComponents from "./BasicComponents";
import ComboChart from "./ComboChart";
import GlobalFilters from "./GlobalFilters";
import Execute from "./Execute";
import BucketExecutor from "./BucketExecutor";
import DatePicker from "./DatePicker";
import ResponsiveChart from "./ResponsiveChart";
import DynamicMeasures from "./DynamicMeasures";
import CustomLegend from "./CustomLegend";
import ParentFilter from "./ParentFilter";
import LoadingAndError from "./LoadingAndError";
import MultipleDomains from "./MultipleDomains";
import DrillWithExternalData from "./DrillWithExternalData";
import PivotTableDrilling from "./PivotTableDrilling";
import Registration from "./Registration";
import Login from "./Login";
import PivotTable from "./PivotTable";
import PivotTableDemo from "./PivotTableDemo";
import PivotTableDynamic from "./PivotTableDynamic";
import AggregationTest from "./AggregationTest";
import WithSubRoutes from "./WithSubRoutes";
import ChartConfiguration from "./ChartConfiguration";
import ArithmeticMeasure from "./ArithmeticMeasure";
import Export from "./Export";
import VisualizationByUri from "./VisualizationByUri";
import VisualizationByIdentifier from "./VisualizationByIdentifier";

export const advancedUseCasesRoutes = [
    { path: "/advanced/global-filters", title: "Global Filters", Component: GlobalFilters },
    { path: "/advanced/dynamic-measures", title: "Dynamic Measures", Component: DynamicMeasures },
    { path: "/advanced/date-picker", title: "Date Picker", Component: DatePicker },
    { path: "/advanced/responsive", title: "Responsive Chart", Component: ResponsiveChart },
    { path: "/advanced/custom-legend", title: "Custom Legend", Component: CustomLegend },
    { path: "/advanced/parent-filter", title: "Parent Filter", Component: ParentFilter },
    {
        path: "/advanced/loading-and-error",
        title: "Loading and Error Components",
        Component: LoadingAndError,
    },
    { path: "/advanced/chart-configuration", title: "Chart Configuration", Component: ChartConfiguration },
];

export const visualizationUseCasesRoutes = [
    {
        path: "/visualization/visualization-by-uri",
        title: "Visualization by URI",
        Component: VisualizationByUri,
    },
    {
        path: "/visualization/visualization-by-identifier",
        title: "Visualization by identifier",
        Component: VisualizationByIdentifier,
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

export const nextRoutes = [{ path: "/next/combo-chart", title: "Combo chart", Component: ComboChart }];

const VisualizationUseCasesRoutes = props =>
    WithSubRoutes({ ...props, subRoutes: visualizationUseCasesRoutes });
const AdvancedUseCasesRoutes = props => WithSubRoutes({ ...props, subRoutes: advancedUseCasesRoutes });
const DrillingUseCasesRoutes = props => WithSubRoutes({ ...props, subRoutes: drillingUseCasesRoutes });
const NextRoutes = props => WithSubRoutes({ ...props, subRoutes: nextRoutes });

export const sideNavigationRoutes = [
    { path: "/", title: "Basic Components", Component: BasicComponents, exact: true },
    { path: "/pivot-table", title: "Pivot Table", Component: PivotTableDemo },
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
    {
        path: "/attribute-filter-components",
        title: "Attribute Filter Components",
        Component: AttributeFilter,
    },
    { path: "/arithmetic-measures", title: "Arithmetic Measures", Component: ArithmeticMeasure },
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
    {
        path: "/next",
        pathMatch: "full",
        redirectTo: nextRoutes[0].path,
        title: "Next",
        Component: NextRoutes,
    },
];

export const hiddenPaths = [
    { path: "/hidden/multiple-domains", title: "Multiple Domains", Component: MultipleDomains },
    { path: "/hidden/aggregation-test", title: "Aggregation Test", Component: AggregationTest },
    { path: "/hidden/pivot-table", title: "Pivot Table", Component: PivotTable },
    { path: "/hidden/pivot-table-dynamic", title: "Pivot Table Dynamic", Component: PivotTableDynamic },
    { path: "/hidden/bucket-executor", title: "Bucket Executor Example", Component: BucketExecutor },
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
    ...nextRoutes,
    ...hiddenPaths,
    ...backendInfoRoutes,
];

const components = routes.map(r => r.component);

export const navigation = sideNavigationRoutes.map(({ path, title }) => ({
    href: path,
    title,
}));

export default {
    visualizationUseCasesRoutes,
    advancedUseCasesRoutes,
    drillingUseCasesRoutes,
    sideNavigationRoutes,
    routes,
    navigation,
    components,
};
