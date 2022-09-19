// (C) 2007-2022 GoodData Corporation
import React, { useState, useEffect } from "react";
import { BarChart, PieChart } from "@gooddata/sdk-ui-charts";
import { IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import {
    newPositiveAttributeFilter,
    IAttributeElementsByRef,
    modifyMeasure,
    modifyAttribute,
    IAttributeElement,
} from "@gooddata/sdk-model";
import { Kpi } from "@gooddata/sdk-ui";
import { SidebarItem } from "../../../components/SidebarItem";
import { EmployeeCard } from "./EmployeeCard";
import { KpiMetricBox } from "./KpiMetricBox";
import * as Md from "../../../md/full";
import { Layout } from "../../../components/Layout";
import { CustomLoading } from "../../../components/CustomLoading";
import { CustomError } from "../../../components/CustomError";

const AvgDailyTotalSales = modifyMeasure(Md.$AvgDailyTotalSales, (m) =>
    m.alias("$ Avg Daily Total Sales").format("$#,##0"),
);
const AvgCheckSizeByServer = modifyMeasure(Md.AvgCheckSizeByServer, (m) =>
    m.alias("$ Avg Check Size By Server").format("$#,##0"),
);
const MenuItemName = modifyAttribute(Md.MenuItemName, (a) => a.alias("Menu Item name"));

interface IEmployeeProfileProps {
    validElements: IElementsQueryResult;
}

const measures = [AvgDailyTotalSales];

export const EmployeeProfile: React.FC<IEmployeeProfileProps> = ({ validElements }) => {
    const [selectedEmployeeUri, setSelectedEmployeeUri] = useState<string>(validElements.items[0].uri);

    useEffect(() => {
        const newDefaultEmployeeUri = validElements.items[0].uri;
        if (newDefaultEmployeeUri !== selectedEmployeeUri) {
            setSelectedEmployeeUri(newDefaultEmployeeUri);
        }
    }, [validElements]);

    const selectEmployee = (uri: string) => setSelectedEmployeeUri(uri);

    const buildSidebarItem = (item: IAttributeElement, selectedEmployeeUri: string) => {
        const { title, uri } = item;

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
                    ? validElements.items.map((item) => buildSidebarItem(item, selectedEmployeeUri))
                    : null}
            </ul>
        </div>
    );

    const selectedEmployeesUris: IAttributeElementsByRef = { uris: [selectedEmployeeUri] };
    const employeeFilter = newPositiveAttributeFilter(Md.EmployeeName.Default, selectedEmployeesUris);
    const selectedEmployee = validElements.items.find((item) => item.uri === selectedEmployeeUri);

    const employeeName = selectedEmployee!.title;

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
                                    filters={[employeeFilter]}
                                    measure={AvgDailyTotalSales}
                                    LoadingComponent={(...otherProps) => (
                                        <CustomLoading inline imageHeight={20} {...otherProps} />
                                    )}
                                    ErrorComponent={CustomError}
                                />
                            </KpiMetricBox>

                            <KpiMetricBox title="Average check amount">
                                <Kpi
                                    filters={[employeeFilter]}
                                    measure={AvgCheckSizeByServer}
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
                                    viewBy={Md.MenuCategory}
                                    filters={[employeeFilter]}
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
                                    viewBy={MenuItemName}
                                    filters={[employeeFilter]}
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
