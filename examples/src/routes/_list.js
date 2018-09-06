// (C) 2007-2018 GoodData Corporation
import AttributeFilter from './AttributeFilter';
import Sorting from './Sorting';
import TimeOverTimeComparison from './TimeOverTimeComparison';
import BasicComponents from './BasicComponents';
import GlobalFilters from './GlobalFilters';
import Visualization from './Visualization';
import Execute from './Execute';
import DatePicker from './DatePicker';
import ResponsiveChart from './ResponsiveChart';
import DynamicMeasures from './DynamicMeasures';
import CustomLegend from './CustomLegend';
import ParentFilter from './ParentFilter';
import LoadingAndError from './LoadingAndError';
import MultipleDomains from './MultipleDomains';
import DrillWithExternalData from './DrillWithExternalData';
import Registration from './Registration';
import Login from './Login';
import PivotTable from './PivotTable';
import PivotTableDynamic from './PivotTableDynamic';
import WithSubRoutes from './WithSubRoutes';

export const advancedUseCasesRoutes = [
    { path: '/advanced/global-filters', title: 'Global Filters', Component: GlobalFilters },
    { path: '/advanced/dynamic-measures', title: 'Dynamic Measures', Component: DynamicMeasures },
    { path: '/advanced/date-picker', title: 'Date Picker', Component: DatePicker },
    { path: '/advanced/responsive', title: 'Responsive Chart', Component: ResponsiveChart },
    { path: '/advanced/custom-legend', title: 'Custom Legend', Component: CustomLegend },
    { path: '/advanced/parent-filter', title: 'Parent Filter', Component: ParentFilter },
    { path: '/advanced/loading-and-error', title: 'Loading and Error Components', Component: LoadingAndError },
    { path: '/advanced/drill-with-external-data', title: 'Drill With External Data', Component: DrillWithExternalData }
];

export const nextRoutes = [
    { path: '/next/pivot-table', title: 'Pivot Table', Component: PivotTable },
    { path: '/next/pivot-table-dynamic', title: 'PivotTable Dynamic', Component: PivotTableDynamic }
];

const AdvancedUseCasesRoutes = props => WithSubRoutes({ ...props, subRoutes: advancedUseCasesRoutes });
const NextRoutes = props => WithSubRoutes({ ...props, subRoutes: nextRoutes });

export const sideNavigationRoutes = [
    { path: '/', title: 'Basic Components', Component: BasicComponents, exact: true },
    { path: '/visualization', title: 'Visualization Component', Component: Visualization },
    { path: '/sorting', title: 'Sorting', Component: Sorting },
    { path: '/time-over-time-comparison', title: 'Time Over Time Comparison', Component: TimeOverTimeComparison },
    { path: '/attribute-filter-components', title: 'Attribute Filter Components', Component: AttributeFilter },
    { path: '/execute', title: 'Execute Component', Component: Execute },
    { path: '/advanced', pathMatch: 'full', redirectTo: advancedUseCasesRoutes[0].path, title: 'Advanced Use Cases', Component: AdvancedUseCasesRoutes },
    { path: '/next', pathMatch: 'full', redirectTo: nextRoutes[0].path, title: 'Next', Component: NextRoutes }
];

export const hiddenPaths = [
    { path: '/multiple-domains', title: 'Multiple Domains', Component: MultipleDomains },
    { path: '/pivot-table', title: 'Pivot Table', Component: PivotTable }
];

export const userRoutes = [
    { path: '/login', title: 'Login', Component: Login },
    { path: '/registration', title: 'Registration', Component: Registration }
];

export const topNavigationRoutes = [
    { path: '/', title: 'Live Examples', Component: BasicComponents }
];

export const routes = [
    ...sideNavigationRoutes,
    ...advancedUseCasesRoutes,
    ...nextRoutes,
    ...hiddenPaths
];

const components = routes.map(r => r.component);

export const navigation = sideNavigationRoutes.map(({ path, title }) => ({
    href: path,
    title
}));

export default {
    advancedUseCasesRoutes,
    sideNavigationRoutes,
    routes,
    navigation,
    components
};
