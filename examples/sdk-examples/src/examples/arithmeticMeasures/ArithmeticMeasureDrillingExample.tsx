// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { HeaderPredicates, IDrillEvent } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { measureIdentifier, measureLocalId, modifyMeasure, newArithmeticMeasure } from "@gooddata/sdk-model";
import { Md } from "../../md";

const NrRestaurants = modifyMeasure(Md.NrRestaurants, (m) =>
    m.format("#,##0").localId("numberOfRestaurants"),
);
const TotalSales = modifyMeasure(Md.$TotalSales, (m) =>
    m.format("#,##0").alias("$ Total Sales").title("Total Sales").localId("totalSales"),
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
