// (C) 2007-2022 GoodData Corporation
import React, { useMemo } from "react";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";
import { ObjRef, IInsight, isInsight, insightVisualizationType } from "@gooddata/sdk-model";
import { IntlShape, useIntl } from "react-intl";
import { IDrillConfigItem, isDrillToInsightConfig } from "../../../../drill/types.js";
import { InsightList } from "../../../../insightList/index.js";
import { selectInsightsMap, useDashboardSelector } from "../../../../../model/index.js";

export interface IInsightDropdownProps {
    insightConfig: IDrillConfigItem;
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

    const { insight, insightType, insightRef } = useDrillToInsightData(insightConfig);
    const buttonText = getButtonValue(insight?.insight.title ?? "", intl, insightRef);

    return (
        <Dropdown
            className="s-report_select report-select"
            closeOnMouseDrag
            closeOnParentScroll
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
                            selectedRef={
                                isDrillToInsightConfig(insightConfig) ? insightConfig.insightRef : undefined
                            }
                            height={300}
                            width={275}
                            searchAutofocus={true}
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

function useDrillToInsightData(insightConfig: IDrillConfigItem): {
    insight?: IInsight;
    insightType?: string;
    insightRef?: ObjRef;
} {
    const insights = useDashboardSelector(selectInsightsMap);

    return useMemo(() => {
        if (isDrillToInsightConfig(insightConfig) && insightConfig.insightRef) {
            const insight = insights.get(insightConfig.insightRef);

            if (isInsight(insight)) {
                const insightType = insightVisualizationType(insight);
                return {
                    insight,
                    insightRef: insightConfig.insightRef,
                    insightType: insightType,
                };
            }
        }
        return {};
    }, [insightConfig, insights]);
}
