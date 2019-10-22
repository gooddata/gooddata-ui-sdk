// (C) 2007-2019 GoodData Corporation
import React, { useState, useEffect } from "react";
import { Kpi, BarChart, PieChart } from "@gooddata/sdk-ui";
import {
    newMeasure,
    newAttribute,
    newPositiveAttributeFilter,
    IAttributeElementsByRef,
} from "@gooddata/sdk-model";
import { SidebarItem } from "../../../components/SidebarItem";
import { EmployeeCard } from "./EmployeeCard";
import { KpiMetricBox } from "./KpiMetricBox";
import {
    projectId,
    employeeNameIdentifier,
    averageDailyTotalSalesIdentifier,
    averageCheckSizeByServerIdentifier,
    menuItemNameAttributeDFIdentifier,
    menuCategoryAttributeDFIdentifier,
} from "../../../constants/fixtures";
import { Layout } from "../../../components/Layout";
import { CustomLoading } from "../../../components/CustomLoading";
import { CustomError } from "../../../components/CustomError";
import { IValidElements } from "@gooddata/sdk-ui/dist/filters/AttributeFilter/AttributeElements";
import { useBackend } from "../../../context/auth";

interface IEmployeeProfileProps {
    validElements: IValidElements;
}

interface IEmployeeProfileState {
    selectedEmployeeUri: string;
}

const averageDailyTotalSales = newMeasure(averageDailyTotalSalesIdentifier, m =>
    m.alias("$ Avg Daily Total Sales").format("$#,##0"),
);
const averageCheckSizeByServer = newMeasure(averageCheckSizeByServerIdentifier, m =>
    m.alias("$ Avg Check Size By Server").format("$#,##0"),
);
const measures = [averageDailyTotalSales];
const menuCategoryAttribute = newAttribute(menuCategoryAttributeDFIdentifier);
const menuItemNameAttribute = newAttribute(menuItemNameAttributeDFIdentifier, a => a.alias("Menu Item name"));

export const EmployeeProfile: React.FC<IEmployeeProfileProps> = ({ validElements }) => {
    const backend = useBackend();
    const [{ selectedEmployeeUri }, setState] = useState<IEmployeeProfileState>({
        selectedEmployeeUri: validElements.items[0].element.uri,
    });

    useEffect(() => {
        const newDefaultEmployeeUri = validElements.items[0].element.uri;
        if (newDefaultEmployeeUri !== selectedEmployeeUri) {
            setState({
                selectedEmployeeUri: newDefaultEmployeeUri,
            });
        }
    }, [validElements]);

    const selectEmployee = (uri: string) =>
        setState({
            selectedEmployeeUri: uri,
        });

    const buildSidebarItem = (item, selectedEmployeeUri) => {
        const {
            element: { title, uri },
        } = item;

        return (
            <SidebarItem
                key={uri}
                label={title}
                id={uri}
                isSelected={selectedEmployeeUri === uri}
                onClick={selectEmployee}
            />
        );
    };

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
                    ? validElements.items.map(item => buildSidebarItem(item, selectedEmployeeUri))
                    : null}
            </ul>
        </div>
    );

    const selectedEmployeesUris: IAttributeElementsByRef = { uris: [selectedEmployeeUri] };
    const employeeFilter = newPositiveAttributeFilter(employeeNameIdentifier, selectedEmployeesUris);
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
                            <EmployeeCard name={employeeName} />
                        </div>
                        <div className="kpis">
                            <KpiMetricBox title="Daily sales">
                                <Kpi
                                    backend={backend}
                                    filters={[employeeFilter]}
                                    measure={averageDailyTotalSales}
                                    workspace={projectId}
                                    LoadingComponent={(...otherProps) => (
                                        <CustomLoading inline imageHeight={20} {...otherProps} />
                                    )}
                                    ErrorComponent={CustomError}
                                />
                            </KpiMetricBox>

                            <KpiMetricBox title="Average check amount">
                                <Kpi
                                    backend={backend}
                                    filters={[employeeFilter]}
                                    measure={averageCheckSizeByServer}
                                    workspace={projectId}
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
                                    backend={backend}
                                    measures={measures}
                                    viewBy={menuCategoryAttribute}
                                    filters={[employeeFilter]}
                                    workspace={projectId}
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
                                    backend={backend}
                                    measures={measures}
                                    viewBy={menuItemNameAttribute}
                                    filters={[employeeFilter]}
                                    workspace={projectId}
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
};
