// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import * as React from "react";
import { PropTypes } from "prop-types";
import { AttributeElements, Kpi, BarChart, PieChart, Model } from "@gooddata/react-components";
import { SidebarItem } from "../components/utils/SidebarItem";
import { EmployeeCard } from "../components/GlobalFiltersComponents/EmployeeCard";
import { KpiMetricBox } from "../components/GlobalFiltersComponents/KpiMetricBox";
import {
    projectId,
    employeeNameIdentifier,
    averageDailyTotalSales,
    averageCheckSizeByServer,
    menuItemNameAttributeDFIdentifier,
    menuCategoryAttributeDFIdentifier,
} from "../utils/fixtures";
import { Layout } from "../components/utils/Layout";
import { CustomLoading } from "../components/utils/CustomLoading";
import { CustomError } from "../components/utils/CustomError";

export class EmployeeProfile extends React.Component {
    static propTypes = {
        validElements: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedEmployeeUri: props.validElements.items[0].element.uri,
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
            selectedEmployeeUri: props.validElements.items[0].element.uri,
        });
    }

    selectEmployee(uri) {
        this.setState({
            selectedEmployeeUri: uri,
        });
    }

    buildSidebarItem(item, selectedEmployeeUri) {
        const {
            element: { title, uri },
        } = item;

        return (
            <SidebarItem
                key={uri}
                label={title}
                id={uri}
                isSelected={selectedEmployeeUri === uri}
                onClick={this.selectEmployee}
            />
        );
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
                    {validElements
                        ? validElements.items.map(item => this.buildSidebarItem(item, selectedEmployeeUri))
                        : null}
                </ul>
            </div>
        );

        const employeeFilter = Model.positiveAttributeFilter(employeeNameIdentifier, [selectedEmployeeUri]);

        const measures = [Model.measure(averageDailyTotalSales).alias("$ Avg Daily Total Sales")];
        const menuCategoryAttribute = Model.attribute(menuCategoryAttributeDFIdentifier);
        const menuItemNameAttribute = Model.attribute(menuItemNameAttributeDFIdentifier).alias(
            "Menu Item name",
        );

        const selectedEmployee = validElements.items.find(item => item.element.uri === selectedEmployeeUri)
            .element;
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

                    .bar-chart-block,
                    .pie-chart-block {
                        display: flex;
                        flex-direction: column;
                    }

                    .bar-chart,
                    .pie-chart {
                        flex: 1 0 400px;
                        height: 400px;
                    }
                `}</style>
                <Layout sidebar={sidebar}>
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
                                        LoadingComponent={(...otherProps) => (
                                            <CustomLoading inline imageHeight={20} {...otherProps} />
                                        )}
                                        ErrorComponent={CustomError}
                                    />
                                </KpiMetricBox>

                                <KpiMetricBox title="Average check amount">
                                    <Kpi
                                        filters={[employeeFilter]}
                                        measure={averageCheckSizeByServer}
                                        projectId={projectId}
                                        format="$#,##0"
                                        LoadingComponent={(...otherProps) => (
                                            <CustomLoading inline imageHeight={20} {...otherProps} />
                                        )}
                                        ErrorComponent={CustomError}
                                    />
                                </KpiMetricBox>
                            </div>
                            <div className="pie-chart-block">
                                <h2>Average daily total sales by menu category</h2>
                                <div className="pie-chart">
                                    <PieChart
                                        measures={measures}
                                        viewBy={menuCategoryAttribute}
                                        filters={[employeeFilter]}
                                        projectId={projectId}
                                        LoadingComponent={CustomLoading}
                                        ErrorComponent={CustomError}
                                        config={{ legend: { position: "bottom" } }}
                                    />
                                </div>
                            </div>
                            <div className="bar-chart-block">
                                <h2>Average daily total sales by menu item</h2>
                                <div className="bar-chart">
                                    <BarChart
                                        measures={measures}
                                        viewBy={menuItemNameAttribute}
                                        filters={[employeeFilter]}
                                        projectId={projectId}
                                        LoadingComponent={CustomLoading}
                                        ErrorComponent={CustomError}
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
                return <CustomError message="There was an error getting Employee Name attribute values" />;
            }
            if (isLoading) {
                return (
                    <div
                        style={{
                            flex: "1 0 auto",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <CustomLoading speed={2} color="tomato" imageHeight={100} height={200} />
                    </div>
                );
            }
            return <EmployeeProfile validElements={validElements} />;
        }}
    </AttributeElements>
);

export default GlobalFiltersExample;
