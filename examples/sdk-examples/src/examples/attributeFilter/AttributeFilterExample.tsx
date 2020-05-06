// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { LineChart } from "@gooddata/sdk-ui-charts";
import {
    attributeIdentifier,
    IPositiveAttributeFilter,
    INegativeAttributeFilter,
    isAttributeElementsByRef,
} from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../ldm";

interface IAttributeFilterExampleState {
    filters: Array<IPositiveAttributeFilter | INegativeAttributeFilter>;
    error: string;
}

export class AttributeFilterExample extends Component<{}, IAttributeFilterExampleState> {
    constructor(props) {
        super(props);

        this.onApply = this.onApply.bind(this);
        this.state = {
            filters: [],
            error: null,
        };
    }

    public onLoadingChanged(...params) {
        // tslint:disable-next-line:no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    }

    public onApply(filter) {
        // tslint:disable-next-line:no-console
        console.log("AttributeFilterExample onApply", filter);
        this.setState({ filters: [], error: null });
        if (filter.in) {
            this.filterPositiveAttribute(filter);
        } else {
            this.filterNegativeAttribute(filter);
        }
    }

    public onError(...params) {
        // tslint:disable-next-line:no-console
        console.info("AttributeFilterExample onLoadingChanged", ...params);
    }

    public filterPositiveAttribute(filter: IPositiveAttributeFilter) {
        let filters;
        const {
            positiveAttributeFilter,
            positiveAttributeFilter: { displayForm },
        } = filter;
        const checkLengthOfFilter = isAttributeElementsByRef(positiveAttributeFilter.in)
            ? positiveAttributeFilter.in.uris.length !== 0
            : positiveAttributeFilter.in.values.length !== 0;
        if (checkLengthOfFilter) {
            filters = [
                {
                    positiveAttributeFilter: {
                        displayForm,
                        in: isAttributeElementsByRef(positiveAttributeFilter.in)
                            ? positiveAttributeFilter.in.uris
                            : positiveAttributeFilter.in.values.map(
                                  element => `${LdmExt.locationResortUri}/elements?id=${element}`,
                              ),
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

    public filterNegativeAttribute(filter: INegativeAttributeFilter) {
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
                        notIn: isAttributeElementsByRef(notIn)
                            ? notIn.uris
                            : notIn.values.map(
                                  element => `${LdmExt.locationResortUri}/elements?id=${element}`,
                              ),
                    },
                },
            ];
        }
        this.setState({ filters });
    }

    public render() {
        const { filters, error } = this.state;

        return (
            <div className="s-attribute-filter">
                <AttributeFilter
                    identifier={attributeIdentifier(Ldm.LocationResort)}
                    fullscreenOnMobile={false}
                    onApply={this.onApply}
                />
                <div style={{ height: 300 }} className="s-line-chart">
                    {error ? (
                        <ErrorComponent message={error} />
                    ) : (
                        <LineChart
                            measures={[LdmExt.TotalSales2]}
                            trendBy={Ldm.LocationResort}
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
