// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { HeaderPredicates, IDrillEvent } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { measureIdentifier, measureLocalId, modifyMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";
import * as Md from "../../md/full";

const NrRestaurants = modifyMeasure(Md.NrRestaurants, (m) => m.format("#,##0"));
const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales"),
);
const arithmeticMeasure = newArithmeticMeasure(
    [measureLocalId(TotalSales), measureLocalId(NrRestaurants)],
    "ratio",
    (m) => m.format("#,##0").title("$ Avg Restaurant Sales"),
);

const measures = [NrRestaurants, TotalSales, arithmeticMeasure];

const rows = [Md.LocationState];

const drillableItems = [HeaderPredicates.composedFromIdentifier(measureIdentifier(TotalSales)!)];

const style = { height: 200 };

export const ArithmeticMeasureDrillingExample: React.FC = () => {
    const [drillEvent, setDrillEvent] = useState<IDrillEvent>();

    const onDrill = (drillEvent: IDrillEvent) => setDrillEvent(drillEvent);

    let renderDrillEvent;
    if (drillEvent) {
        const averageSales = drillEvent.drillContext.row![drillEvent.drillContext.columnIndex!];
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
                    measures={measures}
                    rows={rows}
                    drillableItems={drillableItems}
                    onDrill={onDrill}
                />
            </div>
        </div>
    );
};
