// (C) 2007-2022 GoodData Corporation
import React, { Component } from "react";
import { ErrorComponent, OnLoadingChanged, OnError } from "@gooddata/sdk-ui";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { LineChart } from "@gooddata/sdk-ui-charts";
import {
    attributeIdentifier,
    IAttributeFilter,
    IPositiveAttributeFilter,
    INegativeAttributeFilter,
    isAttributeElementsByRef,
    isPositiveAttributeFilter,
    modifyMeasure,
} from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);

interface IAttributeFilterExampleState {
    filters: Array<IPositiveAttributeFilter | INegativeAttributeFilter> | undefined;
    error: string | undefined;
}

export class AttributeFilterExample extends Component<unknown, IAttributeFilterExampleState> {
    state: IAttributeFilterExampleState = {
        filters: [],
        error: undefined,
    };

    public onLoadingChanged: OnLoadingChanged = (...params) => {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    };

    public onApply = (filter: IAttributeFilter): void => {
        // eslint-disable-next-line no-console
        console.log("AttributeFilterExample onApply", filter);
        this.setState({ filters: [], error: undefined });
        if (isPositiveAttributeFilter(filter)) {
            this.filterPositiveAttribute(filter);
        } else {
            this.filterNegativeAttribute(filter);
        }
    };

    public onError: OnError = (...params) => {
        // eslint-disable-next-line no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    };

    public filterPositiveAttribute(filter: IPositiveAttributeFilter): void {
        let filters;
        const {
            positiveAttributeFilter,
            positiveAttributeFilter: { displayForm },
        } = filter;
        const inElements = filter.positiveAttributeFilter.in;
        const checkLengthOfFilter = isAttributeElementsByRef(positiveAttributeFilter.in)
            ? positiveAttributeFilter.in.uris.length !== 0
            : positiveAttributeFilter.in.values.length !== 0;
        if (checkLengthOfFilter) {
            filters = [
                {
                    positiveAttributeFilter: {
                        displayForm,
                        in: inElements,
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

    public filterNegativeAttribute(filter: INegativeAttributeFilter): void {
        let filters;
        const {
            negativeAttributeFilter: { notIn, displayForm },
        } = filter;
        const checkLengthOfFilter = isAttributeElementsByRef(notIn)
            ? notIn.uris.length !== 0
            : notIn.values.length !== 0;
        if (checkLengthOfFilter) {
            filters = [
                {
                    negativeAttributeFilter: {
                        displayForm,
                        notIn,
                    },
                },
            ];
        }
        this.setState({ filters });
    }

    public render(): React.ReactNode {
        const { filters, error } = this.state;

        return (
            <div className="s-attribute-filter">
                <AttributeFilter
                    identifier={attributeIdentifier(Md.LocationResort)}
                    fullscreenOnMobile={false}
                    onApply={this.onApply}
                />
                <div style={{ height: 300 }} className="s-line-chart">
                    {error ? (
                        <ErrorComponent message={error} />
                    ) : (
                        <LineChart
                            measures={[TotalSales]}
                            trendBy={Md.LocationResort}
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
