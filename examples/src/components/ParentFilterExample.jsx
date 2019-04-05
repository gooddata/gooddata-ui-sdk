// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { AttributeElements, BarChart, Model } from "@gooddata/react-components";
import Select from "react-select";
import "react-select/dist/react-select.css";
import "@gooddata/react-components/styles/css/main.css";

import {
    projectId,
    locationStateAttributeIdentifier,
    locationStateDisplayFormIdentifier,
    locationCityAttributeIdentifier,
    locationCityDisplayFormIdentifier,
    locationIdAttributeIdentifier,
    locationNameDisplayFormIdentifier,
    totalSalesIdentifier,
} from "../utils/fixtures";

export class ParentFilterExample extends Component {
    constructor(props) {
        super(props);
        this.onChangeHandlers = {};
        this.renderFilter = this.renderFilter.bind(this);
        this.state = {
            stateFilterValues: [],
            cityFilterValues: [],
        };
        this.handlers = {
            state: this.onStateChange,
            city: this.onCityChange,
        };
    }

    onStateChange = stateFilterValues => {
        this.setState({
            stateFilterValues,
        });
    };

    onCityChange = cityFilterValues => {
        this.setState({
            cityFilterValues,
        });
    };

    renderVisualization(stateFilterValues, cityFilterValues) {
        const visFilters = [];

        if (stateFilterValues.length) {
            visFilters.push(
                Model.positiveAttributeFilter(
                    locationStateDisplayFormIdentifier,
                    stateFilterValues.map(filter => filter.value),
                ),
            );
        }
        if (cityFilterValues.length) {
            visFilters.push(
                Model.positiveAttributeFilter(
                    locationCityDisplayFormIdentifier,
                    cityFilterValues.map(filter => filter.value),
                ),
            );
        }

        const measureTotalSales = Model.measure(totalSalesIdentifier)
            .format("#,##0")
            .alias("$ Total Sales");

        const viewByLocationName = Model.attribute(locationNameDisplayFormIdentifier).localIdentifier(
            "location_name",
        );

        return (
            <div style={{ height: 500 }}>
                <BarChart
                    measures={[measureTotalSales]}
                    viewBy={viewByLocationName}
                    filters={visFilters}
                    projectId={projectId}
                    height={500}
                />
            </div>
        );
    }

    renderFilter(key, displayFormIdentifier, filterValues, placeholder, options, onChange) {
        return (
            <AttributeElements
                key={key}
                identifier={displayFormIdentifier}
                projectId={projectId}
                options={options}
            >
                {({ validElements, isLoading, error }) => {
                    if (error) {
                        return <div>{error}</div>;
                    }
                    const selectOptions = validElements
                        ? validElements.items.map(item => ({
                              label: item.element.title,
                              value: item.element.uri,
                          }))
                        : [];
                    return (
                        <span
                            style={{
                                display: "inline-block",
                                minWidth: "10em",
                                verticalAlign: "middle",
                            }}
                        >
                            <Select
                                onChange={onChange}
                                className={`s-select-${key}`}
                                options={selectOptions}
                                multi
                                isLoading={isLoading}
                                placeholder={placeholder}
                                value={filterValues}
                            />
                        </span>
                    );
                }}
            </AttributeElements>
        );
    }

    render() {
        const { stateFilterValues, cityFilterValues } = this.state;

        // State (parent) filter
        const stateFilter = this.renderFilter(
            "state",
            locationStateDisplayFormIdentifier,
            stateFilterValues,
            "all states",
            { limit: 20 },
            this.onStateChange,
        );

        // City (child) filter
        const cityOptions = { limit: 20 };
        if (stateFilterValues.length) {
            // parent value uris need to be surrounded by '[]' and separated by ','
            const selectedParentItems = stateFilterValues
                .map(parentItem => `[${parentItem.value}]`)
                .join(", ");
            const afm = {
                attributes: [
                    {
                        displayForm: {
                            identifier: locationCityDisplayFormIdentifier,
                        },
                        localIdentifier: "childAttribute",
                    },
                ],
                filters: [
                    {
                        expression: {
                            value:
                                // parent attribute identifier surrounded by '{}'
                                `({${locationStateAttributeIdentifier}}` +
                                // selected parent values surrounded by '[]' and separated by ','
                                ` IN (${selectedParentItems}))` +
                                // attribute identifier of common attribute between parent
                                // and child attributes surrounded by '{}'
                                ` OVER {${locationIdAttributeIdentifier}}` +
                                // child attribute identifier surrounded by '{}'
                                ` TO {${locationCityAttributeIdentifier}}`,
                        },
                    },
                ],
            };
            cityOptions.afm = afm;
        }
        const cityFilter = this.renderFilter(
            "city",
            locationCityDisplayFormIdentifier,
            cityFilterValues,
            "all cities",
            cityOptions,
            this.onCityChange,
        );

        return (
            <div>
                <span>Total Sales per site in&emsp;</span>
                {stateFilter}
                &emsp;and&emsp; {cityFilter}
                <hr className="separator" />
                {this.renderVisualization(stateFilterValues, cityFilterValues)}
            </div>
        );
    }
}

export default ParentFilterExample;
