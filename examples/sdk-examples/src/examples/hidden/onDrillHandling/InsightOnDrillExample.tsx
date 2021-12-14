// (C) 2007-2021 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { measureIdentifier } from "@gooddata/sdk-model";
import { IDrillableItemIdentifier } from "@gooddata/sdk-ui";
import { useOnDrillExample } from "./useOnDrillExample";
import * as Md from "../../../md/full";

const drillableItems: IDrillableItemIdentifier = {
    identifier: measureIdentifier(Md.$TotalSales)!,
};

const style = { height: 300 };

export const InsightOnDrillExample: React.FC = () => {
    const { onDrill, renderDrillEvent } = useOnDrillExample();

    return (
        <div className="s-insightView-on-drill">
            <div style={style} className="s-insightView-chart">
                <InsightView
                    insight={Md.Insights.SalesOverTime}
                    onDrill={onDrill}
                    drillableItems={[drillableItems]}
                />
            </div>
            {renderDrillEvent}
        </div>
    );
};
