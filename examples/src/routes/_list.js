import AttributeFilter from './AttributeFilter';
import ChartTypes from './ChartTypes';
import Home from './Home';
import Kpi from './Kpi';
import Visualization from './Visualization';
import Execute from './Execute';

export const routes = [
    { path: '/', title: 'Examples', Component: Home, exact: true },
    { path: '/chart-types', title: 'Chart types', Component: ChartTypes },
    { path: '/kpi', title: 'KPIs', Component: Kpi },
    { path: '/visualization', title: 'Visualization', Component: Visualization },
    { path: '/attribute-filter-components', title: 'Attribute Filter components', Component: AttributeFilter },
    { path: '/execute', title: 'Execute', Component: Execute }
];

export const components = routes.map(r => r.component);

export const navigation = routes.map(({ path, title }) => ({
    href: path,
    title
}));

export default {
    routes,
    navigation,
    components
};
