// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { ColumnChart, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import { totalSalesIdentifier, monthDateIdentifier, projectId } from "../utils/fixtures";

export class MeasureSortingExample extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-measure-sorting">
                <ColumnChart
                    projectId={projectId}
                    measures={[Model.measure(totalSalesIdentifier).localIdentifier(totalSalesIdentifier)]}
                    viewBy={Model.attribute(monthDateIdentifier).localIdentifier(monthDateIdentifier)}
                    sortBy={[Model.measureSortItem(totalSalesIdentifier, "desc")]}
                />
            </div>
        );
    }
}

export default MeasureSortingExample;
