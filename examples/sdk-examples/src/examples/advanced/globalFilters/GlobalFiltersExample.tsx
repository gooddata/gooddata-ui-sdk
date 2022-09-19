// (C) 2007-2022 GoodData Corporation
import React, { useMemo, useState } from "react";
import { BarChart, Headline, PieChart } from "@gooddata/sdk-ui-charts";
import {
    attributeDisplayFormRef,
    IAttributeElement,
    modifyAttribute,
    modifyMeasure,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import * as Md from "../../../md/full";
import { CustomLoading } from "../../../components/CustomLoading";
import { CustomError } from "../../../components/CustomError";
import { SidebarItem } from "../../../components/SidebarItem";
import { Layout } from "../../../components/Layout";

import { EmployeeCard } from "./EmployeeCard";
import { KpiMetricBox } from "./KpiMetricBox";

const AvgDailyTotalSales = modifyMeasure(Md.$AvgDailyTotalSales, (m) =>
    m.alias("$ Avg Daily Total Sales").format("$#,##0"),
);
const AvgCheckSizeByServer = modifyMeasure(Md.AvgCheckSizeByServer, (m) =>
    m.alias("$ Avg Check Size By Server").format("$#,##0"),
);
const MenuItemName = modifyAttribute(Md.MenuItemName, (a) => a.alias("Menu Item name"));

const measures = [AvgDailyTotalSales];

interface ISidebarProps {
    employees: IAttributeElement[];
    selectedEmployeeUri: string;
    onEmployeeClick: (employeeUrl: string) => void;
}

const Sidebar = (props: ISidebarProps) => {
    const { employees, selectedEmployeeUri, onEmployeeClick } = props;
    return (
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
                {employees.map((employee) => {
                    const { title, uri } = employee;
                    return (
                        <SidebarItem
                            key={uri}
                            label={title}
                            id={uri}
                            isSelected={selectedEmployeeUri === uri}
                            onClick={onEmployeeClick}
                        />
                    );
                })}
            </ul>
        </div>
    );
};

export const GlobalFiltersExample = () => {
    const [selectedEmployeeUri, setSelectedEmployeeUri] = useState<string>("");

    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const { result: validElements, status } = useCancelablePromise(
        {
            promise: async () => {
                const result = await backend
                    .workspace(workspace)
                    .attributes()
                    .elements()
                    .forDisplayForm(attributeDisplayFormRef(Md.EmployeeName.Default))
                    .withLimit(20)
                    .query();
                return result.items;
            },
            onSuccess: (elements) => {
                const newDefaultEmployeeUri = elements[0].uri;
                if (newDefaultEmployeeUri !== selectedEmployeeUri) {
                    setSelectedEmployeeUri(newDefaultEmployeeUri);
                }
            },
        },
        [backend, workspace],
    );

    const effectiveFilters = useMemo(
        () => [newPositiveAttributeFilter(Md.EmployeeName.Default, { uris: [selectedEmployeeUri] })],
        [selectedEmployeeUri],
    );

    if (status === "pending" || status === "loading") {
        return (
            <>
                <style jsx>
                    {`
                        div {
                            flex: 1 0 auto;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                        }
                    `}
                </style>
                <div>
                    <CustomLoading imageHeight={100} height={200} />
                </div>
            </>
        );
    }

    const selectedEmployee =
        validElements!.find((item) => item.uri === selectedEmployeeUri) ?? validElements![0];
    const employeeName = selectedEmployee?.title;

    return (
        <div className="layout-wrapper">
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
            <Layout
                sidebar={
                    <Sidebar
                        employees={validElements!}
                        onEmployeeClick={setSelectedEmployeeUri}
                        selectedEmployeeUri={selectedEmployeeUri}
                    />
                }
            >
                <div>
                    <h2>Employee overview</h2>
                    <div className="details">
                        <div>
                            <EmployeeCard name={employeeName} />
                        </div>
                        <div className="kpis">
                            <KpiMetricBox title="Daily sales">
                                <Headline
                                    primaryMeasure={AvgDailyTotalSales}
                                    filters={effectiveFilters}
                                    LoadingComponent={CustomLoading}
                                    ErrorComponent={CustomError}
                                />
                            </KpiMetricBox>
                            <KpiMetricBox title="Average check amount">
                                <Headline
                                    primaryMeasure={AvgCheckSizeByServer}
                                    filters={effectiveFilters}
                                    LoadingComponent={CustomLoading}
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
                                    filters={effectiveFilters}
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
                                    filters={effectiveFilters}
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
