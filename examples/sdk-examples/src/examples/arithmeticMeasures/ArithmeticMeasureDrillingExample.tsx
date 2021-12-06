// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { HeaderPredicates, IDrillEvent } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { measureIdentifier } from "@gooddata/sdk-model";
import { Md, MdExt } from "../../md";

const measures = [MdExt.NrRestaurants, MdExt.TotalSales2, MdExt.arithmeticMeasure];

const rows = [Md.LocationState];

const drillableItems = [HeaderPredicates.composedFromIdentifier(measureIdentifier(MdExt.TotalSales2)!)];

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
