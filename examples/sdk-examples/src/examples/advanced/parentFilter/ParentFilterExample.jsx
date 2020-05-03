// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { AttributeElements, BarChart } from "@gooddata/sdk-ui";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";
import Select from "react-select";
import "react-select/dist/react-select.css";

import { workspace } from "../../../constants/fixtures";
import { Ldm, LdmExt } from "../../../ldm";

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

    renderinsightView(stateFilterValues, cityFilterValues) {
        const visFilters = [];

        if (stateFilterValues.length) {
            visFilters.push(
                newPositiveAttributeFilter(
                    Ldm.LocationState,
                    stateFilterValues.map(filter => filter.value),
                ),
            );
        }
        if (cityFilterValues.length) {
            visFilters.push(
                newPositiveAttributeFilter(
                    Ldm.LocationCity,
                    cityFilterValues.map(filter => filter.value),
                ),
            );
        }

        return (
            <div style={{ height: 500 }}>
                <BarChart
                    measures={[LdmExt.TotalSales1]}
                    viewBy={Ldm.LocationName.Default}
                    filters={visFilters}
                    workspace={workspace}
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
                workspace={workspace}
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
            Ldm.LocationState.attribute.displayForm,
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
                            identifier: Ldm.LocationCity.attribute.displayForm,
                        },
                        localIdentifier: "childAttribute",
                    },
                ],
                filters: [
                    {
                        expression: {
                            value:
                                // parent attribute identifier surrounded by '{}'
                                `({${Ldm.LocationState.attribute.displayForm}}` +
                                // selected parent values surrounded by '[]' and separated by ','
                                ` IN (${selectedParentItems}))` +
                                // attribute identifier of common attribute between parent
                                // and child attributes surrounded by '{}'
                                ` OVER {${Ldm.LocationId.attribute.displayForm}}` +
                                // child attribute identifier surrounded by '{}'
                                ` TO {${Ldm.LocationCity.attribute.displayForm}}`,
                        },
                    },
                ],
            };
            cityOptions.afm = afm;
        }
        const cityFilter = this.renderFilter(
            "city",
            Ldm.LocationCity.attribute.displayForm,
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
                {this.renderinsightView(stateFilterValues, cityFilterValues)}
            </div>
        );
    }
}

export default ParentFilterExample;
