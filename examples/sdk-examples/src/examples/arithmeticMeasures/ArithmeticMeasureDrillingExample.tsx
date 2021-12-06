// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { HeaderPredicates, IDrillEvent } from "@gooddata/sdk-ui";
import { PivotTable } from "@gooddata/sdk-ui-pivot";
import { measureIdentifier } from "@gooddata/sdk-model";
import { Ldm, LdmExt } from "../../md";

const measures = [LdmExt.NrRestaurants, LdmExt.TotalSales2, LdmExt.arithmeticMeasure];

const rows = [Ldm.LocationState];

const drillableItems = [HeaderPredicates.composedFromIdentifier(measureIdentifier(LdmExt.TotalSales2)!)];

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
