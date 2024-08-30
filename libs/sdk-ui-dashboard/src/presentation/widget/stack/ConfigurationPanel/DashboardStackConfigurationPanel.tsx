// (C) 2024 GoodData Corporation

import React from "react";

import { addInsightToStackWidgetContent, useDashboardDispatch } from "../../../../model/index.js";
import { IStackWidget } from "@gooddata/sdk-model";
import { InsightList } from "../../../../presentation/insightList/InsightList.js";

interface IDashboardStackConfigurationPanelProps {
    widget: IStackWidget;
}

export const DashboardStackConfigurationPanel: React.FC<IDashboardStackConfigurationPanelProps> = (props) => {
    const dispatch = useDashboardDispatch();
    return (
        <>
            <div> Add insight </div>
            <InsightList
                height={300}
                width={275}
                searchAutofocus={true}
                onSelect={(insight) => {
                    dispatch(addInsightToStackWidgetContent(props.widget.ref, insight, ""));
                    console.log("OnSelect", insight);
                }}
            />

            <div> Move between insights </div>
            <div> Remove </div>
        </>
    );
};
