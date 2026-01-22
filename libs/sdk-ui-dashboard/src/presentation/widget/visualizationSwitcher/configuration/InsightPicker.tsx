// (C) 2024-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type IInsight } from "@gooddata/sdk-model";
import { UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import { InsightList } from "../../../insightList/InsightList.js";

interface IInsightPickerProps {
    onInsightSelect: (insight: IInsight) => void;
    onBack: () => void;
}

export function InsightPicker({ onInsightSelect, onBack }: IInsightPickerProps) {
    const intl = useIntl();
    return (
        <div className="visualization-picker">
            <UiSubmenuHeader
                title={intl.formatMessage({
                    id: "visualizationSwitcherToolbar.visualizationsList.add",
                })}
                onBack={onBack}
                height="large"
            />
            <div className="open-visualizations s-open-visualizations">
                <InsightList
                    height={270}
                    width={240}
                    searchAutofocus
                    onSelect={(insight) => {
                        onInsightSelect(insight);
                    }}
                />
            </div>
        </div>
    );
}
