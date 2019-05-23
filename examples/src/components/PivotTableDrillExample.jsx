// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { PivotTable, HeaderPredicateFactory, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    projectId,
    quarterDateIdentifier,
    monthDateIdentifier,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
    franchiseFeesIdentifier,
    franchiseFeesAdRoyaltyIdentifier,
    franchiseFeesInitialFranchiseFeeIdentifier,
    franchiseFeesIdentifierOngoingRoyalty,
    menuCategoryAttributeDFIdentifier,
} from "../utils/fixtures";

const measures = [
    Model.measure(franchiseFeesIdentifier)
        .format("#,##0")
        .localIdentifier("franchiseFeesIdentifier"),
    Model.measure(franchiseFeesAdRoyaltyIdentifier)
        .format("#,##0")
        .localIdentifier("franchiseFeesAdRoyaltyIdentifier"),
    Model.measure(franchiseFeesInitialFranchiseFeeIdentifier)
        .format("#,##0")
        .localIdentifier("franchiseFeesInitialFranchiseFeeIdentifier"),
    Model.measure(franchiseFeesIdentifierOngoingRoyalty)
        .format("#,##0")
        .localIdentifier("franchiseFeesIdentifierOngoingRoyalty"),
];

const attributes = [
    Model.attribute(locationStateDisplayFormIdentifier).localIdentifier("state"),
    Model.attribute(locationNameDisplayFormIdentifier).localIdentifier("name"),
    Model.attribute(menuCategoryAttributeDFIdentifier).localIdentifier("menu"),
];

const columns = [Model.attribute(quarterDateIdentifier), Model.attribute(monthDateIdentifier)];

const totals = [
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "sum",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesAdRoyaltyIdentifier",
        type: "sum",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "max",
        attributeIdentifier: "state",
    },
    {
        measureIdentifier: "franchiseFeesIdentifier",
        type: "sum",
        attributeIdentifier: "menu",
    },
    {
        measureIdentifier: "franchiseFeesAdRoyaltyIdentifier",
        type: "sum",
        attributeIdentifier: "menu",
    },
];

const drillableItems = [
    HeaderPredicateFactory.identifierMatch(menuCategoryAttributeDFIdentifier),
    HeaderPredicateFactory.identifierMatch(franchiseFeesIdentifier),
];

export class PivotTableDrillExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            drillEvent: null,
        };
    }

    onDrill = drillEvent => {
        // eslint-disable-next-line no-console
        console.log(
            "onFiredDrillEvent",
            drillEvent,
            JSON.stringify(drillEvent.drillContext.intersection, null, 2),
        );
        this.setState({
            drillEvent,
        });
        return true;
    };

    renderDrillValue() {
        const { drillEvent } = this.state;

        if (!drillEvent) {
            return null;
        }

        const drillColumn = drillEvent.drillContext.row[drillEvent.drillContext.columnIndex];
        const drillValue = typeof drillColumn === "object" ? drillColumn.name : drillColumn;

        return (
            <h3>
                You have Clicked <span className="s-drill-value">{drillValue}</span>{" "}
            </h3>
        );
    }

    render() {
        return (
            <div>
                {this.renderDrillValue()}
                <div style={{ height: 500 }} className="s-pivot-table-drill">
                    <PivotTable
                        projectId={projectId}
                        measures={measures}
                        rows={attributes}
                        columns={columns}
                        pageSize={20}
                        drillableItems={drillableItems}
                        onFiredDrillEvent={this.onDrill}
                        totals={totals}
                    />
                </div>
            </div>
        );
    }
}

export default PivotTableDrillExample;
