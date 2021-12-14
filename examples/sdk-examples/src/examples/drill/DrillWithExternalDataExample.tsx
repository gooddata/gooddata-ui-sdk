// (C) 2007-2021 GoodData Corporation
import React, { useState } from "react";
import fetch from "isomorphic-fetch";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { LoadingComponent, ErrorComponent, HeaderPredicates } from "@gooddata/sdk-ui";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import {
    newPositiveAttributeFilter,
    attributeIdentifier,
    modifyMeasure,
    modifyAttribute,
} from "@gooddata/sdk-model";
import { workspace } from "../../constants/fixtures";
import * as Md from "../../md/full";
import { EmployeeProfile } from "./EmployeeProfile";

const AvgDailyTotalSales = modifyMeasure(Md.$AvgDailyTotalSales, (m) =>
    m.alias("$ Avg Daily Total Sales").format("$#,##0").localId("averageDailyTotalSales"),
);
const LocationState = modifyAttribute(Md.LocationState, (a) => a.localId("locationState"));
const EmployeeName = modifyAttribute(Md.EmployeeName.Default, (a) => a.localId("employeeName"));
const TotalSales2 = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales").localId("totalSales"),
);
const LocationName = modifyAttribute(Md.LocationName.Default, (a) => a.localId("locationName"));
const locationStateAttributeUri = `/gdc/md/${workspace}/obj/2210`;

interface IEmployee3rdPartyData {
    error: any;
    isLoading: boolean;
    data: any;
}

interface IHasNameUri {
    name: string;
    uri: string;
}

const stateTableStyle: React.CSSProperties = { height: 200 };
const employeeTableStyle: React.CSSProperties = { height: 300 };
const salesChartStyle: React.CSSProperties = { height: 300 };

const stateTableMeasures = [AvgDailyTotalSales];
const stateTableRows = [LocationState];
const stateTableDrillableItems = [HeaderPredicates.identifierMatch(attributeIdentifier(LocationState)!)];

const employeeTableMeasures = [AvgDailyTotalSales];
const employeeTableRows = [EmployeeName];
const employeeTableDrillableItems = [HeaderPredicates.identifierMatch(attributeIdentifier(EmployeeName)!)];

const salesChartMeasures = [TotalSales2];
const salesChartDrillableItems = [HeaderPredicates.identifierMatch(attributeIdentifier(LocationName)!)];

const EmployeeDetails: React.FC<{ employeeData: IEmployee3rdPartyData }> = ({ employeeData }) => {
    if (employeeData.error) {
        return <ErrorComponent height={150} message="There was an error getting employee details" />;
    } else if (employeeData.isLoading) {
        return <LoadingComponent height={150} />;
    } else if (employeeData.data) {
        return <EmployeeProfile {...employeeData.data} />;
    }
    return null;
};

export const DrillWithExternalDataExample: React.FC = () => {
    const [state, setState] = useState<IHasNameUri | null>(null);
    const [location, setLocation] = useState<IHasNameUri | null>(null);
    const [employee, setEmployee] = useState<any | null>(null);
    const [employee3rdPartyData, setEmployee3rdPartyData] = useState<IEmployee3rdPartyData>({
        data: null,
        error: null,
        isLoading: false,
    });

    const onLocationDrill = (drillTarget: any) => {
        const { name, uri } =
            drillTarget.drillContext.element === "bar"
                ? drillTarget.drillContext.intersection[1].header.attributeHeaderItem
                : drillTarget.drillContext.points[0].intersection[1].header.attributeHeaderItem;

        const newLocation: IHasNameUri = {
            name,
            uri,
        };

        setLocation(newLocation);
        setState(null);
    };

    const onStateDrill = (drillTarget: any) => {
        const { name, id } = drillTarget.drillContext.row[0];

        const newState: IHasNameUri = {
            name,
            uri: `${locationStateAttributeUri}/elements?id=${id}`,
        };

        setState(newState);
        setLocation(null);
    };

    const onStateClear = () => setState(null);
    const onLocationClear = () => setLocation(null);

    const onEmployeeDrill = (drillTarget: any) => {
        const newEmployee = drillTarget.drillContext.row[0];

        setEmployee(newEmployee);
        setEmployee3rdPartyData({
            error: null,
            isLoading: true,
            data: null,
        });

        const firstName = newEmployee.name.split(" ")[0];

        fetch(`https://api.genderize.io/?name=${firstName}&country_id=us`)
            .then((res) => res.json())
            .then(({ gender }) => {
                return fetch(
                    `https://randomuser.me/api/?nat=us&inc=dob,cell,registered,location&gender=${gender}&seed=gooddata-${newEmployee.id}`,
                )
                    .then((res) => res.json())
                    .then(({ results }) => {
                        setEmployee3rdPartyData({
                            isLoading: false,
                            error: null,
                            data: {
                                ...results[0],
                                id: newEmployee.id,
                                gender,
                            },
                        });
                    })
                    .catch(() => {
                        setEmployee3rdPartyData({
                            isLoading: false,
                            error: null,
                            data: {
                                dob: {
                                    date: new Date(),
                                },
                                registered: {
                                    date: new Date(),
                                },
                                cell: "123456",
                                location: {
                                    city: "Sample City",
                                    state: "Sample State (load failed)",
                                },
                                id: newEmployee.id,
                                gender,
                            },
                        });
                    });
            });
    };

    const getFilters = (state: IHasNameUri | null, location: IHasNameUri | null) => {
        const filters = [];
        if (state) {
            filters.push(
                newPositiveAttributeFilter(Md.LocationState, {
                    uris: [state.uri],
                }),
            );
        }
        if (location) {
            filters.push(
                newPositiveAttributeFilter(Md.LocationName.Default, {
                    uris: [location.uri],
                }),
            );
        }
        return filters;
    };

    const tableFilters = getFilters(state, location);

    return (
        <div className="layout-wrapper">
            {/* language=CSS */}
            <style jsx>{`
                .layout-wrapper {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    grid-column-gap: 20px;
                    grid-row-gap: 20px;
                    grid-template-rows: auto;
                }
                h3 {
                    margin-top: 0;
                    border-bottom: 2px solid #14b2e2;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                .employeeTable {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .employeeTableWrapper {
                    position: relative;
                    height: 100%;
                    flex: 1 0 auto;
                }
                .details {
                    padding-left: 20px;
                }
                .employeesHeading {
                    margin-top: 20px;
                }
            `}</style>
            <div>
                <h3>States</h3>
                <div style={stateTableStyle} className="s-state-table">
                    <PivotTable
                        measures={stateTableMeasures}
                        rows={stateTableRows}
                        drillableItems={stateTableDrillableItems}
                        onDrill={onStateDrill}
                    />
                </div>
                <h3>
                    {!state && !location ? "All Employees" : "Employees from "}
                    {state && (
                        <span>
                            {state.name}&nbsp;
                            <button
                                onClick={onStateClear}
                                className="gd-button gd-button-primary gd-button-small gd-button-icon-only gd-icon-cross s-employee-heading-clear-state"
                            />
                        </span>
                    )}
                    {location && (
                        <span>
                            {location.name}&nbsp;
                            <button
                                onClick={onLocationClear}
                                className="gd-button gd-button-primary gd-button-small gd-button-icon-only gd-icon-cross s-employee-heading-clear-location"
                            />
                        </span>
                    )}
                </h3>
                <div style={employeeTableStyle} className="s-employee-table">
                    <PivotTable
                        measures={employeeTableMeasures}
                        rows={employeeTableRows}
                        drillableItems={employeeTableDrillableItems}
                        filters={tableFilters}
                        onDrill={onEmployeeDrill}
                    />
                </div>
            </div>
            <div className="details">
                <h3>
                    Sales from {!state && !location && "All Locations"}
                    {state && (
                        <span>
                            {state.name}&nbsp;
                            <button
                                onClick={onStateClear}
                                className="gd-button gd-button-primary gd-button-small gd-button-icon-only gd-icon-cross s-sales-heading-clear-state"
                            />
                        </span>
                    )}
                    {location && (
                        <span>
                            {location.name}&nbsp;
                            <button
                                onClick={onLocationClear}
                                className="gd-button gd-button-primary gd-button-small gd-button-icon-only gd-icon-cross s-sales-heading-clear-location"
                            />
                        </span>
                    )}
                </h3>
                <div style={salesChartStyle} className="s-sales-chart">
                    <ColumnChart
                        measures={salesChartMeasures}
                        viewBy={LocationName}
                        filters={tableFilters}
                        drillableItems={salesChartDrillableItems}
                        onDrill={onLocationDrill}
                    />
                </div>
                {employee && (
                    <div>
                        <h3 className="s-employee-name">{employee.name}</h3>
                        <EmployeeDetails employeeData={employee3rdPartyData} />
                    </div>
                )}
            </div>
        </div>
    );
};
