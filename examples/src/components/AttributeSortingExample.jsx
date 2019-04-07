// (C) 2007-2019 GoodData Corporation

import React, { Component } from "react";
import { ColumnChart, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import { totalSalesIdentifier, locationCityDisplayFormIdentifier, projectId } from "../utils/fixtures";

export class AttributeSortingExample extends Component {
    render() {
        return (
            <div style={{ height: 300 }} className="s-attribute-sorting">
                <ColumnChart
                    projectId={projectId}
                    measures={[Model.measure(totalSalesIdentifier)]}
                    viewBy={Model.attribute(locationCityDisplayFormIdentifier).localIdentifier(
                        locationCityDisplayFormIdentifier,
                    )}
                    sortBy={[Model.attributeSortItem(locationCityDisplayFormIdentifier, "desc")]}
                />
            </div>
        );
    }
}

export default AttributeSortingExample;
