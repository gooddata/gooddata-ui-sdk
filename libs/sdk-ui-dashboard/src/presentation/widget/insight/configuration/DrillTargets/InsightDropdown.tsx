// (C) 2007-2022 GoodData Corporation
import React from "react";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";
import { ObjRef, IInsight, isInsight, insightVisualizationUrl } from "@gooddata/sdk-model";
import { IntlShape, useIntl } from "react-intl";
import { IDrillToInsightConfig } from "../../../../drill/types";
import { InsightList } from "../../../../insightList";
import { selectInsightByRef, useDashboardSelector } from "../../../../../model";
import invariant from "ts-invariant";

export interface IInsightDropdownProps {
    insightConfig: IDrillToInsightConfig;
    onSelect: (targetItem: IInsight) => void;
}

const DROPDOWN_ALIGN_POINTS = [
    {
        align: "bl tl",
        offset: {
            x: 0,
            y: 4,
        },
    },
    {
        align: "tl bl",
        offset: {
            x: 0,
            y: -4,
        },
    },
];

function getButtonValue(title: string, intl: IntlShape, ref?: ObjRef) {
    if (!ref) {
        return intl.formatMessage({ id: "configurationPanel.drillConfig.selectInsight" });
    }

    return title || intl.formatMessage({ id: "loading" });
}

export const InsightDropdown: React.FC<IInsightDropdownProps> = ({ insightConfig, onSelect }) => {
    const intl = useIntl();

    const insight = useDashboardSelector(selectInsightByRef(insightConfig.insightRef));
    invariant(isInsight(insight), "must be insight");
    const buttonText = getButtonValue(insight.insight.title, intl, insightConfig.insightRef);

    const insightUrl = insightVisualizationUrl(insight);
    const insightType = insightUrl?.split(":")[1];

    return (
        <Dropdown
            className="s-report_select report-select"
            closeOnMouseDrag
            alignPoints={DROPDOWN_ALIGN_POINTS}
            renderButton={({ isOpen, toggleDropdown }) => (
                <DropdownButton
                    value={buttonText}
                    onClick={toggleDropdown}
                    isOpen={isOpen}
                    isSmall={false}
                    iconLeft={insightType ? `gd-vis-type-${insightType}` : undefined}
                    className="gd-button-small s-visualization-button-target-insight"
                />
            )}
            renderBody={({ closeDropdown }) => {
                return (
                    <div className="open-visualizations s-open-visualizations">
                        <InsightList
                            selectedRef={insightConfig.insightRef}
                            height={200}
                            onSelect={(insight) => {
                                onSelect(insight);
                                closeDropdown();
                            }}
                        />
                    </div>
                );
            }}
        />
    );
};
