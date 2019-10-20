// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import fetch from "isomorphic-fetch";
import {
    PivotTable,
    ColumnChart,
    LoadingComponent,
    ErrorComponent,
    HeaderPredicateFactory,
} from "@gooddata/sdk-ui";
import { newMeasure, newPositiveAttributeFilter, newAttribute } from "@gooddata/sdk-model";
import {
    projectId,
    employeeNameIdentifier,
    averageDailyTotalSalesIdentifier,
    locationStateDisplayFormIdentifier,
    locationStateAttributeUri,
    totalSalesIdentifier,
    locationNameDisplayFormIdentifier,
    locationNameAttributeUri,
} from "../../constants/fixtures";
import { EmployeeProfile } from "./EmployeeProfile";
import { useBackend } from "../../context/auth";

export const DrillWithExternalDataExample: React.FC = () => {
    const backend = useBackend();
    const [componentState, setState] = useState({
        state: null,
        location: null,
        employee: null,
        employee3rdPartyData: {
            error: null,
            isLoading: false,
            data: null,
        },
    });

    const onLocationDrill = drillTarget => {
        const { title: name, id } =
            drillTarget.drillContext.element === "bar"
                ? drillTarget.drillContext.intersection[1]
                : drillTarget.drillContext.points[0].intersection[1];
        const location = {
            name,
            uri: `${locationNameAttributeUri}/elements?id=${id}`,
        };
        setState(oldState => ({
            ...oldState,
            location,
            state: null,
        }));
    };

    const onStateDrill = drillTarget => {
        const { name, id } = drillTarget.drillContext.row[0];
        const state = {
            name,
            uri: `${locationStateAttributeUri}/elements?id=${id}`,
        };
        setState(oldState => ({
            ...oldState,
            state,
            location: null,
        }));
    };

    const onStateClear = () =>
        setState(oldState => ({
            ...oldState,
            state: null,
        }));

    const onLocationClear = () =>
        setState(oldState => ({
            ...oldState,
            location: null,
        }));

    const onEmployeeDrill = drillTarget => {
        const employee = drillTarget.drillContext.row[0];
        setState(oldState => ({
            ...oldState,
            employee,
            employee3rdPartyData: {
                error: null,
                isLoading: true,
                data: null,
            },
        }));

        const firstName = employee.name.split(" ")[0];

        fetch(`https://api.genderize.io/?name=${firstName}&country_id=us`)
            .then(res => res.json())
            .then(({ gender }) => {
                return fetch(
                    `https://randomuser.me/api/?nat=us&inc=dob,cell,registered,location&gender=${gender}&seed=gooddata-${employee.id}`,
                )
                    .then(res => res.json())
                    .then(
                        ({ results }) => {
                            setState(oldState => ({
                                ...oldState,
                                employee3rdPartyData: {
                                    isLoading: false,
                                    error: null,
                                    data: {
                                        ...results[0],
                                        id: employee.id,
                                        gender,
                                    },
                                },
                            }));
                        },
                        error => {
                            setState(oldState => ({
                                ...oldState,
                                employee3rdPartyData: {
                                    error,
                                    isLoading: false,
                                    data: null,
                                },
                            }));
                        },
                    );
            });
    };

    const getFilters = (state, location) => {
        const filters = [];
        if (state) {
            filters.push(
                newPositiveAttributeFilter(locationStateDisplayFormIdentifier, { uris: [state.uri] }),
            );
        }
        if (location) {
            filters.push(
                newPositiveAttributeFilter(locationNameDisplayFormIdentifier, { uris: [location.uri] }),
            );
        }
        return filters;
    };

    const getMeasure = (identifier, localIdentifier, alias) =>
        newMeasure(identifier, m => m.alias(alias).localId(localIdentifier));

    const getAttribute = (identifier, localIdentifier) =>
        newAttribute(identifier, a => a.localId(localIdentifier));

    const renderEmployeeDetails = employeeData => {
        if (employeeData.isError) {
            return <ErrorComponent height={150} message="There was an error getting employee details" />;
        } else if (employeeData.isLoading) {
            return <LoadingComponent height={150} />;
        } else if (employeeData.data) {
            return <EmployeeProfile {...employeeData.data} />;
        }
        return null;
    };

    const { state, location } = componentState;

    const averageDailySalesMeasure = getMeasure(
        averageDailyTotalSalesIdentifier,
        "averageDailyTotalSales",
        "Average Sales",
    );
    const stateAttribute = getAttribute(locationStateDisplayFormIdentifier, "locationState");
    const stateTable = (
        <div style={{ height: 200 }} className="s-state-table">
            <PivotTable
                backend={backend}
                workspace={projectId}
                measures={[averageDailySalesMeasure]}
                rows={[stateAttribute]}
                drillableItems={[HeaderPredicateFactory.identifierMatch(locationStateDisplayFormIdentifier)]}
                onDrill={onStateDrill}
            />
        </div>
    );

    const employeeNameAttribute = getAttribute(employeeNameIdentifier, "employeeName");
    const locationNameAttribute = getAttribute(locationNameDisplayFormIdentifier, "locationName");
    const employeeTableFilters = getFilters(state, location);
    const employeeTable = (
        <div style={{ height: 300 }} className="s-employee-table">
            <PivotTable
                backend={backend}
                workspace={projectId}
                measures={[averageDailySalesMeasure]}
                rows={[employeeNameAttribute]}
                drillableItems={[HeaderPredicateFactory.identifierMatch(employeeNameIdentifier)]}
                filters={employeeTableFilters}
                onDrill={onEmployeeDrill}
            />
        </div>
    );

    const totalSalesMeasure = getMeasure(totalSalesIdentifier, "totalSales", "Total Sales");
    const salesTableFilters = getFilters(state, location);
    const totalSalesChart = (
        <div style={{ height: 300 }} className="s-sales-chart">
            <ColumnChart
                backend={backend}
                workspace={projectId}
                measures={[totalSalesMeasure]}
                viewBy={locationNameAttribute}
                filters={salesTableFilters}
                drillableItems={[HeaderPredicateFactory.identifierMatch(locationNameDisplayFormIdentifier)]}
                onDrill={onLocationDrill}
            />
        </div>
    );

    const { employee, employee3rdPartyData } = componentState;

    const employeeDetails = renderEmployeeDetails(employee3rdPartyData);

    return (
        <div className="layout-wrapper">
            {/* language=CSS */}
            <style jsx={true}>{`
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
                {stateTable}
                <h3>
                    {!state && !location ? "All Employees" : "Employees from "}
                    {state && (
                        <span>
                            {state.name}&nbsp;
                            <button
                                onClick={onStateClear}
                                className="gd-button gd-button-primary gd-button-small gd-button-icon-only icon-cross s-employee-heading-clear-state"
                            />
                        </span>
                    )}
                    {location && (
                        <span>
                            {location.name}&nbsp;
                            <button
                                onClick={onLocationClear}
                                className="gd-button gd-button-primary gd-button-small gd-button-icon-only icon-cross s-employee-heading-clear-location"
                            />
                        </span>
                    )}
                </h3>
                {employeeTable}
            </div>
            <div className="details">
                <h3>
                    Sales from {!state && !location && "All Locations"}
                    {state && (
                        <span>
                            {state.name}&nbsp;
                            <button
                                onClick={onStateClear}
                                className="gd-button gd-button-primary gd-button-small gd-button-icon-only icon-cross s-sales-heading-clear-state"
                            />
                        </span>
                    )}
                    {location && (
                        <span>
                            {location.name}&nbsp;
                            <button
                                onClick={onLocationClear}
                                className="gd-button gd-button-primary gd-button-small gd-button-icon-only icon-cross s-sales-heading-clear-location"
                            />
                        </span>
                    )}
                </h3>
                {totalSalesChart}
                {employee && (
                    <div>
                        <h3 className="s-employee-name">{employee.name}</h3>
                        {employeeDetails}
                    </div>
                )}
            </div>
        </div>
    );
};
