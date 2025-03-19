// (C) 2024 GoodData Corporation

import React from "react";
import { IInsight } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";
import { InsightList } from "../../../insightList/index.js";
import { DashboardInsightSubmenuHeader } from "../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightSubmenuHeader.js";

interface IInsightPickerProps {
    onInsightSelect: (insight: IInsight) => void;
    onBack: () => void;
}

export const InsightPicker: React.FC<IInsightPickerProps> = ({ onInsightSelect, onBack }) => {
    const intl = useIntl();
    return (
        <div className="visualization-picker">
            <div className="configuration-panel-header" onClick={onBack}>
                <DashboardInsightSubmenuHeader
                    title={intl.formatMessage({
                        id: "visualizationSwitcherToolbar.visualizationsList.add",
                    })}
                    onHeaderClick={onBack}
                />
            </div>
            <div className="open-visualizations s-open-visualizations">
                <InsightList
                    height={270}
                    width={240}
                    searchAutofocus={true}
                    onSelect={(insight) => {
                        onInsightSelect(insight);
                    }}
                />
            </div>
        </div>
    );
};
