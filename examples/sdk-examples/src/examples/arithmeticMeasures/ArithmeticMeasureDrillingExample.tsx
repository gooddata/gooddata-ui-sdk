// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { PivotTable, HeaderPredicateFactory } from "@gooddata/sdk-ui";
import { newAttribute, newMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";

import {
    projectId,
    locationStateDisplayFormIdentifier,
    numberOfRestaurantsIdentifier,
    totalSalesIdentifier,
} from "../../constants/fixtures";
import { useBackend } from "../../context/auth";

const localIdentifiers = {
    numberOfRestaurants: "numberOfRestaurants",
    totalSales: "totalSales",
    averageRestaurantSales: "averageRestaurantSales",
};

const measures = [
    newMeasure(numberOfRestaurantsIdentifier, m =>
        m.format("#,##0").localId(localIdentifiers.numberOfRestaurants),
    ),
    newMeasure(totalSalesIdentifier, m => m.format("#,##0").localId(localIdentifiers.totalSales)),
    newArithmeticMeasure([localIdentifiers.totalSales, localIdentifiers.numberOfRestaurants], "ratio", m =>
        m.format("#,##0").title("$ Avg Restaurant Sales"),
    ),
];

const rows = [newAttribute(locationStateDisplayFormIdentifier)];

const drillableItems = [HeaderPredicateFactory.composedFromIdentifier(totalSalesIdentifier)];

const style = { height: 200 };

export const ArithmeticMeasureDrillingExample: React.FC = () => {
    const backend = useBackend();
    const [{ drillEvent }, setState] = useState({
        drillEvent: null,
    });

    const onDrill = _drillEvent =>
        setState({
            drillEvent: _drillEvent,
        });

    let renderDrillEvent;
    if (drillEvent) {
        const averageSales = drillEvent.drillContext.row[drillEvent.drillContext.columnIndex];
        renderDrillEvent = (
            <h3>
                You have clicked <span className="s-drill-value">{averageSales}</span>
            </h3>
        );
    }

    return (
        <div>
            {renderDrillEvent}
            <div style={style} className="s-table">
                <PivotTable
                    backend={backend}
                    workspace={projectId}
                    measures={measures}
                    rows={rows}
                    drillableItems={drillableItems}
                    onDrill={onDrill}
                />
            </div>
        </div>
    );
};
