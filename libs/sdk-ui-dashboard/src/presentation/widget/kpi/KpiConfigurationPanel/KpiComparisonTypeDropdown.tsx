// (C) 2022 GoodData Corporation
import React from "react";
import { defineMessage, MessageDescriptor, useIntl } from "react-intl";
import {
    Dropdown,
    DropdownButton,
    DropdownList,
    IAlignPoint,
    SingleSelectListItem,
} from "@gooddata/sdk-ui-kit";
import { IKpiComparisonTypeComparison } from "@gooddata/sdk-model";
import { CONFIG_PANEL_INNER_WIDTH } from "./constants";

const alignPoints: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];

const messages: { [T in IKpiComparisonTypeComparison]: MessageDescriptor } = {
    lastYear: defineMessage({ id: "configurationPanel.comparisonTypeItems.samePeriodInPreviousYear" }),
    none: defineMessage({ id: "configurationPanel.comparisonTypeItems.noComparison" }),
    previousPeriod: defineMessage({ id: "configurationPanel.comparisonTypeItems.previousPeriod" }),
};

const placeholderMessage = defineMessage({ id: "configurationPanel.selectComparisonPlaceholder" });

const directionOrder: IKpiComparisonTypeComparison[] = ["previousPeriod", "lastYear", "none"];

interface IKpiComparisonTypeDropdownProps {
    comparisonTypeId: IKpiComparisonTypeComparison;
    onComparisonTypeChanged: (newComparisonTypeId: IKpiComparisonTypeComparison) => void;
}

export const KpiComparisonTypeDropdown: React.FC<IKpiComparisonTypeDropdownProps> = (props) => {
    const { comparisonTypeId, onComparisonTypeChanged } = props;
    const intl = useIntl();

    const buttonValue = comparisonTypeId
        ? intl.formatMessage(messages[comparisonTypeId])
        : intl.formatMessage(placeholderMessage);

    return (
        <Dropdown
            alignPoints={alignPoints}
            closeOnParentScroll
            closeOnMouseDrag
            className="s-compare_with_select"
            renderButton={({ isOpen, toggleDropdown }) => (
                <DropdownButton
                    title={buttonValue}
                    value={buttonValue}
                    isOpen={isOpen}
                    onClick={toggleDropdown}
                />
            )}
            renderBody={({ closeDropdown }) => (
                <DropdownList
                    className="configuration-dropdown comparison-list"
                    width={CONFIG_PANEL_INNER_WIDTH}
                    items={directionOrder}
                    renderItem={({ item }) => {
                        const selected = comparisonTypeId === item;

                        return (
                            <SingleSelectListItem
                                title={intl.formatMessage(messages[item])}
                                isSelected={selected}
                                onClick={() => {
                                    onComparisonTypeChanged(item);
                                    closeDropdown();
                                }}
                            />
                        );
                    }}
                />
            )}
        />
    );
};
