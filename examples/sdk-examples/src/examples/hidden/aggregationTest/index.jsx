// (C) 2007-2022 GoodData Corporation
import React, { Component } from "react";
import { BarChart, ColumnChart, PieChart } from "@gooddata/sdk-ui";
import { modifySimpleMeasure } from "@gooddata/sdk-model";
import * as Md from "../../../md/full";

const TotalSales = modifySimpleMeasure(Md.$TotalSales, (m) => m.aggregation("sum"));
const franchiseFeesMeasures = [
    Md.$FranchiseFees,
    Md.$FranchiseFeesAdRoyalty,
    Md.$FranchiseFeesInitialFranchiseFee,
    Md.$FranchiseFeesOngoingRoyalty,
].map((measure) => modifySimpleMeasure(measure, (m) => m.aggregation("sum")));

export class AggregationTest extends Component {
    onLoadingChanged(...params) {
        console.info("onLoadingChanged", ...params);
    }

    onError(...params) {
        console.info("onLoadingChanged", ...params);
    }

    render() {
        return (
            <div>
                <h1>Aggregation test</h1>

                <p>
                    This route is meant for testing requests with aggregation that sometimes fail during
                    migration.
                </p>

                <hr className="separator" />

                <h2 id="bar-chart">Bar chart</h2>
                <div style={{ height: 300 }} className="s-bar-chart">
                    <BarChart
                        measures={[TotalSales]}
                        viewBy={Md.LocationResort}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>

                <hr className="separator" />

                <h2 id="column-chart">Column chart</h2>
                <div style={{ height: 300 }} className="s-bar-chart">
                    <ColumnChart
                        measures={[Md.$TotalSales]}
                        viewBy={Md.DateMonth.Short}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>

                <hr className="separator" />

                <h2 id="column-chart">Pie chart</h2>

                <div style={{ height: 300 }} className="s-pie-chart">
                    <PieChart
                        measures={franchiseFeesMeasures}
                        onLoadingChanged={this.onLoadingChanged}
                        onError={this.onError}
                    />
                </div>
            </div>
        );
    }
}
