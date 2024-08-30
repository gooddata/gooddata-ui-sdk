// (C) 2022-2024 GoodData Corporation
import React from "react";
import { ConfigurationBubble } from "../common/index.js";
import { useWidgetSelection } from "../../../model/index.js";
import { widgetRef } from "@gooddata/sdk-model";
import { DashboardStackConfigurationPanel } from "./ConfigurationPanel/DashboardStackConfigurationPanel.js";
import { IDashboardStackProps } from "./types.js";
// import { DashboardInsight } from "../insight/DashboardInsight.js";

/**
 * @internal
 */
// export const EditModeDashboardStack: React.FC<Omit<IDashboardStackProps, "insight" | "widget">> = (props): JSX.Element => {
export const EditModeDashboardStack: React.FC<IDashboardStackProps> = (props): JSX.Element => {
    const { hasConfigPanelOpen } = useWidgetSelection(widgetRef(props.stack));

    return (
        <>
            {hasConfigPanelOpen && (
                <ConfigurationBubble alignTo={".gd-stack-widget-wrapper"}>
                    <DashboardStackConfigurationPanel widget={props.stack} />
                </ConfigurationBubble>
            )}

            {props.stack.widgets.length === 0 && <div>No visualization in stack</div>}

            {/* {props.stack.widgets && props.stack.widgets.length > 0 && (
            // <DashboardInsight widget={props.stack.widgets[0]} insight={props.stack.insights[0] }{...props}/>
            <DashboardInsight {...props}/>
        )} */}
        </>
    );
};
