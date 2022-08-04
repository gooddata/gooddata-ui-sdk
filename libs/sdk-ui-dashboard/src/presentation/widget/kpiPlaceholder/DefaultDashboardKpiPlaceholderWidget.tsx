// (C) 2022 GoodData Corporation
import React from "react";
import invariant from "ts-invariant";

import { isKpiPlaceholderWidget } from "../../../widgets/placeholders/types";
import { DashboardItem, DashboardItemKpi } from "../../presentationComponents";
import { ConfigurationBubble } from "../common";
import { CustomDashboardWidgetComponent } from "../widget/types";
import { KpiPlaceholderConfigurationPanel } from "./KpiPlaceholderConfigurationPanel";

export const DefaultDashboardKpiPlaceholderWidget: CustomDashboardWidgetComponent = (props) => {
    const { widget, screen } = props;
    invariant(isKpiPlaceholderWidget(widget));

    return (
        <DashboardItem className="type-kpi is-selected" screen={screen}>
            <DashboardItemKpi
                renderBeforeContent={() => {
                    return (
                        <ConfigurationBubble>
                            <KpiPlaceholderConfigurationPanel widget={widget} />
                        </ConfigurationBubble>
                    );
                }}
                isSelected
            >
                {() => <div className="kpi-placeholder select-measure" />}
            </DashboardItemKpi>
        </DashboardItem>
    );
};
