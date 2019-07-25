// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { LineChart, AttributeFilter, Model, ErrorComponent } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    totalSalesIdentifier,
    locationResortIdentifier,
    locationResortUri,
    projectId,
} from "../utils/fixtures";

export class AttributeFilterExample extends Component {
    constructor(props) {
        super(props);

        this.onApply = this.onApply.bind(this);
        this.state = {
            filters: [],
            error: null,
        };
    }

    onLoadingChanged(...params) {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    }

    onApply(filter) {
        // eslint-disable-next-line no-console
        console.log("AttributeFilterExample onApply", filter);
        this.setState({ filters: [], error: null });
        if (filter.in) {
            this.filterPositiveAttribute(filter);
        } else {
            this.filterNegativeAttribute(filter);
        }
    }

    onError(...params) {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    }

    filterPositiveAttribute(filter) {
        let filters;
        if (filter.in.length !== 0) {
            filters = [
                {
                    positiveAttributeFilter: {
                        displayForm: {
                            identifier: filter.id,
                        },
                        in: filter.in.map(element => `${locationResortUri}/elements?id=${element}`),
                    },
                },
            ];
        } else {
            this.setState({
                error: "The filter must have at least one item selected",
            });
        }
        this.setState({ filters });
    }

    filterNegativeAttribute(filter) {
        let filters;
        if (filter.notIn.length !== 0) {
            filters = [
                {
                    negativeAttributeFilter: {
                        displayForm: {
                            identifier: filter.id,
                        },
                        notIn: filter.notIn.map(element => `${locationResortUri}/elements?id=${element}`),
                    },
                },
            ];
        }
        this.setState({ filters });
    }

    render() {
        const { filters, error } = this.state;

        const totalSales = Model.measure(totalSalesIdentifier)
            .format("#,##0")
            .alias("$ Total Sales");

        const locationResort = Model.attribute(locationResortIdentifier);

        return (
            <div className="s-attribute-filter">
                <AttributeFilter
                    identifier={locationResortIdentifier}
                    projectId={projectId}
                    fullscreenOnMobile={false}
                    onApply={this.onApply}
                />
                <div style={{ height: 300 }} className="s-line-chart">
                    {error ? (
                        <ErrorComponent message={error} />
                    ) : (
                        <LineChart
                            projectId={projectId}
                            measures={[totalSales]}
                            trendBy={locationResort}
                            filters={filters}
                            onLoadingChanged={this.onLoadingChanged}
                            onError={this.onError}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default AttributeFilterExample;
