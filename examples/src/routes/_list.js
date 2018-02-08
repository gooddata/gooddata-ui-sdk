import AttributeFilter from './AttributeFilter';
import BasicComponents from './BasicComponents';
import Home from './Home';
import Kpi from './Kpi';
import Visualization from './Visualization';
import Execute from './Execute';

export const routes = [
    { path: '/', title: 'Examples', Component: Home, exact: true },
    { path: '/basic-components', title: 'Basic Components', Component: BasicComponents },
    { path: '/kpi', title: 'KPIs', Component: Kpi },
    { path: '/visualization', title: 'Visualization', Component: Visualization },
    { path: '/attribute-filter-components', title: 'Attribute Filter Components', Component: AttributeFilter },
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
