// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import * as React from "react";
import fetch from "isomorphic-fetch";
import moment from "moment";
import { PropTypes } from "prop-types";
import {
    Table,
    ColumnChart,
    LoadingComponent,
    ErrorComponent,
    HeaderPredicateFactory,
    Model,
} from "@gooddata/react-components";
import {
    projectId,
    employeeNameIdentifier,
    averageDailyTotalSales,
    locationStateDisplayFormIdentifier,
    locationStateAttributeUri,
    totalSalesIdentifier,
    locationNameDisplayFormIdentifier,
    locationNameAttributeUri,
} from "../utils/fixtures";

const dateFormat = "YYYY-MM-DD";

const EmployeeProfile = ({ gender, dob, cell, id, registered, location }) => {
    const menOrWomen = gender === "male" ? "men" : "women";
    return (
        <div className="employeeProfile s-employee-profile">
            {/* language=CSS */}
            <style jsx>{`
                .employeeProfile {
                    display: flex;
                    margin-top: 20px;
                }
                .picture {
                    border-radius: 50%;
                    border: 2px solid #14b2e2;
                    width: 100px;
                    height: 100px;
                }
                .text {
                    flex: 1 1 auto;
                    margin-left: 20px;
                }
            `}</style>
            <div>
                <img
                    className="picture"
                    src={`https://randomuser.me/api/portraits/${menOrWomen}/${parseInt(id, 10) % 100}.jpg`}
                    alt=""
                />
            </div>
            <div className="text">
                <p>Date of birth: {moment(dob.date).format(dateFormat)}</p>
                <p>
                    Place of birth: {location.city}, {location.state}
                </p>
                <p>Phone: {cell}</p>
                <p>Employed since: {moment(registered.date).format(dateFormat)}</p>
            </div>
        </div>
    );
};
EmployeeProfile.propTypes = {
    gender: PropTypes.string.isRequired,
    dob: PropTypes.object.isRequired,
    cell: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
    registered: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
};

export class DrillWithExternalDataExample extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            state: null,
            location: null,
            employee: null,
            employee3rdPartyData: {
                error: null,
                isLoading: false,
                data: null,
            },
        };
    }

    onLocationDrill = drillTarget => {
        const { title: name, id } =
            drillTarget.drillContext.element === "bar"
                ? drillTarget.drillContext.intersection[1]
                : drillTarget.drillContext.points[0].intersection[1];
        const location = {
            name,
            uri: `${locationNameAttributeUri}/elements?id=${id}`,
        };
        this.setState({
            location,
            state: null,
        });
    };

    onStateDrill = drillTarget => {
        const { name, id } = drillTarget.drillContext.row[0];
        const state = {
            name,
            uri: `${locationStateAttributeUri}/elements?id=${id}`,
        };
        this.setState({
            state,
            location: null,
        });
    };

    onStateClear = () => {
        this.setState({
            state: null,
        });
    };

    onLocationClear = () => {
        this.setState({
            location: null,
        });
    };

    onEmployeeDrill = drillTarget => {
        const employee = drillTarget.drillContext.row[0];
        this.setState({
            employee,
            employee3rdPartyData: {
                error: null,
                isLoading: true,
                data: null,
            },
        });

        const firstName = employee.name.split(" ")[0];

        fetch(`https://api.genderize.io/?name=${firstName}&country_id=us`)
            .then(res => res.json())
            .then(({ gender }) => {
                return fetch(
                    `https://randomuser.me/api/?nat=us&inc=dob,cell,registered,location&gender=${gender}&seed=gooddata-${
                        employee.id
                    }`,
                )
                    .then(res => res.json())
                    .then(
                        ({ results }) => {
                            this.setState({
                                employee3rdPartyData: {
                                    isLoading: false,
                                    error: null,
                                    data: {
                                        ...results[0],
                                        id: employee.id,
                                        gender,
                                    },
                                },
                            });
                        },
                        error => {
                            this.setState({
                                employee3rdPartyData: {
                                    error,
                                    isLoading: false,
                                    data: null,
                                },
                            });
                        },
                    );
            });
    };

    getFilters = (state, location) => {
        const filters = [];
        if (state) {
            filters.push(Model.positiveAttributeFilter(locationStateDisplayFormIdentifier, [state.uri]));
        }
        if (location) {
            filters.push(Model.positiveAttributeFilter(locationNameDisplayFormIdentifier, [location.uri]));
        }
        return filters;
    };

    getMeasure = (identifier, localIdentifier, alias) =>
        Model.measure(identifier)
            .localIdentifier(localIdentifier)
            .alias(alias);

    getAttribute = (identifier, localIdentifier) => ({
        visualizationAttribute: {
            localIdentifier,
            displayForm: {
                identifier,
            },
        },
    });

    renderEmployeeDetails = employeeData => {
        if (employeeData.isError) {
            return <ErrorComponent height={150} message="There was an error getting employee details" />;
        } else if (employeeData.isLoading) {
            return <LoadingComponent height={150} />;
        } else if (employeeData.data) {
            return <EmployeeProfile {...employeeData.data} />;
        }
        return null;
    };

    render() {
        const { state, location } = this.state;

        const averageDailySalesMeasure = this.getMeasure(
            averageDailyTotalSales,
            "averageDailyTotalSales",
            "Average Sales",
        );
        const stateAttribute = this.getAttribute(locationStateDisplayFormIdentifier, "locationState");
        const stateTable = (
            <div style={{ height: 200 }} className="s-state-table">
                <Table
                    projectId={projectId}
                    measures={[averageDailySalesMeasure]}
                    attributes={[stateAttribute]}
                    drillableItems={[
                        HeaderPredicateFactory.identifierMatch(locationStateDisplayFormIdentifier),
                    ]}
                    onFiredDrillEvent={this.onStateDrill}
                />
            </div>
        );

        const employeeNameAttribute = this.getAttribute(employeeNameIdentifier, "employeeName");
        const locationNameAttribute = this.getAttribute(locationNameDisplayFormIdentifier, "locationName");
        const employeeTableFilters = this.getFilters(state, location);
        const employeeTable = (
            <div style={{ height: 300 }} className="s-employee-table">
                <Table
                    projectId={projectId}
                    measures={[averageDailySalesMeasure]}
                    attributes={[employeeNameAttribute]}
                    drillableItems={[HeaderPredicateFactory.identifierMatch(employeeNameIdentifier)]}
                    filters={employeeTableFilters}
                    onFiredDrillEvent={this.onEmployeeDrill}
                />
            </div>
        );

        const totalSalesMeasure = this.getMeasure(totalSalesIdentifier, "totalSales", "Total Sales");
        const salesTableFilters = this.getFilters(state, location);
        const totalSalesChart = (
            <div style={{ height: 300 }} className="s-sales-chart">
                <ColumnChart
                    projectId={projectId}
                    measures={[totalSalesMeasure]}
                    viewBy={locationNameAttribute}
                    filters={salesTableFilters}
                    drillableItems={[
                        HeaderPredicateFactory.identifierMatch(locationNameDisplayFormIdentifier),
                    ]}
                    onFiredDrillEvent={this.onLocationDrill}
                />
            </div>
        );

        const { employee, employee3rdPartyData } = this.state;

        const employeeDetails = this.renderEmployeeDetails(employee3rdPartyData);

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
                    {stateTable}
                    <h3>
                        {!state && !location ? "All Employees" : "Employees from "}
                        {state && (
                            <span>
                                {state.name}&nbsp;
                                <button
                                    onClick={this.onStateClear}
                                    className="gd-button gd-button-primary gd-button-small gd-button-icon-only icon-cross s-employee-heading-clear-state"
                                />
                            </span>
                        )}
                        {location && (
                            <span>
                                {location.name}&nbsp;
                                <button
                                    onClick={this.onLocationClear}
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
                                    onClick={this.onStateClear}
                                    className="gd-button gd-button-primary gd-button-small gd-button-icon-only icon-cross s-sales-heading-clear-state"
                                />
                            </span>
                        )}
                        {location && (
                            <span>
                                {location.name}&nbsp;
                                <button
                                    onClick={this.onLocationClear}
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
    }
}

export default DrillWithExternalDataExample;
