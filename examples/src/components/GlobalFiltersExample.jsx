// (C) 2007-2018 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import * as React from 'react';
import { PropTypes } from 'prop-types';
import { AttributeElements, AfmComponents, Kpi } from '@gooddata/react-components';
import { SidebarItem } from '../components/utils/SidebarItem';
import { EmployeeCard } from '../components/GlobalFiltersComponents/EmployeeCard';
import { KpiMetricBox } from '../components/GlobalFiltersComponents/KpiMetricBox';
import {
    projectId,
    employeeNameIdentifier,
    averageDailyTotalSales,
    averageCheckSizeByServer,
    menuItemNameAttributeDFIdentifier,
    menuCategoryAttributeDFIdentifier
} from '../utils/fixtures';
import { Layout } from '../components/utils/Layout';
import { Loading } from '../components/utils/Loading';
import { Error } from '../components/utils/Error';

const { BarChart, PieChart } = AfmComponents;

export class EmployeeProfile extends React.Component {
    static propTypes = {
        validElements: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedEmployeeUri: props.validElements.items[0].element.uri
        };

        this.selectEmployee = this.selectEmployee.bind(this);
        this.setDefaultSelection = this.setDefaultSelection.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.validElements !== this.props.validElements) {
            this.setDefaultSelection(nextProps);
        }
    }

    setDefaultSelection(props) {
        this.setState({
            selectedEmployeeUri: props.validElements.items[0].element.uri
        });
    }

    selectEmployee(uri) {
        this.setState({
            selectedEmployeeUri: uri
        });
    }

    render() {
        const { selectedEmployeeUri } = this.state;
        const { validElements } = this.props;

        const sidebar = (
            <div>
                <style jsx>
                    {`
                        ul {
                            list-style-type: none;
                            padding: 0;
                            margin: 0 0 20px 0;
                        }
                    `}
                </style>
                <ul>
                    {validElements ? validElements.items.map(item => (
                        <SidebarItem
                            key={item.element.uri}
                            label={item.element.title}
                            id={item.element.uri}
                            isSelected={selectedEmployeeUri === item.element.uri}
                            onClick={this.selectEmployee}
                        />
                    )) : null}
                </ul>
            </div>
        );

        const employeeFilter = {
            positiveAttributeFilter: {
                displayForm: {
                    identifier: employeeNameIdentifier
                },
                in: [selectedEmployeeUri]
            }
        };
        const chartAfm = {
            measures: [
                {
                    localIdentifier: 'm1',
                    definition: {
                        measure: {
                            item: {
                                identifier: averageDailyTotalSales
                            }
                        }
                    },
                    alias: '$ Avg Daily Total Sales'
                }
            ],
            filters: [employeeFilter]
        };
        const selectedEmployee = validElements.items.find(item => item.element.uri === selectedEmployeeUri).element;
        const employeeName = selectedEmployee.title;

        return (
            <div className="layout-wrapper">
                {/* language=CSS */}
                <style jsx>{`
                    .layout-wrapper {
                        display: flex;
                        flex: 1 0 auto;
                    }
                    h2 {
                        margin-top: 0;
                        border-bottom: 2px solid #14b2e2;
                        padding-bottom: 10px;
                        margin-bottom: 40px;
                    }
                    .details {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                        grid-column-gap: 20px;
                        grid-row-gap: 40px;
                    }

                    .kpis {
                        margin: -20px;
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                        align-items: flex-start;
                    }

                    .bar-chart-block, .pie-chart-block {
                        display: flex;
                        flex-direction: column;
                    }

                    .bar-chart, .pie-chart {
                        flex: 1 0 400px;
                        height: 400px;
                    }
                `}</style>
                <Layout sidebar={sidebar} >
                    <div>
                        <h2>Employee overview</h2>
                        <div className="details">
                            <div>
                                <EmployeeCard uri={selectedEmployee.uri} name={employeeName} />
                            </div>
                            <div className="kpis">
                                <KpiMetricBox title="Daily sales">
                                    <Kpi
                                        filters={[employeeFilter]}
                                        measure={averageDailyTotalSales}
                                        projectId={projectId}
                                        format="$#,##0"
                                        LoadingComponent={
                                            (...otherProps) => <Loading inline height={20} {...otherProps} />
                                        }
                                        ErrorComponent={Error}
                                    />
                                </KpiMetricBox>

                                <KpiMetricBox title="Average check amount">
                                    <Kpi
                                        filters={[employeeFilter]}
                                        measure={averageCheckSizeByServer}
                                        projectId={projectId}
                                        format="$#,##0"
                                        LoadingComponent={
                                            (...otherProps) => <Loading inline height={20} {...otherProps} />
                                        }
                                        ErrorComponent={Error}
                                    />
                                </KpiMetricBox>
                            </div>
                            <div className="pie-chart-block" >
                                <h2>Average daily total sales by menu category</h2>
                                <div className="pie-chart">
                                    <PieChart
                                        afm={{
                                            ...chartAfm,
                                            attributes: [
                                                {
                                                    localIdentifier: 'a1',
                                                    displayForm: {
                                                        identifier: menuCategoryAttributeDFIdentifier
                                                    }
                                                }
                                            ]
                                        }}
                                        projectId={projectId}
                                        LoadingComponent={Loading}
                                        ErrorComponent={Error}
                                        config={{ legend: { position: 'bottom' } }}
                                    />
                                </div>
                            </div>
                            <div className="bar-chart-block">
                                <h2>Average daily total sales by menu item</h2>
                                <div className="bar-chart">
                                    <BarChart
                                        afm={{
                                            ...chartAfm,
                                            attributes: [
                                                {
                                                    localIdentifier: 'a1',
                                                    displayForm: {
                                                        identifier: menuItemNameAttributeDFIdentifier
                                                    },
                                                    alias: 'Employee name'
                                                }
                                            ]
                                        }}
                                        projectId={projectId}
                                        LoadingComponent={Loading}
                                        ErrorComponent={Error}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>
            </div>
        );
    }
}

export const GlobalFiltersExample = () => (
    <AttributeElements identifier={employeeNameIdentifier} projectId={projectId} options={{ limit: 20 }}>
        {({ validElements, error, isLoading }) => {
            if (error) {
                return <Error error={{ status: '400', message: error }} />;
            }
            if (isLoading) {
                return (
                    <div style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} >
                        <Loading speed={2} color="tomato" height="100px" />
                    </div>
                );
            }
            return <EmployeeProfile validElements={validElements} />;
        }}
    </AttributeElements>
);

export default GlobalFiltersExample;
