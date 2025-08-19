// (C) 2007-2025 GoodData Corporation
import React from "react";

import { IntlShape, useIntl } from "react-intl";

import { IInsight, ObjRef } from "@gooddata/sdk-model";
import { Dropdown, DropdownButton } from "@gooddata/sdk-ui-kit";

import { InsightList } from "../../insightList/index.js";

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

export interface IInsightDropdownProps {
    insight?: IInsight;
    insightRef?: ObjRef;
    insightType?: string;

    onSelect: (targetItem: IInsight) => void;
}

export const InsightDropdown: React.FC<IInsightDropdownProps> = ({
    insight,
    insightRef,
    insightType,
    onSelect,
}) => {
    const intl = useIntl();
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
                            selectedRef={insightRef}
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
